"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  type Candle,
  type Trade,
  type SymbolTick,
  type AccountSnapshot,
  type ConnectionStatus,
  type TradeType,
} from "./types";
import { INSTRUMENTS, getSpec, DEFAULT_SYMBOL, binanceInterval } from "./instruments";
import { fetchCandles, fetchSpotPrice } from "./binance-feed";
import { openKlineStream } from "./binance-ws";
import { useMasterData } from "./master-data";
import type { Trade as ProfileTrade } from "./profile";

// ====================================================================
//  LIVE FEED HOOK — REAL DATA ONLY (no simulation / no mock)
//  --------------------------------------------------------------------
//  Architecture:
//    • HISTORY  → real OHLC from Binance klines REST (crypto) or
//                 built from real REST spot quotes (FX / metals).
//    • LIVE     → Binance WebSocket kline stream for the active symbol
//                 (auto-reconnect, low-latency). For FX/metals symbols
//                 not on Binance we poll the real spot REST endpoint.
//    • TRADES   → real MASTER MT5 account (useMasterData).
//
//  NOTHING is randomly generated. If a real source is unreachable we
//  show an explicit "connecting / offline" status — never fake candles.
// ====================================================================

// ---------- timeframes ----------
export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN";

export const TIMEFRAMES: { id: Timeframe; label: string; ms: number }[] = [
  { id: "M1", label: "M1", ms: 60_000 },
  { id: "M5", label: "M5", ms: 5 * 60_000 },
  { id: "M15", label: "M15", ms: 15 * 60_000 },
  { id: "M30", label: "M30", ms: 30 * 60_000 },
  { id: "H1", label: "H1", ms: 60 * 60_000 },
  { id: "H4", label: "H4", ms: 4 * 60 * 60_000 },
  { id: "D1", label: "D1", ms: 24 * 60 * 60_000 },
  { id: "W1", label: "W1", ms: 7 * 24 * 60 * 60_000 },
  // MN — calendar month (~30.44 days); used for bar-rollover math
  { id: "MN", label: "MN", ms: 30 * 24 * 60 * 60_000 },
];

const HISTORY_BARS = 200;

// ---------- convert master positions/trades → chart Trade markers ----------
function masterTradeToChartTrade(t: ProfileTrade): Trade {
  return {
    id: t.id,
    ticket: Number(t.id) || 0,
    symbol: t.symbol,
    type: (t.side === "BUY" ? "BUY" : "SELL") as TradeType,
    volume: t.volume,
    entryPrice: t.openPrice,
    stopLoss: 0,
    takeProfit: 0,
    openTime: t.openTime ? new Date(t.openTime).getTime() : Date.now(),
    closeTime: t.closeTime ? new Date(t.closeTime).getTime() : undefined,
    closePrice: t.closePrice,
    profit: t.pnl,
    closeReason: undefined,
    status: t.status,
  };
}

/** Append/replace the last forming candle; roll a new bar when needed. */
function applyTickToCandles(candles: Candle[], tick: Candle, tfMs: number): Candle[] {
  if (!candles.length) return [tick];
  const last = candles[candles.length - 1];
  // same bar → update the forming candle
  if (tick.time === last.time) {
    const merged: Candle = {
      time: last.time,
      open: last.open,
      high: Math.max(last.high, tick.high),
      low: Math.min(last.low, tick.low),
      close: tick.close,
      volume: (last.volume ?? 0) + (tick.volume ?? 0),
    };
    return [...candles.slice(0, -1), merged];
  }
  // newer bar → append (new candle created automatically)
  if (tick.time > last.time) {
    const next = [...candles, tick];
    if (next.length > HISTORY_BARS + 20) next.shift();
    return next;
  }
  // older bar → ignore
  return candles;
}

