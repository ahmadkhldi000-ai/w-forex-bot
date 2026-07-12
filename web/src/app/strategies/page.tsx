"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Badge, LiveDot } from "@/components/ui/primitives";
import { cn, formatMoney, formatPct } from "@/lib/utils";
import {
  Bot,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Settings2,
  Plus,
  Sparkles,
  Target,
  Clock,
  Activity,
  ArrowUpRight,
  Check,
} from "lucide-react";

type Status = "running" | "paused" | "idle";

type Strategy = {
  id: string;
  name: string;
  type: string;
  symbol: string;
  status: Status;
  pnl: number;
  pnlPct: number;
  winRate: number;
  trades: number;
  runtime: string;
  risk: "low" | "medium" | "high";
  tier: "starter" | "pro" | "elite";
};

const STRATEGIES: Strategy[] = [
  { id: "s1", name: "VWAP Scalper", type: "Scalping", symbol: "EUR/USD", status: "running", pnl: 2840.5, pnlPct: 18.4, winRate: 71, trades: 142, runtime: "12d 4h", risk: "medium", tier: "pro" },
  { id: "s2", name: "EMA Cross Trend", type: "Trend Following", symbol: "GBP/JPY", status: "running", pnl: 1432.2, pnlPct: 9.2, winRate: 64, trades: 88, runtime: "5d 9h", risk: "low", tier: "pro" },
  { id: "s3", name: "Grid Master v2", type: "Grid", symbol: "XAU/USD", status: "paused", pnl: -210.5, pnlPct: -2.1, winRate: 58, trades: 64, runtime: "3d 2h", risk: "high", tier: "elite" },
  { id: "s4", name: "RSI Reversion", type: "Mean Reversion", symbol: "USD/CHF", status: "running", pnl: 612.8, pnlPct: 4.1, winRate: 73, trades: 19, runtime: "8d 2h", risk: "low", tier: "starter" },
  { id: "s5", name: "Breakout Hunter", type: "Breakout", symbol: "BTC/USD", status: "idle", pnl: 0, pnlPct: 0, winRate: 0, trades: 0, runtime: "—", risk: "high", tier: "elite" },
];

const TEMPLATES: { name: string; desc: string; icon: React.ComponentType<{ className?: string }>; tier: "starter" | "pro" | "elite"; accent: string }[] = [
  { name: "Scalper Pro", desc: "تداول سريع على فريم M1-M5", icon: Zap, tier: "pro", accent: "var(--emerald-bright)" },
  { name: "Trend Rider", desc: "متابعة الاتجاه بـ EMA crossover", icon: TrendingUp, tier: "pro", accent: "var(--info)" },
  { name: "Grid Master", desc: "شبكة أوامر متدرجة", icon: Target, tier: "elite", accent: "var(--gold-bright)" },
  { name: "Range Hunter", desc: "انعكاسات في النطاقات الجانبية", icon: Activity, tier: "starter", accent: "var(--emerald)" },
];

