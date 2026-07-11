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
} from "lucide-react";
import { type ActivityLog, type LogAction } from "@/lib/admin/mt5-types";
import { actionLabel, timeAgo } from "./overview-tab";
import { cn } from "@/lib/utils";

interface Props {
  logs: ActivityLog[];
}

const FILTERS: { id: LogAction | "ALL"; label: string }[] = [
  { id: "ALL", label: "الكل" },
  { id: "CREATE", label: "إنشاء" },
  { id: "DELETE", label: "حذف" },
  { id: "MT5_ACTION", label: "إجراءات MT5" },
  { id: "LOGIN", label: "دخول" },
  { id: "2FA_ENABLED", label: "2FA" },
];

function iconFor(action: LogAction) {
  const map: Partial<Record<LogAction, { Icon: typeof Plus; tone: string }>> = {
    CREATE: { Icon: Plus, tone: "text-[var(--accent-bright)] bg-[var(--accent-dim)]" },
    UPDATE: { Icon: Settings2, tone: "text-[var(--text-secondary)] bg-white/5" },
    DELETE: { Icon: Trash2, tone: "text-[var(--danger)] bg-[var(--danger-dim)]" },
    MT5_ACTION: { Icon: Zap, tone: "text-[var(--accent-bright)] bg-[var(--accent-dim)]" },
    LOGIN: { Icon: LogIn, tone: "text-[var(--accent-bright)] bg-[var(--accent-dim)]" },
    LOGOUT: { Icon: LogOut, tone: "text-[var(--text-muted)] bg-white/5" },
    SETTINGS_CHANGE: { Icon: Settings2, tone: "text-[var(--gold-bright)] bg-[var(--gold)]/10" },
    FAILED_LOGIN: { Icon: ShieldAlert, tone: "text-[var(--danger)] bg-[var(--danger-dim)]" },
    "2FA_ENABLED": { Icon: ShieldCheck, tone: "text-[var(--accent-bright)] bg-[var(--accent-dim)]" },
    "2FA_DISABLED": { Icon: Minus, tone: "text-[var(--danger)] bg-[var(--danger-dim)]" },
  };
  return map[action] || { Icon: ActivityIcon, tone: "text-[var(--text-muted)] bg-white/5" };
}

export function LogsTab({ logs }: Props) {
  const [filter, setFilter] = useState<LogAction | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "ALL" && l.action !== filter) {
        // group 2FA together
        if (filter === "2FA_ENABLED" && l.action !== "2FA_ENABLED" && l.action !== "2FA_DISABLED")
          return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const hay = `${l.action} ${l.resource ?? ""} ${l.adminName ?? ""} ${l.ipAddress ?? ""}`.toLowerCase();
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
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">سجلّ النشاط</h1>
            <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
              {logs.length} حدث
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            تتبّع كامل لكل عملية حساسة في النظام
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          <Download className="h-4 w-4" />
          تصدير CSV
        </button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-smooth",
                filter === f.id
                  ? "border-[var(--accent)]/40 bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في السجلّات..."
            className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pr-10 pl-4 text-sm text-[var(--text-secondary)] outline-none transition-smooth placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/40"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">
            لا توجد سجلّات مطابقة
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((log) => {
              const { Icon, tone } = iconFor(log.action);
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 transition-smooth hover:bg-white/[0.02]"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {actionLabel(log.action)}
                      </p>
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono-nums text-[10px] font-medium text-[var(--text-muted)]">
                        {log.action}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {log.resource && <span className="text-[var(--text-secondary)]">{log.resource} · </span>}
                      بواسطة {log.adminName || "—"}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <span className="font-mono-nums">
                          {" "}
                          · {Object.entries(log.details)
                            .map(([k, v]) => `${k}=${String(v)}`)
                            .join(" ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="font-mono-nums text-[11px] text-[var(--text-muted)]">
                      {timeAgo(log.createdAt)}
                    </p>
                    {log.ipAddress && (
                      <p className="font-mono-nums text-[10px] text-[var(--text-muted)]">
                        {log.ipAddress}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
