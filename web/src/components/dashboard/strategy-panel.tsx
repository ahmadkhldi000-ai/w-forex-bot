"use client";

import { useState } from "react";
import {
  Bot,
  TrendingUp,
  Activity,
  Gauge,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, LiveDot } from "@/components/ui/primitives";

type Strat = {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "active" | "paused";
  pnl: number;
  pnlPct: number;
  trades: number;
  winrate: number;
};

const initial: Strat[] = [
  {
    id: "s1",
    name: "Trend Rider",
    icon: TrendingUp,
    status: "active",
    pnl: 3240.5,
    pnlPct: 8.2,
    trades: 47,
    winrate: 71,
  },
  {
    id: "s2",
    name: "Scalper Pro",
    icon: Activity,
    status: "active",
    pnl: 1180.2,
    pnlPct: 3.1,
    trades: 132,
    winrate: 64,
  },
  {
    id: "s3",
    name: "Grid Matrix",
    icon: Gauge,
    status: "active",
    pnl: -440.8,
    pnlPct: -1.4,
    trades: 88,
    winrate: 58,
  },
  {
    id: "s4",
    name: "Range Hunter",
    icon: Bot,
    status: "paused",
    pnl: 760.0,
    pnlPct: 2.2,
    trades: 21,
    winrate: 66,
  },
];

export function StrategyPanel() {
  const [list, setList] = useState(initial);

  function toggle(id: string) {
    setList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "paused" : "active" }
          : s
      )
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot className="h-[18px] w-[18px] text-[var(--accent-bright)]" />
          <h3 className="text-base font-semibold tracking-tight">
            Strategy Engine
          </h3>
        </div>
        <Badge tone="neutral">{list.filter((s) => s.status === "active").length}/4 on</Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {list.map((s, i) => {
          const Icon = s.icon;
          const positive = s.pnl >= 0;
          return (
            <div
              key={s.id}
              className="group animate-fade-up rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-smooth hover:border-[var(--border-strong)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-base)]">
                    <Icon className="h-[18px] w-[18px] text-[var(--text-secondary)]" />
                    {s.status === "active" && (
                      <span className="absolute -right-0.5 -top-0.5">
                        <LiveDot />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{s.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {s.trades} trades · {s.winrate}% win
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "font-mono-nums text-sm font-semibold",
                      positive ? "text-[var(--accent-bright)]" : "text-[var(--danger)]"
                    )}
                  >
                    {positive ? "+" : ""}
                    {s.pnlPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {positive ? "+" : ""}
                    ${Math.abs(s.pnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-smooth",
                    s.status === "active"
                      ? "bg-[var(--accent)]"
                      : "bg-white/10"
                  )}
                  aria-label="toggle strategy"
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-smooth",
                      s.status === "active" ? "translate-x-4.5" : "translate-x-1"
                    )}
                    style={{
                      transform: s.status === "active" ? "translateX(18px)" : "translateX(3px)",
                    }}
                  />
                </button>
                <button className="flex items-center gap-0.5 text-[11px] font-medium text-[var(--text-muted)] transition-smooth hover:text-[var(--accent-bright)]">
                  Configure
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
