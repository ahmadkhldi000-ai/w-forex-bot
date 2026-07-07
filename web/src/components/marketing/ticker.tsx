"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

type Pair = { symbol: string; price: string; change: number };

const pairs: Pair[] = [
  { symbol: "EUR/USD", price: "1.0847", change: 0.42 },
  { symbol: "GBP/USD", price: "1.2713", change: -0.18 },
  { symbol: "USD/JPY", price: "157.84", change: 0.31 },
  { symbol: "XAU/USD", price: "2,387.50", change: 1.24 },
  { symbol: "AUD/USD", price: "0.6612", change: -0.07 },
  { symbol: "USD/CHF", price: "0.9034", change: 0.09 },
  { symbol: "BTC/USD", price: "67,420", change: 2.81 },
  { symbol: "ETH/USD", price: "3,486", change: 1.93 },
  { symbol: "USD/CAD", price: "1.3678", change: -0.22 },
  { symbol: "NZD/USD", price: "0.6089", change: 0.15 },
];

function Item({ pair }: { pair: Pair }) {
  const up = pair.change >= 0;
  return (
    <div className="flex items-center gap-2.5 px-6">
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {pair.symbol}
      </span>
      <span className="font-mono-nums text-sm text-[var(--text-secondary)]">
        {pair.price}
      </span>
      <span
        className={
          "inline-flex items-center gap-0.5 font-mono-nums text-xs font-semibold " +
          (up ? "text-[var(--accent-bright)]" : "text-[var(--danger)]")
        }
      >
        {up ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {up ? "+" : ""}
        {pair.change.toFixed(2)}%
      </span>
    </div>
  );
}

export function MarketingTicker() {
  const row = [...pairs, ...pairs];
  return (
    <section
      className="ticker-track relative overflow-hidden border-y border-[var(--border-subtle)] py-2.5"
      style={{ background: "rgba(13,19,22,0.6)" }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />
      <div className="flex w-max">
        {row.map((p, i) => (
          <Item key={i} pair={p} />
        ))}
      </div>
    </section>
  );
}
