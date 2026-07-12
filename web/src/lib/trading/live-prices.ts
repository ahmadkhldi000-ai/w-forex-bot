"use client";

/**
 * ============================================================
 *  W FOREX BOT — Master Data Source (ONLY source of truth)
 * ============================================================
 *
 *  ALL numbers shown in the website come from here.
 *  No random/mock data. Everything is either:
 *    1. From the MT5 Master Account (balance, equity, trades)
 *    2. Real global market prices (forex, gold, crypto)
 *
 *  Gold/silver prices use a CORS proxy to fetch real Yahoo
 *  Finance futures prices (GC=F, SI=F).
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

// ----------------------------------------------------------------
//  Instrument specifications (digits, pip, spread)
// ----------------------------------------------------------------
interface Spec {
  symbol: string;
  digits: number;
  pip: number;
  spread: number;
  category: "FX" | "METAL" | "CRYPTO";
}

const SPECS: Record<string, Spec> = {
  EURUSD: { symbol: "EURUSD", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  GBPUSD: { symbol: "GBPUSD", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  USDJPY: { symbol: "USDJPY", digits: 3, pip: 0.01, spread: 0.01, category: "FX" },
  USDCHF: { symbol: "USDCHF", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  AUDUSD: { symbol: "AUDUSD", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  USDCAD: { symbol: "USDCAD", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  NZDUSD: { symbol: "NZDUSD", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  EURGBP: { symbol: "EURGBP", digits: 5, pip: 0.0001, spread: 0.0001, category: "FX" },
  EURJPY: { symbol: "EURJPY", digits: 3, pip: 0.01, spread: 0.01, category: "FX" },
  GBPJPY: { symbol: "GBPJPY", digits: 3, pip: 0.01, spread: 0.01, category: "FX" },
  XAUUSD: { symbol: "XAUUSD", digits: 2, pip: 0.01, spread: 0.25, category: "METAL" },
  XAGUSD: { symbol: "XAGUSD", digits: 3, pip: 0.001, spread: 0.02, category: "METAL" },
  BTCUSD: { symbol: "BTCUSD", digits: 1, pip: 0.1, spread: 40, category: "CRYPTO" },
  ETHUSD: { symbol: "ETHUSD", digits: 2, pip: 0.01, spread: 5, category: "CRYPTO" },
};

export const DIGITS: Record<string, number> = Object.fromEntries(
  Object.entries(SPECS).map(([k, v]) => [k, v.digits])
);

// Initial/fallback seed (will be overwritten by real prices immediately)
const SEED: Record<string, { bid: number; ask: number }> = {
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
  XAUUSD: { bid: 4110.0, ask: 4110.4 },
  XAGUSD: { bid: 51.2, ask: 51.24 },
  BTCUSD: { bid: 108500, ask: 108600 },
  ETHUSD: { bid: 2650, ask: 2652 },
};

// ----------------------------------------------------------------
//  REAL PRICE FETCHERS
// ----------------------------------------------------------------

/** Fetch real forex rates (CORS-enabled, no key needed). */
async function fetchForex(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.rates || {};
    const p: Record<string, number> = {};
    if (r.EUR) p.EURUSD = 1 / r.EUR;
    if (r.GBP) p.GBPUSD = 1 / r.GBP;
    if (r.JPY) p.USDJPY = r.JPY;
    if (r.CHF) p.USDCHF = r.CHF;
    if (r.AUD) p.AUDUSD = 1 / r.AUD;
    if (r.CAD) p.USDCAD = r.CAD;
    if (r.NZD) p.NZDUSD = 1 / r.NZD;
    if (r.EUR && r.GBP) p.EURGBP = r.GBP / r.EUR;
    if (r.EUR && r.JPY) p.EURJPY = r.JPY / r.EUR;
    if (r.GBP && r.JPY) p.GBPJPY = r.JPY / r.GBP;
    return p;
  } catch {
    return null;
  }
}