export function useLiveFeed() {
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [timeframe, setTimeframe] = useState<Timeframe>("M5");
  const tfMs = useMemo(
    () => TIMEFRAMES.find((t) => t.id === timeframe)?.ms ?? 5 * 60_000,
    [timeframe]
  );

  // ---- REAL master data (trades + account) ----
  const master = useMasterData();
  const openTradesFromMaster = useMemo(
    () => master.positions.map((p) => masterTradeToChartTrade({
      id: String(p.ticket),
      symbol: p.symbol,
      side: p.type,
      volume: p.volume,
      openPrice: p.openPrice,
      closePrice: p.currentPrice,
      openTime: p.openTime,
      pnl: p.profit,
      status: "OPEN" as const,
    })),
    [master.positions]
  );
  const closedTradesFromMaster = useMemo(
    () => master.recentTrades.map((t) => masterTradeToChartTrade({
      id: String(t.ticket),
      symbol: t.symbol,
      side: t.type,
      volume: t.volume,
      openPrice: t.openPrice,
      closePrice: t.closePrice,
      openTime: t.openTime,
      closeTime: t.closeTime,
      pnl: t.profit,
      status: "CLOSED" as const,
    })),
    [master.recentTrades]
  );
  const allTrades = useMemo(
    () => [...openTradesFromMaster, ...closedTradesFromMaster],
    [openTradesFromMaster, closedTradesFromMaster]
  );

  // real account snapshot from master
  const account: AccountSnapshot = useMemo(() => ({
    balance: master.balance?.balance ?? 0,
    equity: master.balance?.equity ?? 0,
    margin: master.balance?.margin ?? 0,
    freeMargin: master.balance?.freeMargin ?? 0,
    marginLevel: master.balance?.marginLevel ?? 0,
    floatingPnl: master.balance?.floatingPnl ?? 0,
    time: Date.now(),
  }), [master.balance]);

  // ---- real candle state (per symbol) ----
  const [candlesBySym, setCandlesBySym] = useState<Record<string, Candle[]>>({});
  // seed an empty entry per symbol so the watchlist has prices early
  const [prices, setPrices] = useState<Record<string, SymbolTick>>(() => {
    const m: Record<string, SymbolTick> = {};
    for (const s of INSTRUMENTS) {
      m[s.symbol] = {
        symbol: s.symbol,
        price: s.base,
        bid: s.base - (s.spreadPips * s.pip) / 2,
        ask: s.base + (s.spreadPips * s.pip) / 2,
        spread: s.spreadPips,
        changePct: 0,
        prevPrice: s.base,
        time: Date.now(),
      };
    }
    return m;
  });
  const sessionOpenRef = useRef<Record<string, number>>({});

  const [connection, setConnection] = useState<ConnectionStatus>({
    state: "connecting",
    latencyMs: 0,
    lastMessage: 0,
  });

  // live price helper that also updates the watchlist tick
  const pushPrice = useCallback((sym: string, price: number) => {
    const spec = getSpec(sym);
    const sessionOpen = sessionOpenRef.current[sym] ?? price;
    const changePct = sessionOpen > 0 ? ((price - sessionOpen) / sessionOpen) * 100 : 0;
    setPrices((prev) => {
      const p = prev[sym];
      const prevPrice = p?.price ?? price;
      return {
        ...prev,
        [sym]: {
          symbol: sym,
          price,
          bid: price - (spec.spreadPips * spec.pip) / 2,
          ask: price + (spec.spreadPips * spec.pip) / 2,
          spread: spec.spreadPips,
          changePct,
          prevPrice,
          time: Date.now(),
        },
      };
    });
  }, []);

  // ==================================================================
  // 1. Load REAL historical OHLC for the active symbol/timeframe
  // ==================================================================
  useEffect(() => {
    let cancelled = false;
    const spec = getSpec(symbol);
    const interval = binanceInterval(timeframe);

    setCandlesBySym((prev) => (prev[symbol] ? prev : { ...prev, [symbol]: [] }));
    setConnection((c) => ({ ...c, state: "connecting" }));

    (async () => {
      let candles: Candle[] | null = null;

      if (spec.binance && interval) {
        // ---- Binance (crypto) → real OHLC history ----
        candles = await fetchCandles(spec.binance, timeframe, HISTORY_BARS);
      }
      if (!candles || candles.length < 5) {
        // ---- FX / metals / fallback → build bars from real REST spot ----
        candles = await buildHistoryFromSpot(symbol, tfMs, HISTORY_BARS, spec.binance);
      }

      if (cancelled || !candles || candles.length === 0) {
        if (!cancelled) setConnection((c) => ({ ...c, state: "reconnecting" }));
        return;
      }

      // anchor session open for changePct
      sessionOpenRef.current[symbol] = candles[0].open;
      const lastClose = candles[candles.length - 1].close;

      setCandlesBySym((prev) => ({ ...prev, [symbol]: candles as Candle[] }));
      pushPrice(symbol, lastClose);
      setConnection({
        state: "live",
        latencyMs: 0,
        lastMessage: Date.now(),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, tfMs, pushPrice]);

  // ==================================================================
  // 2. Stream REAL live klines via Binance WebSocket (active symbol)
  //    For FX/metals not on Binance, poll the real spot REST endpoint.
  // ==================================================================
  useEffect(() => {
    const spec = getSpec(symbol);
    const interval = binanceInterval(timeframe);
    let closeWs: (() => void) | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let lastMsgAt = 0;

    const markLive = () => {
      lastMsgAt = Date.now();
      setConnection({ state: "live", latencyMs: 0, lastMessage: lastMsgAt });
    };

    if (spec.binance && interval) {
      // ---- WebSocket path (crypto) ----
      closeWs = openKlineStream({
        binanceSymbol: spec.binance,
        interval,
        onKline: ({ candle }) => {
          setCandlesBySym((prev) => ({
            ...prev,
            [symbol]: applyTickToCandles(prev[symbol] ?? [], candle, tfMs),
          }));
          pushPrice(symbol, candle.close);
          markLive();
        },
        onStatus: (status) => {
          if (status === "connecting" || status === "reconnecting")
            setConnection((c) => ({ ...c, state: "reconnecting" }));
          else if (status === "open") setConnection({ state: "live", latencyMs: 0, lastMessage: Date.now() });
        },
      });
    } else {
      // ---- REST polling path (FX / metals) — real spot quotes ----
      const poll = async () => {
        const px = await fetchSpotPriceSafe(symbol);
        if (px != null && px > 0) {
          setCandlesBySym((prev) => {
            const bars = prev[symbol] ?? [];
            const now = Date.now();
            const barStart = Math.floor(now / tfMs) * tfMs;
            const tick: Candle = { time: barStart, open: px, high: px, low: px, close: px };
            return { ...prev, [symbol]: applyTickToCandles(bars, tick, tfMs) };
          });
          pushPrice(symbol, px);
          markLive();
        }
      };
      poll();
      pollTimer = setInterval(poll, 4000);
    }

    return () => {
      if (closeWs) closeWs();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [symbol, timeframe, tfMs, pushPrice]);

  return {
    symbol,
    setSymbol,
    timeframe,
    setTimeframe,
    tfMs,
    timeframes: TIMEFRAMES,
    candles: candlesBySym[symbol] ?? [],
    tick: prices[symbol],
    allTicks: prices,
    trades: allTrades,
    openTrades: openTradesFromMaster,
    closedTrades: closedTradesFromMaster,
    account,
    connection,
    masterConnected: master.connected,
    masterLogin: master.login,
    // closeTrade disabled — trades come from the live MT5 master account
    closeTrade: () => {},
  };
}

// ====================================================================
//  Helpers — real spot-based history for FX / metals
//  (Binance lists EURUSDT etc., but metals/indices use Yahoo via proxy)
// ====================================================================

/** Fetch the current real spot price for any symbol (best-effort). */
async function fetchSpotPriceSafe(symbol: string): Promise<number | null> {
  const spec = getSpec(symbol);
  if (spec.binance) {
    return fetchSpotPrice(spec.binance);
  }
  // FX / metals → reuse the real forex/metals REST endpoints
  try {
    const { fetchAllRealPrices } = await import("./live-prices");
    const real = await fetchAllRealPrices();
    const px = real?.[symbol];
    return px && px > 0 ? px : null;
  } catch {
    return null;
  }
}

/**
 * Build a candle history for symbols that have no Binance klines by
 * fetching the current real spot price. Metals/indices (XAUUSD etc.)
 * are not listed on Binance, so there is no kline REST for them.
 *
 * NOTE: We never fabricate OHLC. When historical klines are genuinely
 * unavailable (e.g. a CORS proxy is down), we return a minimal real
 * series consisting of the verified live spot price so the chart still
 * shows a real price line rather than simulated wicks. As real ticks
 * arrive they form the bar naturally.
 */
async function buildHistoryFromSpot(
  symbol: string,
  tfMs: number,
  _bars: number,
  binance?: string | null,
): Promise<Candle[]> {
  const now = Date.now();
  const spec = getSpec(symbol);

  // Try Binance klines once more (some FX pairs ARE listed, e.g. EURUSDT)
  if (binance) {
    const k = await fetchCandles(binance, "M5", 200);
    if (k && k.length >= 5) return k;
  }

  // Real spot quote (forex / metals / crypto-coingecko)
  const spot = await fetchSpotPriceSafe(symbol);
  if (spot == null || spot <= 0) return [];

  // Single real bar — honest representation: we only know the live price.
  const barStart = Math.floor(now / tfMs) * tfMs;
  return [{ time: barStart, open: spot, high: spot, low: spot, close: spot, volume: spec.binance ? undefined : undefined }];
}
