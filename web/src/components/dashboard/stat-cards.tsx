"use client";

import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Sparkline } from "@/components/ui/primitives";
import { cn, formatMoney, formatPct, randomWalk } from "@/lib/utils";

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

const initial: Stat[] = [
  {
    id: "balance",
    label: "Account Balance",
    value: 48750.32,
    prefix: "$",
    changePct: 4.2,
    positive: true,
    icon: Wallet,
    seed: 7,
  },
  {
    id: "pnl",
    label: "Today's P&L",
    value: 1284.56,
    prefix: "$",
    changePct: 2.7,
    positive: true,
    icon: TrendingUp,
    seed: 12,
  },
  {
    id: "winrate",
    label: "Win Rate",
    value: 68.4,
    suffix: "%",
    changePct: 1.3,
    positive: true,
    icon: Target,
    seed: 21,
  },
  {
    id: "drawdown",
    label: "Max Drawdown",
    value: 8.2,
    suffix: "%",
    changePct: -0.6,
    positive: false,
    icon: TrendingDown,
    seed: 33,
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {initial.map((s, i) => (
        <StatCard key={s.id} stat={s} index={i} />
      ))}
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [value, setValue] = useState(stat.value);
  const [wentUp, setWentUp] = useState(true);
  const [spark, setSpark] = useState<number[]>(() =>
    randomWalk(stat.seed, 24, 100, 0.03, stat.positive ? 0.004 : -0.004)
  );
  const prevRef = useRef(value);

  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.45) * (stat.value * 0.0025);
      setValue((v) => {
        const next = +(v + delta).toFixed(stat.suffix === "%" ? 1 : 2);
        setWentUp(next >= prevRef.current);
        prevRef.current = next;
        return next;
      });
      setSpark((prev) => {
        const next = [...prev.slice(1), prev[prev.length - 1] * (1 + (Math.random() - 0.48) * 0.04)];
        return next;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [stat.value, stat.suffix]);

  const Icon = stat.icon;
  const ChangeIcon = stat.positive ? ArrowUpRight : ArrowDownRight;

  const display =
    stat.suffix === "%"
      ? value.toFixed(1)
      : formatMoney(value, stat.suffix ? 0 : 2).replace("$", "");

  return (
    <div
      className="card group p-5 animate-fade-up transition-smooth hover:border-[var(--border-strong)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border",
              stat.positive
                ? "border-[var(--accent)]/25 bg-[var(--accent-dim)]"
                : "border-[var(--danger)]/25 bg-[var(--danger-dim)]"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                stat.positive ? "text-[var(--accent-bright)]" : "text-[var(--danger)]"
              )}
              strokeWidth={2}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {stat.label}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                  stat.positive
                    ? "text-[var(--accent-bright)]"
                    : "text-[var(--danger)]"
                )}
              >
                <ChangeIcon className="h-3 w-3" />
                {formatPct(stat.changePct)}
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-visible">
          <Sparkline points={spark} positive={stat.positive} width={88} height={34} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        {stat.prefix && (
          <span className="text-lg font-medium text-[var(--text-muted)]">
            {stat.prefix}
          </span>
        )}
        <span
          className={cn(
            "font-mono-nums text-[30px] font-semibold leading-none tracking-tight transition-colors duration-500",
            wentUp ? "text-[var(--accent-bright)]" : "text-[var(--text-primary)]"
          )}
        >
          {display}
        </span>
        {stat.suffix && (
          <span className="text-lg font-medium text-[var(--text-muted)]">
            {stat.suffix}
          </span>
        )}
      </div>
    </div>
  );
}
