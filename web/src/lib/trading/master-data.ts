"use client";

/**
 * ============================================================
 *  W FOREX BOT — Master Data Bridge
 *  ============================================================
 *
 *  THE SINGLE SOURCE OF TRUTH for all trading data.
 *
 *  When the owner configures a Master MT5 Account (via
 *  /owner/master), ALL dashboard numbers come from it:
 *    - Balance, Equity, Margin
 *    - Open positions
 *    - Closed trades
 *    - Win rate, Profit factor
 *
 *  If no master account is configured yet, the dashboard
 *  shows ZERO (not fake/random numbers).
 *
 *  When MT5 bridge is connected, this store receives real
 *  data via socket.io and broadcasts to all components.
 * ============================================================
 */

import { useEffect, useState, useCallback } from "react";

// ----------------------------------------------------------------
//  Types (mirror MT5 data shapes)
// ----------------------------------------------------------------
export interface MasterBalance {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingPnl: number;
  currency: string;
  leverage: number;
  updatedAt: string;
}

export interface MasterPosition {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  swap: number;
  openTime: string;
}

export interface MasterTrade {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  openTime: string;
  closeTime: string;
}

export interface MasterData {
  connected: boolean;
  login: string | null;
  server: string | null;
  balance: MasterBalance | null;
  positions: MasterPosition[];
  recentTrades: MasterTrade[];
  // Computed stats (derived from real data only)
  stats: {
    openCount: number;
    todayPnl: number;
    totalPnl: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
  } | null;
  lastUpdate: string | null;
  error: string | null;
}

// ----------------------------------------------------------------
//  Storage keys
// ----------------------------------------------------------------
const MASTER_DATA_KEY = "wfb_master_data_v1";
const MASTER_CRED_KEY = "wfb_omx_master_v1"; // matches master-store.ts

// ----------------------------------------------------------------
//  Read master credentials (to know if master is configured)
// ----------------------------------------------------------------
function getMasterLogin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MASTER_CRED_KEY);
    if (!raw) return null;
    // It's encrypted/encoded; just check existence + parse loosely
    return raw.length > 10 ? "configured" : null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
//  Load persisted master data (from last socket push)
// ----------------------------------------------------------------
function loadMasterData(): MasterData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MASTER_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MasterData;
  } catch {
    return null;
  }
}

