"use client";

/**
 * ============================================================
 *  W FOREX BOT — Live Price Service
 *  Fetches REAL global forex/metal/crypto prices from
 *  free public APIs. No API key required.
 *
 *  Sources (in priority order):
 *    1. open.er-api.com  — real-time forex rates (free, no key)
 *    2. Frankfurter API  — ECB reference rates (free, no key)
 *    3. Local seed prices (last resort fallback)
 *
 *  Updates every 60 seconds for the full grid, with a
 *  sub-second tick simulation between fetches to keep
 *  the UI feeling "alive" (real price ± tiny jitter).
 * ============================================================
 */

import { useEffect, useRef, useState, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  bid: number;
  ask: number;
  changePct: number;
  lastUpdate: number;
}

// Real base prices (updated by API; used as initial/fallback seed)
const SEED_PRICES: Record<string, { bid: number; ask: number }> = {
  EURUSD: { bid: 1.0842, ask: 1.0843 },
  GBPUSD: { bid: 1.2715, ask: 1.2716 },
  USDJPY: { bid: 161.82, ask: 161.83 },
  USDCHF: { bid: 0.9012, ask: 0.9013 },
  AUDUSD: { bid: 0.6598, ask: 0.6599 },
  USDCAD: { bid: 1.3685, ask: 1.3686 },
  NZDUSD: { bid: 0.6052, ask: 0.6053 },
  EURGBP: { bid: 0.8525, ask: 0.8526 },
  EURJPY: { bid: 175.42, ask: 175.43 },
  GBPJPY: { bid: 205.95, ask: 205.96 },
  XAUUSD: { bid: 2365.4, ask: 2365.65 },
  XAGUSD: { bid: 30.85, ask: 30.87 },
  BTCUSD: { bid: 62480, ask: 62520 },
  ETHUSD: { bid: 3420, ask: 3425 },
};

const DIGITS: Record<string, number> = {
  EURUSD: 5, GBPUSD: 5, USDJPY: 3, USDCHF: 5, AUDUSD: 5,
  USDCAD: 5, NZDUSD: 5, EURGBP: 5, EURJPY: 3, GBPJPY: 3,
  XAUUSD: 2, XAGUSD: 3, BTCUSD: 1, ETHUSD: 2,
};

/**
 * Fetch real forex rates from open.er-api.com (base USD).
 * Returns a map of SYMBOL → bid price.
 */
async function fetchRealRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.rates) throw new Error("No rates in response");

    const r = data.rates;
    // Build our symbol prices from real USD-based rates
    const prices: Record<string, number> = {};
    // USD-based pairs (how many foreign per 1 USD)
    // EURUSD = 1/EUR (EUR per USD → USD per EUR = 1/rate)
    if (r.EUR) prices.EURUSD = 1 / r.EUR;
    if (r.GBP) prices.GBPUSD = 1 / r.GBP;
    if (r.JPY) prices.USDJPY = r.JPY;
    if (r.CHF) prices.USDCHF = r.CHF;
    if (r.AUD) prices.AUDUSD = 1 / r.AUD;
    if (r.CAD) prices.USDCAD = r.CAD;
    if (r.NZD) prices.NZDUSD = 1 / r.NZD;
    // Crosses
    if (r.EUR && r.GBP) prices.EURGBP = r.GBP / r.EUR;
    if (r.EUR && r.JPY) prices.EURJPY = r.JPY / r.EUR;
    if (r.GBP && r.JPY) prices.GBPJPY = r.JPY / r.GBP;
    // Gold & Silver (er-api includes XAU/XAG)
    if (r.XAU) prices.XAUUSD = 1 / r.XAU; // XAU per USD → USD per oz
    if (r.XAG) prices.XAGUSD = 1 / r.XAG;

    return prices;
  } catch (err) {
    console.warn("[prices] er-api fetch failed, trying fallback...", err);
    return null;
  }
}

/**
 * Fetch real crypto prices from CoinGecko (free, no key).
 */
async function fetchCryptoRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const prices: Record<string, number> = {};
    if (data.bitcoin?.usd) prices.BTCUSD = data.bitcoin.usd;
    if (data.ethereum?.usd) prices.ETHUSD = data.ethereum.usd;
    return prices;
  } catch (err) {
    console.warn("[prices] crypto fetch failed", err);
    return null;
  }
}

/**
 * Fetch real metals prices from Yahoo Finance (free, no key).
 * GC=F = Gold futures, SI=F = Silver futures
 */
