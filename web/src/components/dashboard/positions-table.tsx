"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { Badge, LiveDot } from "@/components/ui/primitives";
import type { Trade } from "@/lib/trading/profile";

const pipMap: Record<string, number> = {
  "EUR/USD": 0.0001,
  "GBP/JPY": 0.01,
  "XAU/USD": 0.1,
  "USD/JPY": 0.01,
  "AUD/CAD": 0.0001,
  default: 0.0001,
};

export function PositionsTable({ positions }: { positions: Trade[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div className="flex items-center gap-2">
          <LiveDot />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            المراكز المفتوحة
          </h3>
        </div>
        <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
          {positions.length} مركز
        </span>
      </div>

      {positions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                <th className="px-5 py-3 text-start font-medium">الزوج</th>
                <th className="px-3 py-3 text-start font-medium">الاتجاه</th>
                <th className="px-3 py-3 text-end font-medium">الحجم</th>
                <th className="px-3 py-3 text-end font-medium">الدخول</th>
                <th className="px-3 py-3 text-end font-medium">السعر</th>
                <th className="px-5 py-3 text-end font-medium">P/L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const pip = pipMap[p.symbol] ?? pipMap.default;
                const diff = p.closePrice
                  ? p.closePrice - p.openPrice
                  : 0;
                const dir = p.side === "BUY" ? 1 : -1;
                const pips = (diff * dir) / pip;
                const isProfit = pips >= 0;
                return (
                  <tr
                    key={p.id}
                    className="group border-b border-[var(--border-subtle)]/50 transition-colors hover:bg-[var(--bg-elevated)]/50"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[var(--text-primary)]">
                      {p.symbol}
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge
                        tone={p.side === "BUY" ? "success" : "danger"}
                        className="gap-1"
                      >
                        {p.side === "BUY" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {p.side}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-end tabular-nums text-[var(--text-secondary)]">
                      {p.volume.toFixed(2)}
                    </td>
                    <td className="px-3 py-3.5 text-end tabular-nums text-[var(--text-secondary)]">
                      {p.openPrice.toFixed(p.symbol.includes("JPY") ? 3 : 4)}
                    </td>
                    <td className="px-3 py-3.5 text-end tabular-nums text-[var(--text-secondary)]">
                      {(p.closePrice ?? p.openPrice).toFixed(p.symbol.includes("JPY") ? 3 : 4)}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3.5 text-end font-semibold tabular-nums",
                        isProfit
                          ? "text-[var(--accent-bright)]"
                          : "text-[var(--danger)]"
                      )}
                    >
                      {isProfit ? "+" : ""}
                      {pips.toFixed(1)} pips
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-elevated)]">
        <Inbox className="h-6 w-6 text-[var(--text-muted)]" />
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
        لا توجد مراكز مفتوحة
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
        عند بدء تشغيل الروبوت أو فتح صفقات، ستظهر هنا مباشرةً.
      </p>
    </div>
  );
}
