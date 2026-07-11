"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Plus,
  Minus,
  Trash2,
  Settings2,
  LogIn,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity as ActivityIcon,
  Filter,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { useMt5Store } from "@/lib/admin/use-mt5-store";
import { type ActivityLog, type LogAction } from "@/lib/admin/mt5-types";
import { cn } from "@/lib/utils";

const FILTERS: { key: LogAction | "ALL"; label: string }[] = [
  { key: "ALL", label: "الكل" },
  { key: "MT5_ACTION", label: "MT5" },
  { key: "CREATE", label: "إضافة" },
  { key: "DELETE", label: "حذف" },
  { key: "2FA_ENABLED", label: "2FA" },
  { key: "LOGIN", label: "دخول" },
  { key: "FAILED_LOGIN", label: "محاولات فاشلة" },
];

export default function ActivityLogsPage() {
  const { logs } = useMt5Store();
  const [filter, setFilter] = useState<LogAction | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "ALL" && l.action !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${l.action} ${l.resource ?? ""} ${l.adminName ?? ""} ${JSON.stringify(l.details ?? {})}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, filter, query]);

  const exportCsv = () => {
    const rows = [
      ["time", "action", "resource", "admin", "ip", "details"],
      ...filtered.map((l) => [
        l.createdAt,
        l.action,
        l.resource ?? "",
        l.adminName ?? "",
        l.ipAddress ?? "",
        JSON.stringify(l.details ?? {}),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <AdminTopbar title="سجلّات النشاط" />
      <main className="lg:pr-[252px]">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
                <ActivityIcon className="h-6 w-6 text-[var(--emerald)]" />
                سجلّات النشاط
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {logs.length} حدث · سجلّ كامل لجميع العمليات الحسّاسة في النظام
              </p>
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-smooth hover:border-[var(--emerald)]/40 hover:text-[var(--text-primary)]"
            >
              <Download className="h-4 w-4" /> تصدير CSV
            </button>
          </div>

          {/* filters */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث في السجلّات…"
                className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] py-2.5 pr-10 pl-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--emerald)] focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/20"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-smooth",
                    filter === f.key
                      ? "bg-[var(--emerald)] text-black"
                      : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* timeline */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--text-muted)]">لا توجد سجلّات مطابقة</div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {filtered.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LogRow({ log }: { log: ActivityLog }) {
  const meta = actionMeta(log.action);
  const Icon = meta.icon;
  const detail = describe(log);
  return (
    <li className="group flex items-start gap-3 px-4 py-3 transition-smooth hover:bg-[var(--surface-2)]/50">
      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.bg, meta.color)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide", meta.bg, meta.color)}>
            {log.action}
          </span>
          {log.resource && (
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 font-mono-nums text-[10px] text-[var(--text-muted)]">
              {log.resource}
            </span>
          )}
          <span className="text-sm text-[var(--text-secondary)]">{detail}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-full bg-[var(--gold)]/20 text-center text-[8px] font-bold leading-4 text-[var(--gold-bright)]">
              {(log.adminName ?? "?")[0]}
            </span>
            {log.adminName ?? "—"}
          </span>
          {log.ipAddress && <span className="font-mono-nums">{log.ipAddress}</span>}
          <span>{timeAgo(log.createdAt)}</span>
        </div>
      </div>
    </li>
  );
}

function actionMeta(a: LogAction): { icon: React.ElementType; color: string; bg: string } {
  switch (a) {
    case "CREATE": return { icon: Plus, color: "text-[var(--emerald-bright)]", bg: "bg-[var(--emerald)]/12" };
    case "DELETE": return { icon: Trash2, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/12" };
    case "UPDATE": return { icon: Settings2, color: "text-[var(--info)]", bg: "bg-[var(--info)]/12" };
    case "MT5_ACTION": return { icon: Zap, color: "text-[var(--gold-bright)]", bg: "bg-[var(--gold)]/12" };
    case "LOGIN": return { icon: LogIn, color: "text-[var(--emerald-bright)]", bg: "bg-[var(--emerald)]/12" };
    case "LOGOUT": return { icon: LogOut, color: "text-[var(--text-muted)]", bg: "bg-[var(--surface-2)]" };
    case "2FA_ENABLED": return { icon: ShieldCheck, color: "text-[var(--emerald-bright)]", bg: "bg-[var(--emerald)]/12" };
    case "2FA_DISABLED": return { icon: ShieldAlert, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/12" };
    case "FAILED_LOGIN": return { icon: ShieldAlert, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/12" };
    default: return { icon: Minus, color: "text-[var(--text-muted)]", bg: "bg-[var(--surface-2)]" };
  }
}

function describe(l: ActivityLog): string {
  const d = (l.details ?? {}) as Record<string, unknown>;
  switch (l.action) {
    case "CREATE": return `أضاف حساب «${d.label ?? "—"}» (${d.login ?? ""})`;
    case "UPDATE": return `عدّل «${d.label ?? "—"}» — ${(d.fields as string[] | undefined)?.join(", ") ?? ""}`;
    case "DELETE": return `حذف «${d.label ?? "—"}» (#${d.login ?? ""})`;
    case "MT5_ACTION": {
      const act = d.action as string | undefined;
      if (act === "set_active") return `نشّط حساب «${d.label ?? "—"}»`;
      if (act === "set_master") return `عيّن «${d.label ?? "—"}» كحساب رئيسي`;
      if (act === "connect") return `اتصل بـ «${d.label ?? "—"}»`;
      if (act === "disconnect") return `قطع اتصال «${d.label ?? "—"}»`;
      return act ?? "إجراء MT5";
    }
    case "2FA_ENABLED": return `فعّل المصادقة الثنائية (${d.method ?? "TOTP"})`;
    case "2FA_DISABLED": return "عطّل المصادقة الثنائية";
    case "LOGIN": return `تسجيل دخول — ${d.method ?? "كلمة مرور + 2FA"}`;
    case "FAILED_LOGIN": return `محاولة دخول فاشلة — ${d.reason ?? ""}`;
    case "SETTINGS_CHANGE": return `غيّر الإعداد «${d.key ?? ""}»`;
    default: return "—";
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
}
