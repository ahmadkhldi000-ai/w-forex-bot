"use client";

import { History, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import type { Trade } from "@/lib/trading/profile";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `قبل ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  return `قبل ${days} يوم`;
}

export function RecentTrades({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(0, 8);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History className="h-[18px] w-[18px] text-[var(--accent-bright)]" />
          <h3 className="text-base font-semibold tracking-tight">آخر الصفقات</h3>
        </div>
        <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
          {trades.length}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-elevated)]">
            <Inbox className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
            لا توجد صفقات بعد
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            ستظهر الصفقات المنفّذة هنا فور حدوثها.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {recent.map((t) => {
            const positive = t.pnl >= 0;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[var(--bg-elevated)]/60"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      positive
                        ? "bg-[var(--accent)]/12 text-[var(--accent-bright)]"
                        : "bg-[var(--danger)]/12 text-[var(--danger)]"
                    )}
                  >
                    {t.side === "BUY" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {t.symbol}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {t.side} · {t.volume.toFixed(2)} لوت · {timeAgo(t.closeTime ?? t.openTime)}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    positive
                      ? "text-[var(--accent-bright)]"
                      : "text-[var(--danger)]"
                  )}
                >
                  {positive ? "+" : ""}
                  {formatMoney(t.pnl, 0)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
