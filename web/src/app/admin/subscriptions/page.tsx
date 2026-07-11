"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Crown,
  Zap,
  Sparkles,
  Download,
  Search,
  Repeat,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type Plan = "starter" | "pro" | "elite";
type SubStatus = "active" | "canceled" | "past_due" | "trialing";

type Sub = {
  id: string;
  user: string;
  email: string;
  plan: Plan;
  status: SubStatus;
  mrr: number;
  started: string;
  renews: string;
};

const DATA: Sub[] = [
  { id: "SUB-2001", user: "أحمد خالدي", email: "ahmad@example.com", plan: "pro", status: "active", mrr: 49, started: "2026-01-12", renews: "2026-08-12" },
  { id: "SUB-2002", user: "سارة المنصور", email: "sara@example.com", plan: "elite", status: "active", mrr: 149, started: "2026-02-03", renews: "2026-08-03" },
  { id: "SUB-2003", user: "محمد العتيبي", email: "mohammed@example.com", plan: "starter", status: "trialing", mrr: 0, started: "2026-07-01", renews: "2026-07-15" },
  { id: "SUB-2004", user: "Lena Fischer", email: "lena@example.com", plan: "pro", status: "active", mrr: 49, started: "2026-03-22", renews: "2026-08-22" },
  { id: "SUB-2005", user: "Omar Haddad", email: "omar@example.com", plan: "pro", status: "past_due", mrr: 49, started: "2026-04-18", renews: "2026-07-18" },
  { id: "SUB-2006", user: "فاطمة الزهراني", email: "fatima@example.com", plan: "elite", status: "active", mrr: 149, started: "2025-11-09", renews: "2026-08-09" },
  { id: "SUB-2007", user: "نور الدين", email: "nour@example.com", plan: "pro", status: "active", mrr: 49, started: "2026-05-14", renews: "2026-08-14" },
  { id: "SUB-2008", user: "Yuki Tanaka", email: "yuki@example.com", plan: "elite", status: "active", mrr: 149, started: "2026-01-30", renews: "2026-08-30" },
  { id: "SUB-2009", user: "خالد بن سعيد", email: "khalid@example.com", plan: "starter", status: "canceled", mrr: 0, started: "2026-06-20", renews: "—" },
];

const planLabels: Record<Plan, string> = { starter: "Starter", pro: "Pro", elite: "Elite" };
const statusLabels: Record<SubStatus, string> = {
  active: "نشط",
  canceled: "ملغى",
  past_due: "متأخر الدفع",
  trialing: "تجريبي",
};

export default function AdminSubscriptionsPage() {
  const [query, setQuery] = useState("");

  const filtered = DATA.filter((s) => {
    const q = query.trim().toLowerCase();
    return !q || s.user.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  const totalMrr = DATA.filter((s) => s.status === "active").reduce((sum, s) => sum + s.mrr, 0);
  const activeCount = DATA.filter((s) => s.status === "active").length;
  const trialCount = DATA.filter((s) => s.status === "trialing").length;
  const churnRate = ((DATA.filter((s) => s.status === "canceled").length / DATA.length) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="إدارة الاشتراكات" />
        <main className="p-8">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiTile icon={DollarSign} label="MRR الإجمالي" value={`$${totalMrr.toLocaleString()}`} change="+8.2%" trend="up" accent="var(--accent-bright)" />
            <KpiTile icon={Users} label="مشترك نشط" value={activeCount.toString()} change="+3" trend="up" accent="var(--emerald-bright)" />
            <KpiTile icon={Sparkles} label="تجريبي" value={trialCount.toString()} change="+2" trend="up" accent="var(--gold-bright)" />
            <KpiTile icon={Repeat} label="معدل التسرب" value={`${churnRate}%`} change="-0.4%" trend="down" accent="var(--info)" />
          </div>

          {/* plan distribution */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PlanDistCard
              icon={Sparkles}
              name="Starter"
              count={DATA.filter((s) => s.plan === "starter").length}
              total={DATA.length}
              revenue={DATA.filter((s) => s.plan === "starter").reduce((a, b) => a + b.mrr, 0)}
              accent="var(--info)"
            />
            <PlanDistCard
              icon={Zap}
              name="Pro"
              count={DATA.filter((s) => s.plan === "pro").length}
              total={DATA.length}
              revenue={DATA.filter((s) => s.plan === "pro").reduce((a, b) => a + b.mrr, 0)}
              accent="var(--emerald-bright)"
            />
            <PlanDistCard
              icon={Crown}
              name="Elite"
              count={DATA.filter((s) => s.plan === "elite").length}
              total={DATA.length}
              revenue={DATA.filter((s) => s.plan === "elite").reduce((a, b) => a + b.mrr, 0)}
              accent="var(--gold-bright)"
            />
          </div>

          {/* toolbar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث في الاشتراكات..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pr-10 pl-4 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)]"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-hover)]">
              <Download className="h-4 w-4" />
              تصدير
            </button>
          </div>

          {/* table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    <th className="px-5 py-3 font-semibold">المشترك</th>
                    <th className="px-5 py-3 font-semibold">الباقة</th>
                    <th className="px-5 py-3 font-semibold">الحالة</th>
                    <th className="px-5 py-3 font-semibold">MRR</th>
                    <th className="px-5 py-3 font-semibold">بدأ في</th>
                    <th className="px-5 py-3 font-semibold">يتجدد في</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition-smooth hover:bg-[var(--bg-hover)]/40">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{s.user}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{s.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: planAccent(s.plan) }}>
                          {planLabels[s.plan]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <SubStatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3.5 font-mono-nums text-sm text-[var(--text-primary)]">
                        {s.mrr > 0 ? `$${s.mrr}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{s.started}</td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{s.renews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function planAccent(plan: Plan): string {
  return plan === "elite" ? "var(--gold-bright)" : plan === "pro" ? "var(--emerald-bright)" : "var(--info)";
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
          {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function PlanDistCard({
  icon: Icon,
  name,
  count,
  total,
  revenue,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  count: number;
  total: number;
  revenue: number;
  accent: string;
}) {
  const pct = (count / total) * 100;
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{name}</h3>
          <p className="text-[11px] text-[var(--text-muted)]">{count} مشترك · ${revenue}/شهر</p>
        </div>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">الحصة</span>
        <span className="font-mono-nums font-semibold text-[var(--text-secondary)]">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]/60">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}

function SubStatusBadge({ status }: { status: SubStatus }) {
  const map = {
    active: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20",
    trialing: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20",
    past_due: "bg-[var(--danger)]/12 text-[var(--danger)] border-[var(--danger)]/20",
    canceled: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
