"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Badge, LiveDot } from "@/components/ui/primitives";
import {
  cn,
  formatMoney,
  formatPct,
  randomWalk,
  seededRandom,
} from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Zap,
  Download,
  Activity,
  Percent,
  Gauge,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type Range = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("3M");

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-5 overflow-y-auto p-4 lg:p-6">
          {/* ---- Page header ---- */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--emerald)]" />
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Performance Analytics
                </h1>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">
                Deep insights into your trading bot's profitability, risk, and consistency.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RangePicker value={range} onChange={setRange} />
              <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]/60 px-3.5 py-2 text-sm font-medium text-[var(--fg)] transition-smooth hover:bg-[var(--bg-hover)]">
                <Download className="h-4 w-4 text-[var(--fg-muted)]" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </header>

          {/* ---- KPI grid ---- */}
          <KpiGrid />

          {/* ---- Equity curve ---- */}
          <EquityCurveCard range={range} />

          {/* ---- Two-up: Monthly P&L bars + Win rate gauge ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <MonthlyPnlCard range={range} />
            </div>
            <WinRateGaugeCard />
          </div>

          {/* ---- Two-up: Trade distribution + Strategy breakdown ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TradeDistributionCard />
            <StrategyBreakdownCard />
          </div>

          {/* ---- Performance table ---- */}
          <PerformanceTableCard />
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Range picker                                                        */
/* ------------------------------------------------------------------ */
function RangePicker({
  value,
  onChange,
}: {
  value: Range;
  onChange: (r: Range) => void;
}) {
  const ranges: Range[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];
  return (
    <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth",
            value === r
              ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI grid                                                            */
/* ------------------------------------------------------------------ */
function KpiGrid() {
  const kpis = [
    { label: "Net Profit", value: "$48,920", delta: "+18.4%", positive: true, icon: TrendingUp },
    { label: "Profit Factor", value: "2.41", delta: "+0.12", positive: true, icon: Gauge },
    { label: "Max Drawdown", value: "-8.2%", delta: "-1.1%", positive: false, icon: TrendingDown },
    { label: "Sharpe Ratio", value: "1.87", delta: "+0.08", positive: true, icon: Zap },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div
            key={k.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60">
                <Icon className="h-[18px] w-[18px] text-[var(--emerald)]" />
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  k.positive
                    ? "bg-[var(--emerald)]/12 text-[var(--emerald-bright)]"
                    : "bg-[var(--danger)]/12 text-[var(--danger)]"
                )}
              >
                {k.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {k.delta}
              </span>
            </div>
            <p className="mt-3 font-mono-nums text-2xl font-semibold text-[var(--fg)]">{k.value}</p>
            <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{k.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Equity curve (large area chart)                                     */
/* ------------------------------------------------------------------ */
function EquityCurveCard({ range }: { range: Range }) {
  const data = useMemo(() => {
    const seedMap: Record<Range, number> = {
      "1W": 11, "1M": 22, "3M": 33, "6M": 44, "1Y": 55, ALL: 66,
    };
    const lenMap: Record<Range, number> = {
      "1W": 30, "1M": 30, "3M": 90, "6M": 120, "1Y": 180, ALL: 240,
    };
    return randomWalk(seedMap[range], lenMap[range], 50000, 0.012, 0.0015);
  }, [range]);

  const { path, area, min, max } = useMemo(() => {
    const W = 1000, H = 280, pad = 16;
    const min = Math.min(...data), max = Math.max(...data);
    const span = max - min || 1;
    const pts = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / span) * (H - pad * 2);
      return [x, y] as const;
    });
    const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    const area = `${path} L${pts[pts.length - 1][0]},${H - pad} L${pts[0][0]},${H - pad} Z`;
    return { path, area, min, max };
  }, [data]);

  const start = data[0], end = data[data.length - 1];
  const pct = ((end - start) / start) * 100;
  const profit = end - start;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--fg)]">Equity Curve</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono-nums text-2xl font-semibold text-[var(--fg)]">
              {formatMoney(end, 0)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-semibold",
                profit >= 0 ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
              )}
            >
              {profit >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {formatMoney(Math.abs(profit), 0)} ({formatPct(pct)})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="text-xs text-[var(--fg-muted)]">Account Equity · {range}</span>
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 1000 280" className="h-[280px] w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="16" x2="984"
              y1={16 + g * 248} y2={16 + g * 248}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
          ))}
          <path d={area} fill="url(#eqGrad)" />
          <path
            d={path}
            fill="none"
            stroke="var(--emerald-bright)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-2 flex justify-between font-mono-nums text-[10px] text-[var(--fg-dim)]">
        <span>Low {formatMoney(min, 0)}</span>
        <span>High {formatMoney(max, 0)}</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Monthly P&L bar chart                                               */
