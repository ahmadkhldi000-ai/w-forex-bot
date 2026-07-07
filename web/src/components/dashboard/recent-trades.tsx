"use client";

import { History, ArrowUp, ArrowDown } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";

type Trade = {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  pnl: number;
  time: string;
};

const trades: Trade[] = [
  { id: "t1", pair: "EUR/USD", side: "BUY", pnl: 340.5, time: "2m ago" },
  { id: "t2", pair: "USD/JPY", side: "SELL", pnl: -120.0, time: "14m ago" },
  { id: "t3", pair: "XAU/USD", side: "BUY", pnl: 612.8, time: "38m ago" },
  { id: "t4", pair: "GBP/JPY", side: "SELL", pnl: 88.2, time: "1h ago" },
  { id: "t5", pair: "AUD/CAD", side: "BUY", pnl: -54.0, time: "2h ago" },
  { id: "t6", pair: "EUR/GBP", side: "SELL", pnl: 205.0, time: "3h ago" },
];

export function RecentTrades() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History className="h-[18px] w-[18px] text-[var(--accent-bright)]" />
          <h3 className="text-base font-semibold tracking-tight">Recent Trades</h3>
        </div>
        <button className="text-xs font-medium text-[var(--text-muted)] transition-smooth hover:text-[var(--accent-bright)]">
          View all
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {trades.map((t, i) => {
          const positive = t.pnl >= 0;
          return (
            <div
              key={t.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-smooth hover:bg-white/[0.03] animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  positive
                    ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                    : "bg-[var(--danger-dim)] text-[var(--danger)]"
                )}
              >
                {positive ? (
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t.pair}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      t.side === "BUY"
                        ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                        : "bg-[var(--danger-dim)] text-[var(--danger)]"
                    )}
                  >
                    {t.side}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">{t.time}</p>
              </div>
              <span
                className={cn(
                  "font-mono-nums text-sm font-semibold tabular-nums",
                  positive ? "text-[var(--accent-bright)]" : "text-[var(--danger)]"
                )}
              >
                {positive ? "+" : ""}
                {formatMoney(t.pnl, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
