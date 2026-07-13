"use client";

// ====================================================================
//  Binance WebSocket — REAL-TIME kline stream
//  --------------------------------------------------------------------
//  Connects to Binance's free public combined kline stream:
//     wss://stream.binance.com:9443/ws/<symbol>@kline_<interval>
//
//  Every kline event contains the live, forming candle (updated on
//  every trade) and is emitted until the candle closes (k.x === true).
//
//  Features:
//    • Auto-reconnect with exponential backoff (1s → 2s → 4s → … 30s)
//    • Heartbeat watchdog (Binance pings every ~3 min; if no message
//      for 45s we force-reconnect)
//    • Clean teardown on symbol/timeframe change
//    • Callback-based, framework-agnostic (no React dependency)
//
//  No API key required. CORS does not apply to WebSockets.
// ====================================================================

import type { Candle } from "./types";

export interface KlineUpdate {
  /** The forming candle (latest OHLCV). */
  candle: Candle;
  /** True when the bar has just closed and a new one will follow. */
  closed: boolean;
}

export type KlineHandler = (update: KlineUpdate) => void;
export type StatusHandler = (status: "connecting" | "open" | "reconnecting" | "closed") => void;

interface StreamOpts {
  binanceSymbol: string; // e.g. "BTCUSDT"
  interval: string; // e.g. "1m", "1h", "1d" (Binance format)
  onKline: KlineHandler;
  onStatus?: StatusHandler;
}

interface RawKline {
  t: number; // open time (ms)
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
  T: number; // close time (ms)
  x: boolean; // is this bar closed?
}

interface StreamMessage {
  e?: string; // event type ("kline")
  k?: RawKline;
  // ping/pong frames arrive as numbers / {e:"ping"}
}

const BASE_WS = "wss://stream.binance.com:9443/ws";
const MAX_BACKOFF = 30_000;
const STALE_MS = 45_000; // force reconnect if no message for this long

/**
 * Open a real-time kline stream. Returns a `close()` function that
 * tears everything down (socket + timers).
 */
export function openKlineStream({ binanceSymbol, interval, onKline, onStatus }: StreamOpts): () => void {
  let socket: WebSocket | null = null;
  let manualClose = false;
  let backoff = 1_000;
  let staleTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const url = `${BASE_WS}/${binanceSymbol.toLowerCase()}@kline_${interval}`;

  const armStaleWatchdog = () => {
    if (staleTimer) clearTimeout(staleTimer);
    staleTimer = setTimeout(() => {
      // No data for a while — Binance likely dropped the connection.
      console.warn("[binance-ws] stale watchdog — forcing reconnect");
      safeClose();
      scheduleReconnect();
    }, STALE_MS);
  };

  const connect = () => {
    if (typeof WebSocket === "undefined") return; // SSR guard
    onStatus?.("connecting");
    try {
      socket = new WebSocket(url);
    } catch (err) {
      console.warn("[binance-ws] connect error", err);
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      backoff = 1_000; // reset backoff after a successful open
      onStatus?.("open");
      armStaleWatchdog();
    };

    socket.onmessage = (ev) => {
      armStaleWatchdog();
      let msg: StreamMessage;
      try {
        msg = JSON.parse(ev.data as string) as StreamMessage;
      } catch {
        return; // ignore malformed frames
      }
      if (msg.e !== "kline" || !msg.k) return;
      const k = msg.k;
      onKline({
        candle: {
          time: k.t,
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c),
          volume: Number(k.v) || undefined,
        },
        closed: k.x === true,
      });
    };

    socket.onerror = () => {
      onStatus?.("reconnecting");
    };

    socket.onclose = () => {
      if (staleTimer) clearTimeout(staleTimer);
      if (manualClose) {
        onStatus?.("closed");
        return;
      }
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    onStatus?.("reconnecting");
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      backoff = Math.min(backoff * 2, MAX_BACKOFF);
      connect();
    }, backoff);
  };

  const safeClose = () => {
    if (socket) {
      try {
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.onopen = null;
        socket.close();
      } catch {
        /* noop */
      }
      socket = null;
    }
  };

  connect();

  // teardown
  return () => {
    manualClose = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (staleTimer) clearTimeout(staleTimer);
    safeClose();
    onStatus?.("closed");
  };
}
