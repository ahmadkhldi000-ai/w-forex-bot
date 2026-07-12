"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useLivePrices, fmtPrice } from "@/lib/trading/live-prices";

const SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "XAUUSD",
  "AUDUSD",
  "USDCHF",
  "BTCUSD",
  "ETHUSD",
  "USDCAD",
  "NZDUSD",
];

// Pretty labels for display
const LABEL: Record<string, string> = {
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  USDJPY: "USD/JPY",
  XAUUSD: "XAU/USD",
  AUDUSD: "AUD/USD",
  USDCHF: "USD/CHF",
  BTCUSD: "BTC/USD",
  ETHUSD: "ETH/USD",
  USDCAD: "USD/CAD",
  NZDUSD: "NZD/USD",
};

export function MarketingTicker() {
  const { prices } = useLivePrices(SYMBOLS);
  const display = SYMBOLS.map((s) => prices[s]).filter(Boolean);

  // Duplicate the row for a seamless infinite marquee
  const row = display.length > 0 ? [...display, ...display] : [];

  return (
    <section
      aria-label="Live market prices"
      className="relative overflow-hidden border-y border-[var(--border-soft)] bg-[var(--bg-surface)]/60 backdrop-blur-sm"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

      {row.length === 0 ? null : (
        <div className="flex w-max animate-marquee">
          {row.map((p, i) => {
            const up = p.changePct >= 0;
            return (
              <div key={i} className="flex items-center gap-2.5 px-6 py-2.5">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {LABEL[p.symbol] ?? p.symbol}
                </span>
                <span className="text-sm font-medium tabular-nums text-[var(--text-secondary)]">
                  {fmtPrice(p.symbol, p.bid)}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
