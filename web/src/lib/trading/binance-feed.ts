"use client";

/**
 * ============================================================
 *  REAL MARKET DATA — Binance OHLC fetcher
 * ============================================================
 *
 *  Fetches genuine candlestick (OHLC) data from Binance's public
 *  REST API. No API key required, CORS-enabled.
 *
 *  Supported pairs (mapped in instruments.ts):
 *    BTCUSD  → BTCUSDT
 *    EURUSD  → EURUSDT
 *    GBPUSD  → GBPUSDT
 *    XAUUSD  → PAXGUSDT (Pax Gold — 1 token ≈ 1 troy ounce of gold)
 *
 *  USDJPY is not listed on Binance; it falls back to the
 *  deterministic local engine with a real spot price.
 */

import type { Candle } from "./types";
import { binanceInterval } from "./instruments";

const BINANCE_API = "https://api.binance.com/api/v3/klines";

/**
 * Fetch historical OHLC candles for a Binance symbol at a timeframe.
 * Returns null if the fetch fails (caller falls back to local engine).
 */
export async function fetchCandles(
  binanceSymbol: string,
  timeframe: string,
  limit = 150,
): Promise<Candle[] | null> {
  const interval = binanceInterval(timeframe);
  if (!interval) return null;

  try {
    const url = `${BINANCE_API}?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const candles: Candle[] = [];
    for (const k of raw) {
      if (!Array.isArray(k) || k.length < 5) continue;
      // Binance kline: [openTime, open, high, low, close, volume, ...]
      candles.push({
        time: Number(k[0]),
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
        volume: Number(k[5]) || undefined,
      });
    }
    return candles.length > 5 ? candles : null;
  } catch {
    return null;
  }
}

/** Fetch the latest spot price for a Binance symbol. */
export async function fetchSpotPrice(binanceSymbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { price?: string };
    const p = Number(data.price);
    return p > 0 ? p : null;
  } catch {
    return null;
  }
}