function saveMasterData(data: MasterData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MASTER_DATA_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------------------------
//  Compute stats from real positions + trades
// ----------------------------------------------------------------
function computeStats(
  positions: MasterPosition[],
  trades: MasterTrade[]
): MasterData["stats"] {
  const openCount = positions.length;
  const floatingPnl = positions.reduce((s, p) => s + p.profit, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter((t) => t.closeTime.slice(0, 10) === today);
  const todayPnl = todayTrades.reduce((s, t) => s + t.profit, 0);
  const totalPnl = trades.reduce((s, t) => s + t.profit, 0);
  const wins = trades.filter((t) => t.profit > 0);
  const losses = trades.filter((t) => t.profit < 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const grossProfit = wins.reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.profit, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
  return { openCount, todayPnl, totalPnl, winRate, profitFactor, totalTrades: trades.length };
}

// ----------------------------------------------------------------
//  MAIN HOOK: useMasterData
//  Returns the master account data. If master is not configured
//  or not connected, returns zeros (NOT random data).
// ----------------------------------------------------------------
export function useMasterData() {
  const [data, setData] = useState<MasterData>(() => {
    const stored = loadMasterData();
    const configured = getMasterLogin() !== null;
    return stored ?? {
      connected: false,
      login: null,
      server: null,
      balance: null,
      positions: [],
      recentTrades: [],
      stats: configured ? { openCount: 0, todayPnl: 0, totalPnl: 0, winRate: 0, profitFactor: 0, totalTrades: 0 } : null,
      lastUpdate: null,
      error: null,
    };
  });

  // Try to connect to the backend socket.io for live MT5 data
  useEffect(() => {
    let socket: { close: () => void } | null = null;
    let cleanup = () => {};

    const configured = getMasterLogin() !== null;
    if (!configured) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Dynamic import of socket.io-client (optional dependency)
    import("socket.io-client")
      .then(({ io }) => {
        const s = io(API_URL, {
          path: "/api/socket",
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 3000,
        });

        s.on("connect", () => {
          setData((prev) => ({ ...prev, connected: true, error: null }));
        });

        s.on("disconnect", () => {
          setData((prev) => ({ ...prev, connected: false }));
        });

        s.on("mt5:event", (event: MT5Event) => {
          setData((prev) => {
            const updated = applyEvent(prev, event);
            saveMasterData(updated);
            return updated;
          });
        });

        s.on("connect_error", () => {
          setData((prev) => ({ ...prev, connected: false, error: "Cannot reach server" }));
        });

        socket = s;
        cleanup = () => s.close();
      })
      .catch(() => {
        // socket.io-client not installed — data stays at zeros
        // (real data will flow once the bridge connects)
      });

    return () => cleanup();
  }, []);

  // Recompute stats whenever positions/trades change
  const dataWithStats = useCallback((): MasterData => {
    if (!data.balance && data.positions.length === 0 && data.recentTrades.length === 0) {
      return data;
    }
    return {
      ...data,
      stats: computeStats(data.positions, data.recentTrades),
    };
  }, [data]);

  return dataWithStats();
}

// ----------------------------------------------------------------
//  Apply incoming MT5 events to the data store
// ----------------------------------------------------------------
interface MT5Event {
  type: string;
  data?: Record<string, unknown>;
  status?: string;
  time?: string;
}

function applyEvent(prev: MasterData, event: MT5Event): MasterData {
  const next = { ...prev, lastUpdate: event.time || new Date().toISOString() };

  switch (event.type) {
    case "connection":
      next.connected = event.status === "connected";
      next.error = event.status === "error" ? "MT5 connection error" : null;
      break;

    case "account": {
      const a = event.data || {};
      next.login = String(a.login ?? prev.login ?? "");
      next.server = String(a.server ?? prev.server ?? "");
      next.balance = {
        balance: num(a.balance),
        equity: num(a.equity),
        margin: num(a.margin),
        freeMargin: num(a.freeMargin ?? a.marginFree),
        marginLevel: num(a.marginLevel),
        floatingPnl: num(a.equity) - num(a.balance),
        currency: String(a.currency ?? "USD"),
        leverage: num(a.leverage),
        updatedAt: next.lastUpdate!,
      };
      break;
    }

    case "positions":
    case "full_sync": {
      const positions = (event.data?.positions as Record<string, unknown>[]) || [];
      next.positions = positions.map(toPosition);
      break;
    }

    case "trade_open": {
      const pos = toPosition(event.data || {});
      next.positions = [...prev.positions.filter((p) => p.ticket !== pos.ticket), pos];
      break;
    }

    case "trade_close": {
      const t = event.data || {};
      next.positions = prev.positions.filter((p) => p.ticket !== num(t.ticket));
      // Add to recent trades
      const trade: MasterTrade = {
        ticket: num(t.ticket),
        symbol: String(t.symbol ?? ""),
        type: String(t.type ?? "BUY") as "BUY" | "SELL",
        volume: num(t.volume),
        openPrice: num(t.openPrice ?? t.price),
        closePrice: num(t.closePrice ?? t.price),
        profit: num(t.profit),
        openTime: String(t.openTime ?? t.time ?? ""),
        closeTime: String(t.closeTime ?? t.time ?? ""),
      };
      next.recentTrades = [trade, ...prev.recentTrades].slice(0, 100);
      break;
    }
  }

  next.stats = computeStats(next.positions, next.recentTrades);
  return next;
}

function toPosition(d: Record<string, unknown>): MasterPosition {
  return {
    ticket: num(d.ticket),
    symbol: String(d.symbol ?? ""),
    type: String(d.type ?? "BUY") as "BUY" | "SELL",
    volume: num(d.volume),
    openPrice: num(d.openPrice ?? d.price),
    currentPrice: num(d.currentPrice ?? d.priceCurrent),
    sl: num(d.sl),
    tp: num(d.tp),
    profit: num(d.profit),
    swap: num(d.swap),
    openTime: String(d.openTime ?? d.time ?? ""),
  };
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// ============================================================
//  ADAPTERS — map MasterData → component-facing types
//  (so existing UI components consume real data unchanged)
// ============================================================
import type {
  Trade,
  EquityPoint,
  TradingStats,
} from "@/lib/trading/profile";

/** Map master account snapshot → TradingStats for StatCards. */
export function masterToStats(m: MasterData): TradingStats {
  const balance = m.balance?.balance ?? 0;
  const equity = m.balance?.equity ?? balance;
  const floatingPnl = m.balance?.floatingPnl ?? 0;
  const todayPnl = m.stats?.todayPnl ?? 0;
  const totalPnl = m.stats?.totalPnl ?? 0;
  const winRate = m.stats?.winRate ?? 0;
  const profitFactor = m.stats?.profitFactor ?? 0;
  const totalTrades = m.stats?.totalTrades ?? m.recentTrades.length;
  const openCount = m.positions.length;

  return {
    balance,
    equity,
    floatingPnl,
    todayPnl,
    totalPnl,
    winRate,
    profitFactor,
    totalTrades,
    openCount,
  };
}

/** Map master open positions → Trade[] for PositionsTable. */
export function masterToOpenTrades(m: MasterData): Trade[] {
  return m.positions.map((p) => ({
    id: String(p.ticket),
    symbol: p.symbol,
    side: p.type,
    volume: p.volume,
    openPrice: p.openPrice,
    closePrice: p.currentPrice,
    openTime: p.openTime,
    pnl: p.profit,
    status: "OPEN",
  }));
}

/** Map master recent trades → Trade[] for RecentTrades. */
export function masterToClosedTrades(m: MasterData): Trade[] {
  return m.recentTrades.map((t) => ({
    id: String(t.ticket),
    symbol: t.symbol,
    side: t.type,
    volume: t.volume,
    openPrice: t.openPrice,
    closePrice: t.closePrice,
    openTime: t.openTime,
    closeTime: t.closeTime,
    pnl: t.profit,
    status: "CLOSED",
  }));
}

/** Build an equity-curve history from balance + recent trades.
 *  Uses current equity as the latest point; if no trades, single point. */
export function masterToEquityHistory(m: MasterData): EquityPoint[] {
  const now = new Date().toISOString();
  const equity = m.balance?.equity ?? m.balance?.balance ?? 0;

  if (m.recentTrades.length === 0) {
    return [{ t: now, equity }];
  }

  // Sort trades oldest → newest, build cumulative equity walk
  const sorted = [...m.recentTrades].sort((a, b) => {
    const ta = new Date(a.closeTime || a.openTime).getTime();
    const tb = new Date(b.closeTime || b.openTime).getTime();
    return ta - tb;
  });

  const baseEquity = equity - sorted.reduce((s, t) => s + t.profit, 0);
  let running = baseEquity;
  const history: EquityPoint[] = [];

  for (const t of sorted) {
    running += t.profit;
    history.push({
      t: t.closeTime || t.openTime || now,
      equity: running,
    });
  }
  // Ensure the final point equals live equity
  history.push({ t: now, equity });
  return history;
}
