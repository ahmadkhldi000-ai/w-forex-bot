"use client";

import { CandlestickChart, Flame } from "lucide-react";
import { INSTRUMENTS, fmtPrice } from "@/lib/trading/instruments";
import { SymbolTick } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

interface Props {
  active: string;
  ticks: Record<string, SymbolTick>;
  onSelect: (s: string) => void;
}

export function SymbolPicker({ active, ticks, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
      {INSTRUMENTS.map((s) => {
        const t = ticks[s.symbol];
        const up = (t?.changePct ?? 0) >= 0;
        const isActive = s.symbol === active;
        return (
          <button
            key={s.symbol}
            onClick={() => onSelect(s.symbol)}
            className={cn(
              "group flex items-center justify-between rounded-xl border px-3 py-2.5 text-right transition-smooth",
              isActive
                ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/8 shadow-[0_0_0_1px_rgba(25,201,138,0.15)]"
                : "border-[var(--border)] bg-[var(--surface)]/40 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition-smooth",
                  isActive
                    ? "border-[var(--emerald)]/30 bg-[var(--emerald)]/12 text-[var(--emerald-bright)]"
                    : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--fg-muted)] group-hover:text-[var(--fg)]"
                )}
              >
                {s.category === "Crypto" ? <Flame className="h-4 w-4" /> : <CandlestickChart className="h-4 w-4" />}
              </span>
              <div className="text-right">
                <div className={cn("font-mono-nums text-sm font-semibold", isActive ? "text-[var(--fg)]" : "text-[var(--fg)]")}>
                  {s.symbol}
                </div>
                <div className="text-[10px] text-[var(--fg-dim)]">{s.category}</div>
              </div>
            </div>
            <div className="flex flex-col items-end font-mono-nums">
              <span className="text-xs font-semibold text-[var(--fg)]">{t ? fmtPrice(t.price, s.symbol) : "—"}</span>
              <span className={cn("text-[10px]", up ? "text-[var(--emerald)]" : "text-[var(--danger)]")}>
                {t ? `${up ? "+" : ""}${t.changePct.toFixed(2)}%` : ""}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
