// ====================================================================
//  LIVE TRADING — Type definitions
//  Mirrors the MT5Event schema from the Express bridge (mt5-socket.ts)
//  so this can be wired to a real socket.io feed with zero refactor.
// ====================================================================

export type TradeType = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED";
export type CloseReason = "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL";

export interface Candle {
  time: number; // epoch ms (bar open)
  open: number;
  high: number;
  low: number;
  close: number;
}

/** A trade marker drawn on the chart (entry / exit) */
export interface Trade {
  id: string;
  ticket: number;
  symbol: string;
  type: TradeType;
  volume: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: number; // epoch ms
  closeTime?: number;
  closePrice?: number;
  profit?: number;
  closeReason?: CloseReason;
  status: TradeStatus;
}

export interface SymbolTick {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  changePct: number;
  prevPrice: number;
  time: number;
}

export interface AccountSnapshot {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingPnl: number;
  time: number;
}

export interface ConnectionStatus {
  state: "connecting" | "live" | "reconnecting" | "offline";
  latencyMs: number;
  lastMessage: number;
}
