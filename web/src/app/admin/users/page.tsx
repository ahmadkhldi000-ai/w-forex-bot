"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  UserPlus,
  Mail,
  Filter,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type UserStatus = "active" | "suspended" | "trial";
type UserPlan = "starter" | "pro" | "elite";

type Row = {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: UserStatus;
  bots: number;
  joined: string;
  mrr: number;
  country: string;
};

const SEED: Row[] = [
  { id: "U-1042", name: "أحمد خالدي", email: "ahmad@example.com", plan: "pro", status: "active", bots: 3, joined: "2026-01-12", mrr: 49, country: "الأردن" },
  { id: "U-1043", name: "سارة المنصور", email: "sara@example.com", plan: "elite", status: "active", bots: 8, joined: "2026-02-03", mrr: 149, country: "الإمارات" },
  { id: "U-1044", name: "محمد العتيبي", email: "mohammed@example.com", plan: "starter", status: "trial", bots: 1, joined: "2026-07-01", mrr: 0, country: "السعودية" },
  { id: "U-1045", name: "Lena Fischer", email: "lena@example.com", plan: "pro", status: "active", bots: 5, joined: "2026-03-22", mrr: 49, country: "ألمانيا" },
  { id: "U-1046", name: "Omar Haddad", email: "omar@example.com", plan: "pro", status: "suspended", bots: 2, joined: "2026-04-18", mrr: 49, country: "لبنان" },
  { id: "U-1047", name: "فاطمة الزهراني", email: "fatima@example.com", plan: "elite", status: "active", bots: 12, joined: "2025-11-09", mrr: 149, country: "السعودية" },
  { id: "U-1048", name: "James Carter", email: "james@example.com", plan: "starter", status: "trial", bots: 1, joined: "2026-07-05", mrr: 0, country: "بريطانيا" },
  { id: "U-1049", name: "نور الدين", email: "nour@example.com", plan: "pro", status: "active", bots: 4, joined: "2026-05-14", mrr: 49, country: "تونس" },
  { id: "U-1050", name: "Yuki Tanaka", email: "yuki@example.com", plan: "elite", status: "active", bots: 6, joined: "2026-01-30", mrr: 149, country: "اليابان" },
  { id: "U-1051", name: "خالد بن سعيد", email: "khalid@example.com", plan: "starter", status: "suspended", bots: 0, joined: "2026-06-20", mrr: 0, country: "عُمان" },
];

const planLabels: Record<UserPlan, string> = { starter: "Starter", pro: "Pro", elite: "Elite" };
const statusLabels: Record<UserStatus, string> = { active: "نشط", suspended: "موقوف", trial: "تجريبي" };

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<UserPlan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const filtered = useMemo(() => {
    return SEED.filter((u) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const matchP = planFilter === "all" || u.plan === planFilter;
      const matchS = statusFilter === "all" || u.status === statusFilter;
      return matchQ && matchP && matchS;
    });
  }, [query, planFilter, statusFilter]);

  const totalMrr = filtered.reduce((s, u) => s + u.mrr, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="إدارة المستخدمين" />
        <main className="p-8">
          {/* summary tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryTile label="إجمالي المستخدمين" value={filtered.length.toLocaleString()} accent="var(--accent)" />
            <SummaryTile label="المشتركون" value={filtered.filter((u) => u.status === "active").length.toString()} accent="var(--emerald-bright)" />
            <SummaryTile label="تجريبي" value={filtered.filter((u) => u.status === "trial").length.toString()} accent="var(--gold-bright)" />
            <SummaryTile label="MRR" value={`$${totalMrr.toLocaleString()}`} accent="var(--info)" />
          </div>

          {/* toolbar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث بالاسم، البريد، أو المعرف..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pr-10 pl-4 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-muted)]" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as UserPlan | "all")}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--emerald)]"
              >
                <option value="all">كل الباقات</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--emerald)]"
              >
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="trial">تجريبي</option>
                <option value="suspended">موقوف</option>
              </select>
              <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">مستخدم جديد</span>
              </button>
            </div>
          </div>

          {/* table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    <th className="px-5 py-3 font-semibold">المستخدم</th>
                    <th className="px-5 py-3 font-semibold">الباقة</th>
                    <th className="px-5 py-3 font-semibold">الحالة</th>
                    <th className="px-5 py-3 font-semibold">البوتات</th>
                    <th className="px-5 py-3 font-semibold">الدولة</th>
                    <th className="px-5 py-3 font-semibold">MRR</th>
                    <th className="px-5 py-3 font-semibold">انضم</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((u) => (
                    <tr key={u.id} className="transition-smooth hover:bg-[var(--bg-hover)]/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--emerald-deep)] to-[var(--emerald-bright)] text-xs font-bold text-black">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanBadge plan={u.plan} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-5 py-3.5 font-mono-nums text-sm text-[var(--text-secondary)]">{u.bots}</td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">{u.country}</td>
                      <td className="px-5 py-3.5 font-mono-nums text-sm text-[var(--text-primary)]">
                        {u.mrr > 0 ? `$${u.mrr}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{u.joined}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <IconBtn icon={Mail} title="مراسلة" />
                          {u.status === "suspended" ? (
                            <IconBtn icon={CheckCircle2} title="تفعيل" tone="emerald" />
                          ) : (
                            <IconBtn icon={Ban} title="إيقاف" tone="danger" />
                          )}
                          <IconBtn icon={MoreHorizontal} title="المزيد" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-[var(--text-muted)]">لا يوجد مستخدمون مطابقون</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>عرض {filtered.length} من {SEED.length} مستخدم</span>
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 transition-smooth hover:bg-[var(--bg-hover)]">
              <Download className="h-3.5 w-3.5" />
              تصدير CSV
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-2 h-1 w-10 rounded-full" style={{ background: accent }} />
      <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function PlanBadge({ plan }: { plan: UserPlan }) {
  const map = {
    starter: "bg-[var(--info)]/12 text-[var(--info)] border-[var(--info)]/20",
    pro: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20",
    elite: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[plan]}`}>
      {planLabels[plan]}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map = {
    active: { c: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20", Icon: ShieldCheck },
    trial: { c: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20", Icon: ShieldCheck },
    suspended: { c: "bg-[var(--danger)]/12 text-[var(--danger)] border-[var(--danger)]/20", Icon: ShieldAlert },
  } as const;
  const { c, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c}`}>
      <Icon className="h-3 w-3" />
      {statusLabels[status]}
    </span>
  );
}

function IconBtn({
  icon: Icon,
  title,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone?: "emerald" | "danger";
}) {
  return (
    <button
      title={title}
      className={`rounded-lg p-2 transition-smooth hover:bg-[var(--bg-hover)] ${
        tone === "emerald"
          ? "text-[var(--text-muted)] hover:text-[var(--emerald-bright)]"
          : tone === "danger"
          ? "text-[var(--text-muted)] hover:text-[var(--danger)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