/* ------------------------------------------------------------------ */
function MonthlyPnlCard({ range }: { range: Range }) {
  const months = useMemo(() => {
    const len = range === "1W" || range === "1M" ? 8 : 12;
    const rng = seededRandom(99);
    return Array.from({ length: len }, (_, i) => {
      const v = (rng() - 0.38) * 9000;
      return { label: `M${i + 1}`, value: v };
    });
  }, [range]);

  const maxAbs = Math.max(...months.map((m) => Math.abs(m.value)));
  const total = months.reduce((s, m) => s + m.value, 0);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--fg)]">Monthly P&L</h2>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">Profit &amp; loss per month</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            total >= 0
              ? "bg-[var(--emerald)]/12 text-[var(--emerald-bright)]"
              : "bg-[var(--danger)]/12 text-[var(--danger)]"
          )}
        >
          Total {formatMoney(total, 0)}
        </span>
      </div>
      <div className="flex h-[220px] items-end gap-2">
        {months.map((m, i) => {
          const h = (Math.abs(m.value) / maxAbs) * 100;
          const positive = m.value >= 0;
          return (
            <div key={i} className="group flex flex-1 flex-col items-center gap-2">
              <span className="font-mono-nums text-[10px] text-[var(--fg-dim)] opacity-0 transition-smooth group-hover:opacity-100">
                {formatMoney(m.value, 0)}
              </span>
              <div className="relative flex h-full w-full justify-center">
                <div className="flex h-full w-full max-w-[40px] items-end">
                  <div
                    className={cn(
                      "w-full rounded-md transition-smooth group-hover:brightness-125",
                      positive
                        ? "bg-gradient-to-t from-[var(--emerald-deep)] to-[var(--emerald-bright)]"
                        : "bg-gradient-to-t from-[#7a2632] to-[var(--danger)]"
                    )}
                    style={{ height: `${Math.max(h, 3)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-[var(--fg-dim)]">{m.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Win-rate gauge (semi-circle)                                        */
/* ------------------------------------------------------------------ */
function WinRateGaugeCard() {
  const winRate = 68.4;
  const angle = (winRate / 100) * 180; // 0..180 deg
  const R = 90, cx = 110, cy = 110;

  const arc = (a0: number, a1: number) => {
    const r = R;
    const x0 = cx + r * Math.cos((Math.PI * a0) / 180);
    const y0 = cy + r * Math.sin((Math.PI * a0) / 180);
    const x1 = cx + r * Math.cos((Math.PI * a1) / 180);
    const y1 = cy + r * Math.sin((Math.PI * a1) / 180);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--fg)]">Win Rate</h2>
        <Award className="h-4 w-4 text-[var(--gold)]" />
      </div>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--danger)" />
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--emerald-bright)" />
            </linearGradient>
          </defs>
          <path d={arc(0, 180)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path
            d={arc(0, angle)}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text x="110" y="100" textAnchor="middle" className="fill-[var(--fg)] font-mono-nums" fontSize="32" fontWeight="700">
            {winRate.toFixed(1)}%
          </text>
          <text x="110" y="120" textAnchor="middle" className="fill-[var(--fg-muted)]" fontSize="11">
            214 wins / 99 losses
          </text>
        </svg>
        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <Stat label="Avg Win" value="$312" tone="emerald" />
          <Stat label="Avg Loss" value="-$148" tone="danger" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "danger" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-2.5 text-center">
      <p className={cn("font-mono-nums text-sm font-semibold", tone === "emerald" ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-[var(--fg-muted)]">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trade distribution histogram                                        */
/* ------------------------------------------------------------------ */
function TradeDistributionCard() {
  const buckets = useMemo(() => {
    const rng = seededRandom(7);
    return Array.from({ length: 9 }, (_, i) => {
      const center = i - 4; // -4..4
      const distance = Math.abs(center);
      const base = 40 * Math.exp(-(distance * distance) / 3);
      return {
        label: center === 0 ? "0%" : `${center > 0 ? "+" : ""}${center * 1.5}%`,
        count: Math.round(base + rng() * 12),
        positive: center >= 0,
      };
    });
  }, []);
  const max = Math.max(...buckets.map((b) => b.count));

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--fg)]">Trade Return Distribution</h2>
        <p className="mt-0.5 text-xs text-[var(--fg-muted)]">Histogram of trade returns (R-multiple)</p>
      </div>
      <div className="flex h-[180px] items-end gap-1.5">
        {buckets.map((b, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono-nums text-[10px] text-[var(--fg-dim)] opacity-0 transition-smooth group-hover:opacity-100">
              {b.count}
            </span>
            <div className="flex h-full w-full items-end">
              <div
                className={cn(
                  "w-full rounded-t transition-smooth group-hover:brightness-125",
                  b.positive
                    ? "bg-gradient-to-t from-[var(--emerald-deep)]/60 to-[var(--emerald)]"
                    : "bg-gradient-to-t from-[#5a1d28] to-[var(--danger)]/80"
                )}
                style={{ height: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-[var(--fg-dim)]">{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Strategy breakdown                                                  */
/* ------------------------------------------------------------------ */
function StrategyBreakdownCard() {
  const strategies = [
    { name: "Scalper Pro", trades: 142, pnl: 18240, winRate: 71, color: "var(--emerald-bright)" },
    { name: "Trend Rider", trades: 88, pnl: 14320, winRate: 64, color: "var(--gold)" },
    { name: "Grid Master", trades: 64, pnl: 9800, winRate: 58, color: "var(--info)" },
    { name: "Range Hunter", trades: 19, pnl: 6560, winRate: 73, color: "#a78bfa" },
  ];
  const totalPnl = strategies.reduce((s, st) => s + st.pnl, 0);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--fg)]">Strategy Breakdown</h2>
        <p className="mt-0.5 text-xs text-[var(--fg-muted)]">P&amp;L contribution by strategy</p>
      </div>
      <div className="space-y-3">
        {strategies.map((s) => {
          const share = (s.pnl / totalPnl) * 100;
          return (
            <div key={s.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="font-medium text-[var(--fg)]">{s.name}</span>
                  <span className="text-xs text-[var(--fg-dim)]">· {s.trades} trades</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-nums text-xs text-[var(--emerald-bright)]">
                    {formatMoney(s.pnl, 0)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)]/60 px-1.5 py-0.5 text-[10px] text-[var(--fg-muted)]">
                    <Target className="h-2.5 w-2.5" /> {s.winRate}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]/60">
                <div
                  className="h-full rounded-full transition-smooth"
                  style={{ width: `${share}%`, background: s.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Performance metrics table                                           */
/* ------------------------------------------------------------------ */
function PerformanceTableCard() {
  const rows: { metric: string; value: string; icon: React.ComponentType<{ className?: string }>; tone?: "emerald" | "danger" }[] = [
    { metric: "Total Trades", value: "313", icon: Activity },
    { metric: "Winning Trades", value: "214 (68.4%)", icon: ArrowUp, tone: "emerald" },
    { metric: "Losing Trades", value: "99 (31.6%)", icon: ArrowDown, tone: "danger" },
    { metric: "Average Win", value: "$312.40", icon: TrendingUp },
    { metric: "Average Loss", value: "-$148.20", icon: TrendingDown },
    { metric: "Largest Win", value: "$1,840.00", icon: Award },
    { metric: "Profit Factor", value: "2.41", icon: Gauge },
    { metric: "Avg Trade Duration", value: "1h 24m", icon: Clock },
    { metric: "Recovery Factor", value: "3.92", icon: Zap },
    { metric: "Expectancy", value: "$119.30", icon: Percent },
  ];
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--fg)]">Detailed Metrics</h2>
        <p className="mt-0.5 text-xs text-[var(--fg-muted)]">Comprehensive trading statistics</p>
      </div>
      <div className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="divide-y divide-[var(--border)]">
          {rows.slice(0, 5).map((r) => <MetricRow key={r.metric} {...r} />)}
        </div>
        <div className="divide-y divide-[var(--border)]">
          {rows.slice(5).map((r) => <MetricRow key={r.metric} {...r} />)}
        </div>
      </div>
    </section>
  );
}

function MetricRow({
  metric,
  value,
  icon: Icon,
  tone,
}: {
  metric: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "emerald" | "danger";
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2.5">
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "emerald"
              ? "text-[var(--emerald-bright)]"
              : tone === "danger"
              ? "text-[var(--danger)]"
              : "text-[var(--fg-muted)]"
          )}
        />
        <span className="text-sm text-[var(--fg-muted)]">{metric}</span>
      </div>
      <span className="font-mono-nums text-sm font-semibold text-[var(--fg)]">{value}</span>
    </div>
  );
}