export default function StrategiesPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");

  const filtered = STRATEGIES.filter((s) => filter === "all" || s.status === filter);

  return (
    <div className="min-h-screen bg-[var(--bg)] lg:pr-[252px]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 space-y-5 overflow-y-auto p-4 lg:p-6">
          {/* header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2">
                <Bot className="h-4 w-4 text-[var(--emerald)]" />
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Strategies
                </h1>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">
                Manage your trading bot strategies and templates.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-[#06241a] transition-smooth hover:bg-[var(--emerald-bright)]">
              <Plus className="h-4 w-4" />
              New Strategy
            </button>
          </header>

          {/* summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryTile label="Active" value={STRATEGIES.filter((s) => s.status === "running").length.toString()} icon={Play} accent="var(--emerald-bright)" />
            <SummaryTile label="Paused" value={STRATEGIES.filter((s) => s.status === "paused").length.toString()} icon={Pause} accent="var(--gold-bright)" />
            <SummaryTile label="Total P&L" value={formatMoney(STRATEGIES.reduce((a, b) => a + b.pnl, 0), 0)} icon={TrendingUp} accent="var(--info)" />
            <SummaryTile label="Total Trades" value={STRATEGIES.reduce((a, b) => a + b.trades, 0).toString()} icon={Activity} accent="var(--emerald)" />
          </div>

          {/* filter tabs */}
          <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-1">
            {(["all", "running", "paused", "idle"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-smooth",
                  filter === f ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* strategy cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>

          {/* templates */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--gold)]" />
              <h2 className="text-sm font-semibold text-[var(--fg)]">Strategy Templates</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.name}
                    className="group rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 text-right transition-smooth hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg border"
                        style={{ background: `color-mix(in srgb, ${t.accent} 12%, transparent)`, borderColor: `color-mix(in srgb, ${t.accent} 25%, transparent)`, color: t.accent }}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[var(--fg-muted)] transition-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--emerald-bright)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--fg)]">{t.name}</p>
                    <p className="mt-1 text-xs text-[var(--fg-muted)]">{t.desc}</p>
                    <div className="mt-3">
                      <TierBadge tier={t.tier} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="font-mono-nums text-xl font-bold text-[var(--fg)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{label}</p>
    </div>
  );
}

function StrategyCard({ strategy: s }: { strategy: Strategy }) {
  const [paused, setPaused] = useState(s.status === "paused");
  const isRunning = s.status === "running" && !paused;

  const statusConfig = {
    running: { c: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20", Icon: Play, label: "Running" },
    paused: { c: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20", Icon: Pause, label: "Paused" },
    idle: { c: "bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)]", Icon: Pause, label: "Idle" },
  } as const;
  const effectiveStatus = isRunning ? "running" : s.status === "idle" ? "idle" : "paused";
  const { c, Icon: StatusIcon, label } = statusConfig[effectiveStatus];
  const positive = s.pnl >= 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 transition-smooth hover:border-[var(--border-strong)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/60">
            <Bot className="h-5 w-5 text-[var(--emerald)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--fg)]">{s.name}</h3>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", c)}>
                <StatusIcon className="h-2.5 w-2.5" />
                {label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
              {s.type} · {s.symbol}
            </p>
          </div>
        </div>
        <TierBadge tier={s.tier} />
      </div>

      {/* P&L */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className={cn("font-mono-nums text-2xl font-bold", positive ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
          {positive ? "+" : ""}{formatMoney(s.pnl, 2)}
        </span>
        <span className={cn("inline-flex items-center gap-0.5 text-sm font-semibold", positive ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {formatPct(s.pnlPct)}
        </span>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Metric icon={Target} label="Win Rate" value={`${s.winRate}%`} />
        <Metric icon={Activity} label="Trades" value={s.trades.toString()} />
        <Metric icon={Clock} label="Runtime" value={s.runtime} />
      </div>

      {/* risk bar */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--fg-muted)]">Risk</span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
            s.risk === "low" ? "bg-[var(--emerald)]/12 text-[var(--emerald-bright)]"
              : s.risk === "medium" ? "bg-[var(--gold)]/12 text-[var(--gold-bright)]"
              : "bg-[var(--danger)]/12 text-[var(--danger)]"
          )}>
            {s.risk}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {s.status !== "idle" && (
            <button
              onClick={() => setPaused((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isRunning ? "Pause" : "Start"}
            </button>
          )}
          <button className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)]/40 p-2.5 text-center">
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-[var(--fg-muted)]" />
      <p className="font-mono-nums text-sm font-semibold text-[var(--fg)]">{value}</p>
      <p className="text-[10px] text-[var(--fg-muted)]">{label}</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: "starter" | "pro" | "elite" }) {
  const map = {
    starter: { c: "text-[var(--info)] bg-[var(--info)]/12", Icon: Sparkles, label: "Starter" },
    pro: { c: "text-[var(--emerald-bright)] bg-[var(--emerald)]/12", Icon: Zap, label: "Pro" },
    elite: { c: "text-[var(--gold-bright)] bg-[var(--gold)]/12", Icon: Crown, label: "Elite" },
  } as const;
  const { c, Icon, label } = map[tier];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", c)}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
