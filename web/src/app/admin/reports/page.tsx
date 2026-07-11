"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { seededRandom, randomWalk } from "@/lib/utils";

type Range = "7D" | "30D" | "90D" | "1Y";

export default function AdminReportsPage() {
  const [range, setRange] = useState<Range>("30D");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="التقارير والتحليلات" />
        <main className="p-8">
          {/* header with range */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <BarChart3 className="h-4 w-4 text-[var(--emerald)]" />
                نظرة عامة على الأداء
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">تحليلات النمو والإيرادات للمنصة</p>
            </div>
            <div className="flex items-center gap-2">
              <RangePicker value={range} onChange={setRange} />
              <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-hover)]">
                <Download className="h-4 w-4" />
                تصدير
              </button>
            </div>
          </div>

          {/* KPI tiles */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiTile icon={Users} label="مستخدمون جدد" value="248" change="+18%" trend="up" accent="var(--emerald-bright)" />
            <KpiTile icon={DollarSign} label="الإيرادات" value="$28,490" change="+12%" trend="up" accent="var(--accent-bright)" />
            <KpiTile icon={Activity} label="الصفقات" value="14,820" change="+7%" trend="up" accent="var(--info)" />
            <KpiTile icon={TrendingUp} label="معدل الاحتفاظ" value="94.2%" change="-1.2%" trend="down" accent="var(--gold-bright)" />
          </div>

          {/* revenue chart */}
          <RevenueChartCard range={range} />

          {/* two-up */}
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <UserGrowthCard range={range} />
            <PlanDistributionCard />
          </div>

          {/* trade volume by symbol */}
          <SymbolVolumeCard />
        </main>
      </div>
    </div>
  );
}

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const ranges: Range[] = ["7D", "30D", "90D", "1Y"];
  return (
    <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth ${
            value === r ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  change,
  trend,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${trend === "up" ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"}`}>
          {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function RevenueChartCard({ range }: { range: Range }) {
  const data = useMemo(() => {
    const lenMap: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 60, "1Y": 120 };
    const seedMap: Record<Range, number> = { "7D": 71, "30D": 72, "90D": 73, "1Y": 74 };
    return randomWalk(seedMap[range], lenMap[range], 800, 0.03, 0.008);
  }, [range]);

  const { path, area, max } = useMemo(() => {
    const W = 1000, H = 260, pad = 16;
    const min = Math.min(...data), max = Math.max(...data);
    const span = max - min || 1;
    const pts = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / span) * (H - pad * 2);
      return [x, y] as const;
    });
    const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    const area = `${path} L${pts[pts.length - 1][0]},${H - pad} L${pts[0][0]},${H - pad} Z`;
    return { path, area, max };
  }, [data]);

  return (
    <section className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">الإيرادات اليومية</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">آخر {range}</p>
        </div>
        <span className="font-mono-nums text-lg font-bold text-[var(--emerald-bright)]">
          ${Math.round(max).toLocaleString()}
        </span>
      </div>
      <svg viewBox="0 0 1000 260" className="h-[260px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="16" x2="984" y1={16 + g * 228} y2={16 + g * 228} stroke="rgba(255,255,255,0.04)" />
        ))}
        <path d={area} fill="url(#revGrad)" />
        <path d={path} fill="none" stroke="var(--emerald-bright)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </section>
  );
}

function UserGrowthCard({ range }: { range: Range }) {
  const data = useMemo(() => {
    const lenMap: Record<Range, number> = { "7D": 7, "30D": 20, "90D": 40, "1Y": 52 };
    const seedMap: Record<Range, number> = { "7D": 81, "30D": 82, "90D": 83, "1Y": 84 };
    return randomWalk(seedMap[range], lenMap[range], 1200, 0.01, 0.006);
  }, [range]);

  const { path, area } = useMemo(() => {
    const W = 480, H = 200, pad = 12;
    const min = Math.min(...data), max = Math.max(...data);
    const span = max - min || 1;
    const pts = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / span) * (H - pad * 2);
      return [x, y] as const;
    });
    const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    const area = `${path} L${pts[pts.length - 1][0]},${H - pad} L${pts[0][0]},${H - pad} Z`;
    return { path, area };
  }, [data]);

  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">نمو المستخدمين</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">إجمالي المستخدمين عبر الوقت</p>
      </div>
      <svg viewBox="0 0 480 200" className="h-[200px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--info)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#userGrad)" />
        <path d={path} fill="none" stroke="var(--info)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </section>
  );
}

function PlanDistributionCard() {
  const plans = [
    { name: "Starter", count: 1024, color: "var(--info)" },
    { name: "Pro", count: 1182, color: "var(--emerald-bright)" },
    { name: "Elite", count: 641, color: "var(--gold-bright)" },
  ];
  const total = plans.reduce((s, p) => s + p.count, 0);

  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">توزيع الباقات</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">المشتركون حسب الباقة</p>
      </div>
      <div className="flex h-[200px] items-end gap-4">
        {plans.map((p) => {
          const h = (p.count / total) * 100 * 2;
          return (
            <div key={p.name} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-mono-nums text-xs font-semibold text-[var(--text-secondary)]">
                {p.count.toLocaleString()}
              </span>
              <div className="flex w-full max-w-[60px] flex-1 items-end">
                <div
                  className="w-full rounded-t-md transition-smooth"
                  style={{ height: `${Math.min(h, 100)}%`, background: p.color }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">{p.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SymbolVolumeCard() {
  const symbols = [
    { sym: "EUR/USD", vol: 4280, trades: 3120 },
    { sym: "GBP/USD", vol: 3120, trades: 2280 },
    { sym: "XAU/USD", vol: 2890, trades: 1640 },
    { sym: "USD/JPY", vol: 2240, trades: 1480 },
    { sym: "BTC/USD", vol: 1820, trades: 980 },
    { sym: "GBP/JPY", vol: 1440, trades: 720 },
  ];
  const maxVol = Math.max(...symbols.map((s) => s.vol));
  const rng = seededRandom(5);

  return (
    <section className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">حجم التداول حسب الرمز</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">أكثر الرموز تداولاً هذا الشهر</p>
      </div>
      <div className="space-y-3">
        {symbols.map((s) => {
          const pct = (s.vol / maxVol) * 100;
          const colors = ["var(--emerald-bright)", "var(--gold-bright)", "var(--info)", "var(--emerald)", "var(--gold)", "var(--info)"];
          const color = colors[Math.floor(rng() * colors.length)];
          return (
            <div key={s.sym}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--text-primary)]">{s.sym}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono-nums text-xs text-[var(--text-secondary)]">{s.vol.toLocaleString()} حجم</span>
                  <span className="font-mono-nums text-xs text-[var(--text-muted)]">{s.trades.toLocaleString()} صفقة</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]/60">
                <div className="h-full rounded-full transition-smooth" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
