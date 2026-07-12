"use client";

import { useLivePrices, fmtPrice } from "@/lib/trading/live-prices";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * LivePriceTicker — displays real-time forex/metal/crypto prices
 * in a horizontal scrolling marquee. Prices are fetched from real
 * global sources (open.er-api.com, CoinGecko, Yahoo Finance).
 */
export function LivePriceTicker({ symbols }: { symbols?: string[] }) {
  const syms = symbols ?? [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF",
    "AUDUSD", "USDCAD", "NZDUSD",
    "XAUUSD", "XAGUSD",
    "BTCUSD", "ETHUSD",
  ];
  const { prices } = useLivePrices(syms);

  const display = syms
    .map((s) => prices[s])
    .filter(Boolean);

  if (display.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/60 backdrop-blur-sm">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

      {/* Live indicator */}
      <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-[var(--accent)]/15 px-2 py-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-bright)]">
          LIVE
        </span>
      </div>

      {/* Scrolling marquee */}
      <div className="flex animate-marquee gap-6 py-2.5 pr-6 pl-24">
        {[...display, ...display].map((p, i) => {
          const up = p.changePct >= 0;
          return (
            <div
              key={`${p.symbol}-${i}`}
              className="flex shrink-0 items-center gap-2"
            >
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {p.symbol}
              </span>
              <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                {fmtPrice(p.symbol, p.bid)}
              </span>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
                  up ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                }`}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {up ? "+" : ""}
                {p.changePct.toFixed(2)}%
              </span>
              <span className="text-[var(--border-strong)]">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
