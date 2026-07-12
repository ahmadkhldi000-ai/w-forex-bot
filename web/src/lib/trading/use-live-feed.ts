"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  type Candle,
  type Trade,
  type SymbolTick,
  type AccountSnapshot,
  type ConnectionStatus,
  type TradeType,
  type CloseReason,
} from "./types";
import { INSTRUMENTS, getSpec, DEFAULT_SYMBOL, syncRealPrices } from "./instruments";

// ====================================================================
//  LIVE FEED HOOK
//
//  This is a self-contained simulation engine that emits exactly the
//  same shape of data a real socket.io feed would push. To switch to a
//  live MT5 bridge later, replace the internals of this hook with:
//
//    const socket = io(SERVER_URL, { auth: { token } });
//    socket.on("mt5:event", handler);
//
//  The consuming components do not need to change.
// ====================================================================

const BAR_MS = 15_000; // 15-second candles (good for a "live" feel)
const HISTORY_BARS = 90;
const TICK_MS = 1000;
const RISK_PER_TRADE_PCT = 1.0;
const START_BALANCE = 25_000;

// Seeded RNG so history is stable within a session
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gaussian(rng: () => number) {
  // Box–Muller
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Build a deterministic OHLC history ending "now" */
function seedHistory(symbol: string): Candle[] {
  const spec = getSpec(symbol);
  const rng = makeRng(hash(symbol) + Math.floor(Date.now() / (60 * 60 * 1000)));
  const out: Candle[] = [];
  let price = spec.base * (0.985 + rng() * 0.03);
  const now = Date.now();
  const start = now - HISTORY_BARS * BAR_MS;

  for (let i = 0; i < HISTORY_BARS; i++) {
    const open = price;
    let high = open;
    let low = open;
    // 4 sub-steps per bar for realistic wicks
    for (let s = 0; s < 4; s++) {
      const drift = (spec.base - price) * 0.002; // mild mean reversion
      price += drift + gaussian(rng) * spec.volatility * 2.2;
      high = Math.max(high, price);
      low = Math.min(low, price);
    }
    out.push({ time: start + i * BAR_MS, open, high, low, close: price });
  }
  return out;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

let TICKET_SEQ = 504200;

interface EngineState {
  candles: Record<string, Candle[]>;
  prices: Record<string, number>; // last price per symbol
  prevPrices: Record<string, number>;
  sessionOpen: Record<string, number>;
  trades: Trade[];
  balance: number;
  latency: number;
}

export function useLiveFeed() {
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [candlesBySym, setCandlesBySym] = useState<Record<string, Candle[]>>(() => {
    const m: Record<string, Candle[]> = {};
    for (const s of INSTRUMENTS) m[s.symbol] = seedHistory(s.symbol);
    return m;
  });
  const [prices, setPrices] = useState<Record<string, SymbolTick>>(() => {
    const m: Record<string, SymbolTick> = {};
    for (const s of INSTRUMENTS) {
      const last = m[s.symbol];
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
  const [trades, setTrades] = useState<Trade[]>(() => seedTrades());
  const [account, setAccount] = useState<AccountSnapshot>({
    balance: START_BALANCE,
    equity: START_BALANCE,
    margin: 0,
    freeMargin: START_BALANCE,
    marginLevel: 0,
    floatingPnl: 0,
    time: Date.now(),
  });
  const [connection, setConnection] = useState<ConnectionStatus>({
    state: "connecting",
    latencyMs: 0,
    lastMessage: 0,
  });

  const stateRef = useRef<EngineState>({
    candles: candlesBySym,
    prices: {},
    prevPrices: {},
    sessionOpen: {},
    trades,
    balance: START_BALANCE,
    latency: 12,
  });

  // init refs
  if (Object.keys(stateRef.current.prices).length === 0) {
    for (const s of INSTRUMENTS) {
      stateRef.current.prices[s.symbol] = s.base;
      stateRef.current.prevPrices[s.symbol] = s.base;
      stateRef.current.sessionOpen[s.symbol] = s.base;
    }
  }

  const rngRef = useRef(makeRng(hash("live") + Date.now() % 100000));

  // ---------- core tick step ----------
  const step = useCallback(() => {
    const st = stateRef.current;
    const rng = rngRef.current;
    const now = Date.now();

    // advance each symbol's price via GBM-ish walk
    const newPrices: Record<string, SymbolTick> = {};
    for (const s of INSTRUMENTS) {
      const prev = st.prices[s.symbol];
      const reversion = (s.base - prev) * 0.0015;
      const shock = gaussian(rng) * s.volatility;
      let next = prev + reversion + shock;
      if (next <= s.base * 0.5) next = prev; // safety guard
      st.prevPrices[s.symbol] = prev;
      st.prices[s.symbol] = next;
      const spread = s.spreadPips * s.pip;
      const sessionOpen = st.sessionOpen[s.symbol];
      newPrices[s.symbol] = {
        symbol: s.symbol,
        price: next,
        bid: next - spread / 2,
        ask: next + spread / 2,
        spread: s.spreadPips,
        changePct: ((next - sessionOpen) / sessionOpen) * 100,
        prevPrice: prev,
        time: now,
      };

      // update current candle for that symbol
      const bars = st.candles[s.symbol];
      const lastBar = bars[bars.length - 1];
      if (now - lastBar.time >= BAR_MS) {
        // open a new bar
        bars.push({ time: lastBar.time + BAR_MS, open: next, high: next, low: next, close: next });
        if (bars.length > HISTORY_BARS + 30) bars.shift();
      } else {
        lastBar.high = Math.max(lastBar.high, next);
        lastBar.low = Math.min(lastBar.low, next);
        lastBar.close = next;
      }
    }

    // ---------- trading logic: monitor open trades for SL/TP ----------
    let updatedTrades = st.trades;
    let balanceChanged = false;
    const closedThisTick: Trade[] = [];
    updatedTrades = updatedTrades.map((t) => {
      if (t.status !== "OPEN") return t;
      const px = newPrices[t.symbol].price;
      const hit =
        (t.type === "BUY" && (px <= t.stopLoss || px >= t.takeProfit)) ||
        (t.type === "SELL" && (px >= t.stopLoss || px <= t.takeProfit));
      if (!hit) return t;
      const reason: CloseReason = px <= t.stopLoss && t.type === "BUY" ? "STOP_LOSS"
        : px >= t.takeProfit && t.type === "BUY" ? "TAKE_PROFIT"
        : px >= t.stopLoss && t.type === "SELL" ? "STOP_LOSS"
        : "TAKE_PROFIT";
      const spec = getSpec(t.symbol);
      const dir = t.type === "BUY" ? 1 : -1;
      const profit = (px - t.entryPrice) * dir * t.volume * (spec.category === "FX" && t.symbol === "USDJPY" ? 1 : 1) * contractScale(t.symbol);
      st.balance += profit;
      balanceChanged = true;
      const closed: Trade = {
        ...t,
        status: "CLOSED",
        closePrice: px,
        closeTime: now,
        profit,
        closeReason: reason,
      };
      closedThisTick.push(closed);
      return closed;
    });

    if (closedThisTick.length) {
      st.trades = updatedTrades;
    }

    // ---------- periodically open new trades (auto-strategy) ----------
    // open a trade ~ every 9-16 ticks if few open positions
    const openCount = updatedTrades.filter((t) => t.status === "OPEN").length;
    if (openCount < 4 && rng() < 0.08) {
      const sym = INSTRUMENTS[Math.floor(rng() * INSTRUMENTS.length)];
      const type: TradeType = rng() > 0.5 ? "BUY" : "SELL";
      const px = newPrices[sym.symbol].price;
      const slPips = 12 + rng() * 26;
      const tpPips = slPips * (1.4 + rng() * 1.1);
      const dir = type === "BUY" ? 1 : -1;
      const newTrade: Trade = {
        id: `T${TICKET_SEQ}`,
        ticket: TICKET_SEQ++,
        symbol: sym.symbol,
        type,
        volume: sym.category === "Crypto" ? 0.05 : sym.category === "Metal" ? 0.2 : 0.5 + Math.round(rng() * 3) * 0.5,
        entryPrice: px,
        stopLoss: px - dir * slPips * sym.pip,
        takeProfit: px + dir * tpPips * sym.pip,
        openTime: now,
        status: "OPEN",
      };
      updatedTrades = [newTrade, ...updatedTrades].slice(0, 40);
      st.trades = updatedTrades;
    }

    // ---------- recompute account ----------
    let floating = 0;
    let usedMargin = 0;
    for (const t of updatedTrades) {
      if (t.status !== "OPEN") continue;
      const px = newPrices[t.symbol].price;
      const spec = getSpec(t.symbol);
      const dir = t.type === "BUY" ? 1 : -1;
      floating += (px - t.entryPrice) * dir * t.volume * contractScale(t.symbol);
      usedMargin += (t.volume * px * contractScale(t.symbol)) / 100;
    }
    const equity = st.balance + floating;

    // ---------- push state to React ----------
    setPrices(newPrices);
    setCandlesBySym((prev) => {
      // shallow clone only the changed arrays to keep referential freshness for chart
      const out: Record<string, Candle[]> = {};
      for (const s of INSTRUMENTS) out[s.symbol] = prev[s.symbol] === st.candles[s.symbol] ? [...st.candles[s.symbol]] : st.candles[s.symbol];
      // ensure the active symbol array is fresh
      out[symbol] = [...st.candles[symbol]];
      return out;
    });
    setTrades(updatedTrades);
    setAccount({
      balance: st.balance,
      equity,
      margin: usedMargin,
      freeMargin: equity - usedMargin,
      marginLevel: usedMargin > 0 ? (equity / usedMargin) * 100 : 0,
      floatingPnl: floating,
      time: now,
    });

    // jitter latency 8–28ms
    st.latency = 8 + Math.round(rng() * 20);
    setConnection({
      state: "live",
      latencyMs: st.latency,
      lastMessage: now,
    });
  }, [symbol]);

  // ---------- main tick loop ----------
  useEffect(() => {
    // Sync real global prices first, then start the tick engine
    syncRealPrices().then(() => {
      // Re-seed prices with the now-real base values
      const st = stateRef.current;
      for (const s of INSTRUMENTS) {
        st.prices[s.symbol] = s.base;
        st.prevPrices[s.symbol] = s.base;
        st.sessionOpen[s.symbol] = s.base;
      }
    });

    // connect quickly
    const t0 = setTimeout(() => setConnection((c) => ({ ...c, state: "live" })), 450);
    const interval = setInterval(step, TICK_MS);
    return () => {
      clearTimeout(t0);
      clearInterval(interval);
    };
  }, [step]);

  // ---------- manual close ----------
  const closeTrade = useCallback((id: string) => {
    const st = stateRef.current;
    const now = Date.now();
    st.trades = st.trades.map((t) => {
      if (t.id !== id || t.status !== "OPEN") return t;
      const px = st.prices[t.symbol];
      const spec = getSpec(t.symbol);
      const dir = t.type === "BUY" ? 1 : -1;
      const profit = (px - t.entryPrice) * dir * t.volume * contractScale(t.symbol);
      st.balance += profit;
      return { ...t, status: "CLOSED" as const, closePrice: px, closeTime: now, profit, closeReason: "MANUAL" as CloseReason };
    });
    setTrades(st.trades);
  }, []);

  return {
    symbol,
    setSymbol,
    candles: candlesBySym[symbol] ?? [],
    tick: prices[symbol],
    allTicks: prices,
    trades,
    openTrades: trades.filter((t) => t.status === "OPEN"),
    closedTrades: trades.filter((t) => t.status === "CLOSED"),
    account,
    connection,
    closeTrade,
  };
}

function contractScale(symbol: string): number {
  // crude position-value normalizer so PnL lands in a sensible range
  switch (getSpec(symbol).category) {
    case "FX": return symbol === "USDJPY" ? 65 : 1000; // ~ lot scaling
    case "Metal": return 10;
    case "Index": return 5;
    case "Crypto": return 1;
    default: return 1;
  }
}

// ---------- seed a few existing open + closed trades ----------
function seedTrades(): Trade[] {
  const now = Date.now();
  const out: Trade[] = [];
  const picks: Array<[string, TradeType]> = [
    ["EURUSD", "BUY"],
    ["XAUUSD", "SELL"],
    ["GBPUSD", "BUY"],
    ["USDJPY", "SELL"],
  ];
  picks.forEach(([sym, type], i) => {
    const spec = getSpec(sym);
    const dir = type === "BUY" ? 1 : -1;
    const entry = spec.base * (1 + (Math.random() - 0.5) * 0.002);
    const sl = entry - dir * (18 + i * 4) * spec.pip;
    const tp = entry + dir * (28 + i * 5) * spec.pip;
    out.push({
      id: `T${TICKET_SEQ}`,
      ticket: TICKET_SEQ++,
      symbol: sym,
      type,
      volume: spec.category === "Crypto" ? 0.05 : spec.category === "Metal" ? 0.2 : 0.5 + i * 0.5,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit: tp,
      openTime: now - (8 + i * 5) * 60_000,
      status: "OPEN",
    });
  });
  // a few closed trades for history
  const closedPicks: Array<[string, TradeType, number]> = [
    ["EURUSD", "BUY", 124.5],
    ["GBPUSD", "SELL", -42.0],
    ["XAUUSD", "BUY", 318.75],
    ["USDJPY", "BUY", 86.2],
    ["BTCUSD", "SELL", -154.3],
  ];
  closedPicks.forEach(([sym, type, profit], i) => {
    const spec = getSpec(sym);
    const entry = spec.base * (1 + (Math.random() - 0.5) * 0.004);
    const win = profit >= 0;
    const dir = type === "BUY" ? 1 : -1;
    const exit = win ? entry + dir * Math.abs(profit) / (contractScale(sym) * 1) * 0.01 : entry - dir * Math.abs(profit) / (contractScale(sym) * 1) * 0.01;
    out.push({
      id: `T${TICKET_SEQ}`,
      ticket: TICKET_SEQ++,
      symbol: sym,
      type,
      volume: spec.category === "Crypto" ? 0.05 : spec.category === "Metal" ? 0.2 : 0.5 + i * 0.5,
      entryPrice: entry,
      stopLoss: entry - dir * 20 * spec.pip,
      takeProfit: entry + dir * 30 * spec.pip,
      openTime: now - (60 + i * 22) * 60_000,
      closeTime: now - (25 + i * 18) * 60_000,
      closePrice: exit,
      profit,
      closeReason: win ? "TAKE_PROFIT" : "STOP_LOSS",
      status: "CLOSED",
    });
  });
  return out;
}
