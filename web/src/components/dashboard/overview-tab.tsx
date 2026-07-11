"use client";

import {
  Server,
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { type MT5Account, type ActivityLog, SERVER_LABELS } from "@/lib/admin/mt5-types";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AdminTab } from "./admin-sidebar";

interface Props {
  accounts: MT5Account[];
  logs: ActivityLog[];
  twoFAEnabled: boolean;
  onNavigate: (tab: AdminTab) => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Server;
  label: string;
  value: string;
  sub?: string;
  tone: "accent" | "gold" | "danger" | "neutral";
}) {
  const tones = {
    accent: "bg-[var(--accent-dim)] text-[var(--accent-bright)] border-[var(--accent)]/20",
    gold: "bg-[var(--gold)]/10 text-[var(--gold-bright)] border-[var(--gold)]/20",
    danger: "bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]/20",
    neutral: "bg-white/5 text-[var(--text-secondary)] border-white/10",
  };
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-smooth hover:border-[var(--border-strong)]">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{label}</p>
      {sub && <p className="mt-1 font-mono-nums text-[11px] text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

export function OverviewTab({ accounts, logs, twoFAEnabled, onNavigate }: Props) {
  const active = accounts.find((a) => a.isActive);
  const master = accounts.find((a) => a.isMaster);
  const connected = accounts.filter((a) => a.isActiveConn).length;
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalPnl = totalEquity - totalBalance;
  const pnlPositive = totalPnl >= 0;

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">نظرة عامة</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            لوحة تحكم مركزية لإدارة حسابات MT5 والأمان
          </p>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium",
            twoFAEnabled
              ? "border-[var(--accent)]/25 bg-[var(--accent-dim)] text-[var(--accent-bright)]"
              : "border-[var(--danger)]/25 bg-[var(--danger-dim)] text-[var(--danger)]",
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          {twoFAEnabled ? "المصادقة الثنائية مُفعّلة" : "المصادقة الثنائية معطّلة"}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Server}
          label="إجمالي الحسابات"
          value={String(accounts.length)}
          sub={`${connected} متصل الآن`}
          tone="neutral"
        />
        <StatCard
          icon={Zap}
          label="الحساب النشط"
          value={active ? `#${active.login}` : "—"}
          sub={active ? active.label : "لم يُحدد"}
          tone="accent"
        />
        <StatCard
          icon={Crown}
          label="الحساب الرئيسي"
          value={master ? `#${master.login}` : "—"}
          sub={master ? master.label : "لم يُحدد"}
          tone="gold"
        />
        <StatCard
          icon={pnlPositive ? TrendingUp : TrendingDown}
          label="صافي الربح/الخسارة"
          value={formatMoney(totalPnl, 2)}
          sub={`من ${formatMoney(totalBalance, 0)}`}
          tone={pnlPositive ? "accent" : "danger"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active + Master highlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                الحالة الحالية
              </h2>
              <button
                onClick={() => onNavigate("accounts")}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-bright)] transition-smooth hover:text-[var(--accent)]"
              >
                إدارة الحسابات
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Active */}
              <div
                className={cn(
                  "rounded-xl border p-4",
                  active
                    ? "border-[var(--accent)]/25 bg-[var(--accent-dim)]"
                    : "border-dashed border-[var(--border-strong)]",
                )}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  <Zap className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
                  حساب التداول النشط
                </p>
                {active ? (
                  <>
                    <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">{active.label}</p>
                    <p className="font-mono-nums text-xs text-[var(--text-muted)]">
                      #{active.login} · {SERVER_LABELS[active.server]}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          active.isActiveConn ? "bg-[var(--accent-bright)]" : "bg-[var(--danger)]",
                        )}
                      />
                      <span className={active.isActiveConn ? "text-[var(--accent-bright)]" : "text-[var(--danger)]"}>
                        {active.isActiveConn ? "متصل" : active.lastError || "غير متصل"}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                    <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
                    لا يوجد حساب نشط — اختر واحداً
                  </p>
                )}
              </div>

              {/* Master */}
              <div
                className={cn(
                  "rounded-xl border p-4",
                  master
                    ? "border-[var(--gold)]/25 bg-[var(--gold)]/10"
                    : "border-dashed border-[var(--border-strong)]",
                )}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  <Crown className="h-3.5 w-3.5 text-[var(--gold-bright)]" />
                  مصدر نسخ الصفقات
                </p>
                {master ? (
                  <>
                    <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">{master.label}</p>
                    <p className="font-mono-nums text-xs text-[var(--text-muted)]">
                      #{master.login} · {SERVER_LABELS[master.server]}
                    </p>
                    <p className="mt-2 text-xs text-[var(--gold-bright)]">
                      يُنسخ منه إلى جميع المتابعين
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    لم يتم تعيين حساب رئيسي بعد
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Accounts mini list */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-base font-bold text-[var(--text-primary)]">الحسابات</h2>
            <div className="mt-3 space-y-2">
              {accounts.slice(0, 4).map((a) => {
                const pnl = a.equity - a.balance;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] px-4 py-3 transition-smooth hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          a.isActiveConn ? "bg-[var(--accent-bright)]" : "bg-[var(--text-muted)]",
                        )}
                      />
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                          {a.label}
                          {a.isActive && (
                            <span className="rounded bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-bright)]">
                              ACTIVE
                            </span>
                          )}
                          {a.isMaster && (
                            <span className="rounded bg-[var(--gold)]/15 px-1.5 py-0.5 text-[9px] font-bold text-[var(--gold-bright)]">
                              MASTER
                            </span>
                          )}
                        </p>
                        <p className="font-mono-nums text-[11px] text-[var(--text-muted)]">
                          #{a.login} · {SERVER_LABELS[a.server]}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-mono-nums text-sm font-semibold text-[var(--text-primary)]">
                        {formatMoney(a.equity, 0)}
                      </p>
                      <p
                        className={cn(
                          "font-mono-nums text-[11px]",
                          pnl >= 0 ? "text-[var(--accent-bright)]" : "text-[var(--danger)]",
                        )}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {formatMoney(pnl, 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">آخر النشاطات</h2>
            <button
              onClick={() => onNavigate("logs")}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-bright)] transition-smooth hover:text-[var(--accent)]"
            >
              الكل
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {recentLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">لا يوجد نشاط بعد</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)]">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--text-secondary)]">
                      {actionLabel(log.action)}
                    </p>
                    <p className="truncate font-mono-nums text-[10px] text-[var(--text-muted)]">
                      {log.resource} · {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers shared with logs tab */
export function actionLabel(action: string): string {
  const map: Record<string, string> = {
    CREATE: "إنشاء حساب",
    UPDATE: "تحديث حساب",
    DELETE: "حذف حساب",
    MT5_ACTION: "إجراء MT5",
    LOGIN: "تسجيل دخول",
    LOGOUT: "تسجيل خروج",
    SETTINGS_CHANGE: "تغيير الإعدادات",
    FAILED_LOGIN: "محاولة دخول فاشلة",
    "2FA_ENABLED": "تفعيل المصادقة الثنائية",
    "2FA_DISABLED": "تعطيل المصادقة الثنائية",
  };
  return map[action] || action;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} ي`;
}
