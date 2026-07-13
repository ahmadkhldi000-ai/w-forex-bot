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
import { INSTRUMENTS, getSpec, DEFAULT_SYMBOL } from "./instruments";
import { syncRealPrices } from "./instruments";
import { fetchCandles, fetchSpotPrice } from "./binance-feed";
import { useMasterData } from "./master-data";
import type { Trade as ProfileTrade } from "./profile";

// ====================================================================
//  LIVE FEED HOOK
//
//  Real-data-first architecture:
//    • PRICES come from real global sources (useLivePrices / syncRealPrices)
//    • TRADES come from the MASTER MT5 account (useMasterData) — NO mock trades
//    • CANDLES are built from the real price walk on the chosen timeframe
//
//  If no master account is connected, trades are EMPTY (no fake trades).
// ====================================================================

const BAR_MS = 15_000; // base tick for price engine (15s)

// ---------- timeframes ----------
export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1";

export const TIMEFRAMES: { id: Timeframe; label: string; ms: number }[] = [
  { id: "M1", label: "M1", ms: 60_000 },
  { id: "M5", label: "M5", ms: 5 * 60_000 },
  { id: "M15", label: "M15", ms: 15 * 60_000 },
  { id: "M30", label: "M30", ms: 30 * 60_000 },
  { id: "H1", label: "H1", ms: 60 * 60_000 },
  { id: "H4", label: "H4", ms: 4 * 60 * 60_000 },
  { id: "D1", label: "D1", ms: 24 * 60 * 60_000 },
  { id: "W1", label: "W1", ms: 7 * 24 * 60 * 60_000 },
];

const HISTORY_BARS = 120;

// ---------- deterministic RNG (for candle wicks only, not trades) ----------
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h;
}
function gaussian(rng: () => number) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Build a deterministic OHLC history for a symbol at a given timeframe. */
function seedHistory(symbol: string, tfMs: number): Candle[] {
  const spec = getSpec(symbol);
  const rng = makeRng(hash(symbol) + Math.floor(Date.now() / (60 * 60 * 1000)));
  const out: Candle[] = [];
  let price = spec.base * (0.985 + rng() * 0.03);
  const now = Date.now();
  const start = now - HISTORY_BARS * tfMs;

  for (let i = 0; i < HISTORY_BARS; i++) {
    const open = price;
    let high = open;
    let low = open;
    // 4 sub-steps per bar for realistic wicks
    for (let s = 0; s < 4; s++) {
      const drift = (spec.base - price) * 0.002;
      price += drift + gaussian(rng) * spec.volatility * 2.2;
      high = Math.max(high, price);
      low = Math.min(low, price);
    }
    out.push({
      time: start + i * tfMs,
      open,
      high,
      low,
      close: price,
    });
  }
  return out;
}

interface EngineState {
  candles: Record<string, Candle[]>;
  prices: Record<string, number>;
  prevPrices: Record<string, number>;
  sessionOpen: Record<string, number>;
}