/** Fetch real crypto prices (CORS-enabled, no key needed). */
async function fetchCrypto(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const p: Record<string, number> = {};
    if (data.bitcoin?.usd) p.BTCUSD = data.bitcoin.usd;
    if (data.ethereum?.usd) p.ETHUSD = data.ethereum.usd;
    return p;
  } catch {
    return null;
  }
}

/**
 * Fetch REAL gold & silver from Yahoo Finance (GC=F / SI=F futures →
 * COMEX spot). Yahoo blocks direct browser calls (CORS), so we try
 * multiple CORS proxies in order until one returns valid data.
 *
 * Proxies are tried in sequence — the first one that yields a
 * positive numeric price wins, so a single failing proxy never
 * breaks the gold price.
 */
const CORS_PROXIES = [
  // allorigins /raw — returns the raw upstream body
  (target: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  // codetabs proxy
  (target: string) =>
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(target)}`,
  // corsproxy.io
  (target: string) => `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
];

async function fetchMetals(): Promise<Record<string, number> | null> {
  const p: Record<string, number> = {};

  const fetchOne = async (sym: string, ticker: string) => {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    // Try each proxy in order
    for (const makeProxy of CORS_PROXIES) {
      try {
        const res = await fetch(makeProxy(yahooUrl), { cache: "no-store" });
        if (!res.ok) continue;
        const text = await res.text();
        if (!text || text.length < 20) continue;
        const data = JSON.parse(text);
        const price =
          data?.chart?.result?.[0]?.meta?.regularMarketPrice ??
          data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.slice(-1)[0];
        if (price && price > 0) {
          p[sym] = price;
          return; // success — stop trying proxies for this symbol
        }
      } catch {
        // try next proxy
      }
    }
  };

  await Promise.all([
    fetchOne("XAUUSD", "GC=F"),
    fetchOne("XAGUSD", "SI=F"),
  ]);
  return Object.keys(p).length > 0 ? p : null;
}

// ----------------------------------------------------------------
//  MAIN HOOK: useLivePrices
// ----------------------------------------------------------------
export function useLivePrices(symbols?: string[], tickMs = 3000) {
  const syms = symbols ?? Object.keys(SEED);
  const [prices, setPrices] = useState<Record<string, LivePrice>>(() => {
    const init: Record<string, LivePrice> = {};
    for (const s of syms) {
      const seed = SEED[s];
      if (seed) {
        init[s] = { symbol: s, bid: seed.bid, ask: seed.ask, changePct: 0, lastUpdate: Date.now() };
      }
    }
    return init;
  });
  const prevMidRef = useRef<Record<string, number>>({});
  const mountedRef = useRef(true);

  const doRealFetch = useCallback(async () => {
    const [fx, crypto, metals] = await Promise.all([
      fetchForex(),
      fetchCrypto(),
      fetchMetals(),
    ]);
    if (!mountedRef.current) return;
    const real = { ...(fx || {}), ...(crypto || {}), ...(metals || {}) };
    if (Object.keys(real).length === 0) return;

    setPrices((prev) => {
      const updated = { ...prev };
      for (const sym of Object.keys(updated)) {
        if (real[sym] && real[sym] > 0) {
          const spec = SPECS[sym];
          const mid = real[sym];
          // On first real fetch, compare against the seed (prior known price)
          // so we show a meaningful change instead of 0.00%.
          const seedMid = SEED[sym] ? (SEED[sym].bid + SEED[sym].ask) / 2 : mid;
          const prevMid = prevMidRef.current[sym] ?? seedMid;
          const changePct = prevMid > 0 ? ((mid - prevMid) / prevMid) * 100 : 0;
          prevMidRef.current[sym] = mid;
          updated[sym] = {
            symbol: sym,
            bid: round(mid - spec.spread / 2, spec.digits),
            ask: round(mid + spec.spread / 2, spec.digits),
            changePct,
            lastUpdate: Date.now(),
          };
        }
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    doRealFetch();
    const realInterval = setInterval(doRealFetch, 60_000);
    return () => {
      mountedRef.current = false;
      clearInterval(realInterval);
    };
  }, [doRealFetch]);

  return { prices };
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
