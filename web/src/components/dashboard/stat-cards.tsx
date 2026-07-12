"use client";

import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Sparkline } from "@/components/ui/primitives";
import { cn, formatMoney, formatPct } from "@/lib/utils";
import type { TradingStats } from "@/lib/trading/profile";

type Stat = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  changePct: number;
  positive: boolean;
  icon: React.ElementType;
  seed: number;
};

/** Build stat cards from REAL trading stats (no hardcoded numbers). */
function buildStats(s: TradingStats | null): Stat[] {
  const safe = s ?? {
    balance: 0,
    todayPnl: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    openCount: 0,
    equity: 0,
    floatingPnl: 0,
    totalPnl: 0,
  };

  return [
    {
      id: "balance",
      label: "رصيد الحساب",
      value: safe.balance,
      prefix: "$",
      changePct: safe.todayPnl !== 0 ? (safe.todayPnl / Math.max(safe.balance - safe.todayPnl, 1)) * 100 : 0,
      positive: safe.todayPnl >= 0,
      icon: Wallet,
      seed: 7,
    },
    {
      id: "pnl",
      label: "ربح/خسارة اليوم",
      value: safe.todayPnl,
      prefix: "$",
      changePct: safe.totalTrades > 0 ? (safe.todayPnl / Math.max(Math.abs(safe.totalPnl), 1)) * 100 : 0,
      positive: safe.todayPnl >= 0,
      icon: TrendingUp,
      seed: 12,
    },
    {
      id: "winrate",
      label: "نسبة النجاح",
      value: safe.winRate,
      suffix: "%",
      changePct: 0,
      positive: safe.winRate >= 50,
      icon: Target,
      seed: 21,
    },
    {
      id: "pf",
      label: "عامل الربح",
      value: safe.profitFactor >= 99 ? 99 : safe.profitFactor,
      changePct: safe.totalTrades > 0 ? safe.profitFactor * 10 : 0,
      positive: safe.profitFactor >= 1,
      icon: Activity,
      seed: 33,
    },
  ];
}

export function StatCards({ stats }: { stats: TradingStats | null }) {
  const cards = buildStats(stats);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((s, i) => (
        <StatCard key={s.id} stat={s} index={i} />
      ))}
    </div>
  );
}

// --------------------------------------------------------------------
//  Single animated card
// --------------------------------------------------------------------
function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);

  // Count-up animation when the value changes
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = stat.value;
    const duration = 900 + index * 120;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [stat.value, index]);

  const formatted =
    stat.prefix === "$"
      ? formatMoney(display, 2)
      : stat.suffix === "%"
        ? display.toFixed(1) + "%"
        : display.toFixed(2);

  const wentUp = stat.changePct >= 0;
  const spark = Array.from({ length: 24 }, (_, i) => {
    // Derive a subtle sparkline from the seed + value direction
    const base = stat.seed * 3 + i * 7;
    const noise = (Math.sin(base) * 0.5 + 0.5) * 8;
    const trend = wentUp ? i * 0.6 : -i * 0.6;
    return 50 + noise + trend;
  });

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-lg"
      style={{ animation: `cardIn 0.5s ${index * 80}ms both` }}
    >
      {/* hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300",
          wentUp
            ? "bg-[var(--accent)]/10 opacity-0 group-hover:opacity-100"
            : "bg-[var(--danger)]/10 opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="relative flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            wentUp
              ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
              : "bg-[var(--danger)]/10 text-[var(--danger)]"
          )}
        >
          <stat.icon className="h-5 w-5" />
        </div>

        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
            wentUp
              ? "bg-[var(--accent)]/10 text-[var(--accent-bright)]"
              : "bg-[var(--danger)]/10 text-[var(--danger)]"
          )}
        >
          {wentUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {formatPct(stat.changePct, 1)}
        </div>
      </div>

      <div className="relative mt-4">
        <p className="text-xs font-medium text-[var(--text-muted)]">
          {stat.label}
        </p>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums tracking-tight transition-colors duration-500",
              wentUp
                ? "text-[var(--accent-bright)]"
                : "text-[var(--text-primary)]"
            )}
          >
            {formatted}
          </span>
          {stat.suffix && stat.prefix !== "$" && (
            <span className="text-lg font-medium text-[var(--text-muted)]">
              {stat.suffix}
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-3 h-8">
        <Sparkline
          points={spark}
          positive={wentUp}
        />
      </div>
    </div>
  );
}