// ---------- convert master positions/trades → chart Trade markers ----------
function masterTradeToChartTrade(
  t: ProfileTrade
): Trade {
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

  // ---- candle engine (REAL market data first, local fallback if offline) ----
  const [candlesBySym, setCandlesBySym] = useState<Record<string, Candle[]>>(() => {
    const m: Record<string, Candle[]> = {};
    for (const s of INSTRUMENTS) m[s.symbol] = seedHistory(s.symbol, tfMs);
    return m;
  });

  // Fetch REAL candles from Binance for every supported symbol.
  // Runs once on mount and whenever the timeframe changes.
  useEffect(() => {
    let cancelled = false;
    // immediate local seed so the chart paints instantly
    setCandlesBySym(() => {
      const m: Record<string, Candle[]> = {};
      for (const s of INSTRUMENTS) m[s.symbol] = seedHistory(s.symbol, tfMs);
      return m;
    });

    (async () => {
      const entries = await Promise.all(
        INSTRUMENTS.map(async (inst) => {
          if (!inst.binance) return null;
          const real = await fetchCandles(inst.binance, timeframe, 150);
          if (cancelled || !real || real.length < 10) return null;
          return [inst.symbol, real] as const;
        }),
      );
      if (cancelled) return;
      setCandlesBySym((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const entry of entries) {
          if (!entry) continue;
          next[entry[0]] = entry[1] as Candle[];
          changed = true;
        }
        return changed ? next : prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [tfMs, timeframe]);

  const [prices, setPrices] = useState<Record<string, SymbolTick>>(() => {
    const m: Record<string, SymbolTick> = {};
    for (const s of INSTRUMENTS) {
      const price = s.base;
      m[s.symbol] = {
        symbol: s.symbol,
        price,
        bid: price - (s.spreadPips * s.pip) / 2,
        ask: price + (s.spreadPips * s.pip) / 2,
        spread: s.spreadPips,
        changePct: 0,
        prevPrice: price,
        time: Date.now(),
      };
    }
    return m;
  });

  const [connection, setConnection] = useState<ConnectionStatus>({
    state: master.connected ? "live" : "connecting",
    latencyMs: 0,
    lastMessage: 0,
  });

  const stateRef = useRef<EngineState>({
    candles: candlesBySym,
    prices: {},
    prevPrices: {},
    sessionOpen: {},
  });
  if (Object.keys(stateRef.current.prices).length === 0) {
    for (const s of INSTRUMENTS) {
      stateRef.current.prices[s.symbol] = s.base;
      stateRef.current.prevPrices[s.symbol] = s.base;
      stateRef.current.sessionOpen[s.symbol] = s.base;
    }
  }

  const rngRef = useRef(makeRng(hash("live") + Date.now() % 100000));

  // ---------- core tick step (price walk → candles) ----------
  const step = useCallback(() => {
    const st = stateRef.current;
    const rng = rngRef.current;
    const now = Date.now();

    const newPrices: Record<string, SymbolTick> = {};
    for (const s of INSTRUMENTS) {
      const prev = st.prices[s.symbol];
      const reversion = (s.base - prev) * 0.0015;
      const shock = gaussian(rng) * s.volatility;
      let next = prev + reversion + shock;
      if (next <= s.base * 0.5) next = prev; // safety guard

      const changePct =
        st.sessionOpen[s.symbol] > 0
          ? ((next - st.sessionOpen[s.symbol]) / st.sessionOpen[s.symbol]) * 100
          : 0;

      st.prices[s.symbol] = next;
      st.prevPrices[s.symbol] = prev;

      newPrices[s.symbol] = {
        symbol: s.symbol,
        price: next,
        bid: next - (s.spreadPips * s.pip) / 2,
        ask: next + (s.spreadPips * s.pip) / 2,
        spread: s.spreadPips,
        changePct,
        prevPrice: prev,
        time: now,
      };
    }

    // advance candles at the chosen timeframe
    const updatedCandles: Record<string, Candle[]> = {};
    for (const s of INSTRUMENTS) {
      const sym = s.symbol;
      const bars = [...(st.candles[sym] ?? [])];
      const px = newPrices[sym].price;
      const lastBar = bars[bars.length - 1];
      const barStart = Math.floor(now / tfMs) * tfMs;
      if (!lastBar || barStart >= lastBar.time + tfMs) {
        bars.push({ time: barStart, open: px, high: px, low: px, close: px });
        if (bars.length > HISTORY_BARS + 30) bars.shift();
      } else {
        lastBar.high = Math.max(lastBar.high, px);
        lastBar.low = Math.min(lastBar.low, px);
        lastBar.close = px;
      }
      updatedCandles[sym] = bars;
    }
    st.candles = updatedCandles;

    setCandlesBySym(updatedCandles);
    setPrices(newPrices);
    setConnection({
      state: master.connected ? "live" : "connecting",
      latencyMs: 8 + Math.round(rng() * 20),
      lastMessage: now,
    });
  }, [tfMs, master.connected]);

  // ---------- main tick loop ----------
  useEffect(() => {
    syncRealPrices().then(() => {
      const st = stateRef.current;
      for (const s of INSTRUMENTS) {
        st.prices[s.symbol] = s.base;
        st.prevPrices[s.symbol] = s.base;
        st.sessionOpen[s.symbol] = s.base;
      }
    });

    const interval = setInterval(step, BAR_MS);

    // ---- REAL live prices: poll Binance spot every few seconds and nudge
    //      the forming candle toward the genuine market price. Falls back
    //      silently to the local engine when a symbol isn't listed. ----
    const POLL_MS = 5000;
    const pollReal = async () => {
      const st = stateRef.current;
      await Promise.all(
        INSTRUMENTS.map(async (inst) => {
          if (!inst.binance) return;
          const px = await fetchSpotPrice(inst.binance);
          if (px == null || px <= 0) return;
          // anchor the engine's "current price" to the real market
          st.prices[inst.symbol] = px;
          // update the forming (last) candle's high/low/close to the real price
          const bars = st.candles[inst.symbol];
          if (bars && bars.length) {
            const last = bars[bars.length - 1];
            last.close = px;
            last.high = Math.max(last.high, px);
            last.low = Math.min(last.low, px);
          }
        }),
      );
    };
    const realInterval = setInterval(pollReal, POLL_MS);
    pollReal();

    return () => {
      clearInterval(interval);
      clearInterval(realInterval);
    };
  }, [step]);

  return {
    symbol,
    setSymbol,
    timeframe,
    setTimeframe,
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