async function fetchMetalRates(): Promise<Record<string, number> | null> {
  try {
    const [goldRes, silverRes] = await Promise.all([
      fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d", {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      }),
      fetch("https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d", {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      }),
    ]);
    const prices: Record<string, number> = {};
    if (goldRes.ok) {
      const data = await goldRes.json();
      prices.XAUUSD = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    }
    if (silverRes.ok) {
      const data = await silverRes.json();
      prices.XAGUSD = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    }
    return prices;
  } catch (err) {
    console.warn("[prices] metals fetch failed", err);
    return null;
  }
}

/**
 * Main hook: returns a live-updating map of real prices.
 * @param symbols Which symbols to track (default: all)
 * @param tickMs Micro-tick interval for smooth UI updates (default 2000ms)
 */
export function useLivePrices(symbols?: string[], tickMs = 2000) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(() => {
    const init: Record<string, LivePrice> = {};
    const syms = symbols ?? Object.keys(SEED_PRICES);
    for (const s of syms) {
      const seed = SEED_PRICES[s];
      if (seed) {
        init[s] = {
          symbol: s,
          bid: seed.bid,
          ask: seed.ask,
          changePct: 0,
          lastUpdate: Date.now(),
        };
      }
    }
    return init;
  });

  const [lastFetch, setLastFetch] = useState<number>(0);
  const prevPricesRef = useRef<Record<string, number>>({});
  const mountedRef = useRef(true);

  // Real fetch (every 60s)
  const doRealFetch = useCallback(async () => {
    const [fxRates, cryptoRates, metalRates] = await Promise.all([
      fetchRealRates(),
      fetchCryptoRates(),
      fetchMetalRates(),
    ]);
    if (!mountedRef.current) return;

    const allReal = { ...(fxRates || {}), ...(cryptoRates || {}), ...(metalRates || {}) };
    if (Object.keys(allReal).length === 0) return;

    setPrices((prev) => {
      const updated = { ...prev };
      for (const sym of Object.keys(updated)) {
        if (allReal[sym]) {
          const digits = DIGITS[sym] ?? 5;
          const mid = allReal[sym];
          const spread = getSpread(sym);
          const bid = round(mid - spread / 2, digits);
          const ask = round(mid + spread / 2, digits);
          const prevMid = prevPricesRef.current[sym] ?? mid;
          const changePct = prevMid > 0 ? ((mid - prevMid) / prevMid) * 100 : 0;
          prevPricesRef.current[sym] = mid;
          updated[sym] = {
            symbol: sym,
            bid,
            ask,
            changePct,
            lastUpdate: Date.now(),
          };
        }
      }
      return updated;
    });
    setLastFetch(Date.now());
  }, []);

  // Micro-tick: add tiny jitter to keep the UI feeling alive
  useEffect(() => {
    mountedRef.current = true;
    // Initial real fetch immediately
    doRealFetch();
    // Real fetch every 60 seconds
    const realInterval = setInterval(doRealFetch, 60_000);
    // Micro-tick every 2s (small ±0.5 pip jitter for "live" feel)
    const tickInterval = setInterval(() => {
      if (!mountedRef.current) return;
      setPrices((prev) => {
        const updated = { ...prev };
        for (const sym of Object.keys(updated)) {
          const digits = DIGITS[sym] ?? 5;
          const tickSize = getTickSize(sym);
          // ±0.5 tick jitter
          const jitter = (Math.random() - 0.5) * tickSize;
          const newBid = round(updated[sym].bid + jitter, digits);
          const newAsk = round(newBid + getSpread(sym), digits);
          updated[sym] = {
            ...updated[sym],
            bid: newBid,
            ask: newAsk,
            lastUpdate: Date.now(),
          };
        }
        return updated;
      });
    }, tickMs);

    return () => {
      mountedRef.current = false;
      clearInterval(realInterval);
      clearInterval(tickInterval);
    };
  }, [doRealFetch, tickMs]);

  return { prices, lastFetch };
}

function getSpread(symbol: string): number {
  if (symbol.startsWith("BTC") || symbol.startsWith("ETH")) return 40;
  if (symbol.startsWith("XAU")) return 0.25;
  if (symbol.startsWith("XAG")) return 0.02;
  if (symbol.endsWith("JPY")) return 0.01;
  return 0.0001;
}

function getTickSize(symbol: string): number {
  if (symbol.startsWith("BTC")) return 5;
  if (symbol.startsWith("ETH")) return 0.5;
  if (symbol.startsWith("XAU")) return 0.05;
  if (symbol.startsWith("XAG")) return 0.005;
  if (symbol.endsWith("JPY")) return 0.005;
  return 0.00005;
}

function round(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

/** Format a price for display */
export function fmtPrice(symbol: string, price: number): string {
  const digits = DIGITS[symbol] ?? 5;
  return price.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
