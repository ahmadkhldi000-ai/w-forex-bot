"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type PayStatus = "succeeded" | "failed" | "pending" | "refunded";

type Payment = {
  id: string;
  user: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  status: PayStatus;
  date: string;
};

const DATA: Payment[] = [
  { id: "PAY-9001", user: "أحمد خالدي", email: "ahmad@example.com", amount: 49, currency: "USD", method: "Visa •••• 4242", status: "succeeded", date: "2026-07-09 14:32" },
  { id: "PAY-9002", user: "سارة المنصور", email: "sara@example.com", amount: 149, currency: "USD", method: "Mastercard •••• 8819", status: "succeeded", date: "2026-07-08 09:15" },
  { id: "PAY-9003", user: "محمد العتيبي", email: "mohammed@example.com", amount: 49, currency: "USD", method: "Visa •••• 1100", status: "failed", date: "2026-07-07 18:44" },
  { id: "PAY-9004", user: "Lena Fischer", email: "lena@example.com", amount: 49, currency: "EUR", method: "PayPal", status: "succeeded", date: "2026-07-06 11:22" },
  { id: "PAY-9005", user: "Omar Haddad", email: "omar@example.com", amount: 49, currency: "USD", method: "Visa •••• 5566", status: "pending", date: "2026-07-05 22:10" },
  { id: "PAY-9006", user: "فاطمة الزهراني", email: "fatima@example.com", amount: 149, currency: "USD", method: "Mastercard •••• 3300", status: "succeeded", date: "2026-07-04 08:00" },
  { id: "PAY-9007", user: "نور الدين", email: "nour@example.com", amount: 49, currency: "USD", method: "Visa •••• 7788", status: "refunded", date: "2026-07-03 16:35" },
  { id: "PAY-9008", user: "Yuki Tanaka", email: "yuki@example.com", amount: 149, currency: "USD", method: "Visa •••• 2020", status: "succeeded", date: "2026-07-02 13:48" },
];

const statusLabels: Record<PayStatus, string> = {
  succeeded: "ناجح",
  failed: "فاشل",
  pending: "قيد المعالجة",
  refunded: "مسترد",
};

export default function AdminPaymentsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PayStatus | "all">("all");

  const filtered = useMemo(() => {
    return DATA.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.user.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchS = statusFilter === "all" || p.status === statusFilter;
      return matchQ && matchS;
    });
  }, [query, statusFilter]);

  const totalRevenue = DATA.filter((p) => p.status === "succeeded").reduce((s, p) => s + p.amount, 0);
  const failedCount = DATA.filter((p) => p.status === "failed").length;
  const refundedTotal = DATA.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);
  const successRate = ((DATA.filter((p) => p.status === "succeeded").length / DATA.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="المدفوعات" />
        <main className="p-8">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiTile icon={DollarSign} label="إجمالي الإيرادات" value={`$${totalRevenue.toLocaleString()}`} accent="var(--emerald-bright)" />
            <KpiTile icon={TrendingUp} label="معدل النجاح" value={`${successRate}%`} accent="var(--accent-bright)" />
            <KpiTile icon={XCircle} label="مدفوعات فاشلة" value={failedCount.toString()} accent="var(--danger)" />
            <KpiTile icon={RefreshCw} label="مبالغ مستردة" value={`$${refundedTotal}`} accent="var(--gold-bright)" />
          </div>

          {/* toolbar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث في المدفوعات..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 pr-10 pl-4 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PayStatus | "all")}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--emerald)]"
              >
                <option value="all">كل الحالات</option>
                <option value="succeeded">ناجح</option>
                <option value="failed">فاشل</option>
                <option value="pending">قيد المعالجة</option>
                <option value="refunded">مسترد</option>
              </select>
              <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-hover)]">
                <Download className="h-4 w-4" />
                تصدير
              </button>
            </div>
          </div>

          {/* table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                    <th className="px-5 py-3 font-semibold">المعرف</th>
                    <th className="px-5 py-3 font-semibold">المستخدم</th>
                    <th className="px-5 py-3 font-semibold">المبلغ</th>
                    <th className="px-5 py-3 font-semibold">طريقة الدفع</th>
                    <th className="px-5 py-3 font-semibold">الحالة</th>
                    <th className="px-5 py-3 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((p) => (
                    <tr key={p.id} className="transition-smooth hover:bg-[var(--bg-hover)]/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[var(--text-muted)]" />
                          <span className="font-mono-nums text-xs font-medium text-[var(--text-secondary)]">{p.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{p.user}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{p.email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono-nums text-sm font-semibold text-[var(--text-primary)]">
                        ${p.amount} <span className="text-[var(--text-muted)]">{p.currency}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">{p.method}</td>
                      <td className="px-5 py-3.5">
                        <PayStatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--text-muted)]">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Wallet className="mx-auto mb-3 h-8 w-8 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">لا توجد مدفوعات مطابقة</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function PayStatusBadge({ status }: { status: PayStatus }) {
  const map = {
    succeeded: { c: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20", Icon: CheckCircle2 },
    failed: { c: "bg-[var(--danger)]/12 text-[var(--danger)] border-[var(--danger)]/20", Icon: XCircle },
    pending: { c: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20", Icon: Clock },
    refunded: { c: "bg-[var(--info)]/12 text-[var(--info)] border-[var(--info)]/20", Icon: RefreshCw },
  } as const;
  const { c, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c}`}>
      <Icon className="h-3 w-3" />
      {statusLabels[status]}
    </span>
  );
}
