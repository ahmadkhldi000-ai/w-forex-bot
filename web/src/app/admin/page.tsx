"use client";

import {
  Users,
  Repeat,
  DollarSign,
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  ShieldCheck,
  Crown,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { useMt5Store } from "@/lib/admin/use-mt5-store";
import { formatMoney } from "@/lib/utils";

export default function AdminOverviewPage() {
  const store = useMt5Store();

  const activeAccount = store.accounts.find((a) => a.isActive);
  const masterAccount = store.accounts.find((a) => a.isMaster);
  const connectedCount = store.accounts.filter((a) => a.isActiveConn).length;
  const totalEquity = store.accounts.reduce((s, a) => s + a.equity, 0);

  const stats = [
    {
      label: "إجمالي المستخدمين",
      value: "2,847",
      change: "+12.4%",
      trend: "up",
      icon: Users,
      color: "var(--accent)",
    },
    {
      label: "اشتراكات نشطة",
      value: "1,432",
      change: "+8.1%",
      trend: "up",
      icon: Repeat,
      color: "var(--gold)",
    },
    {
      label: "إجمالي الإيرادات",
      value: "$48,290",
      change: "+23.7%",
      trend: "up",
      icon: DollarSign,
      color: "var(--accent-bright)",
    },
    {
      label: "صفقات اليوم",
      value: "186",
      change: "-3.2%",
      trend: "down",
      icon: Activity,
      color: "var(--info)",
    },
  ];

  // recent activity from the store logs
  const recentLogs = store.logs.slice(0, 6).map((l) => {
    const map: Record<string, { c: string; Icon: typeof CheckCircle2 }> = {
      CREATE: { c: "text-[var(--emerald-bright)]", Icon: CheckCircle2 },
      DELETE: { c: "text-[var(--danger)]", Icon: AlertTriangle },
      UPDATE: { c: "text-[var(--info)]", Icon: Activity },
      MT5_ACTION: { c: "text-[var(--gold-bright)]", Icon: Server },
      LOGIN: { c: "text-[var(--accent)]", Icon: Lock },
      LOGOUT: { c: "text-[var(--text-muted)]", Icon: Lock },
      "2FA_ENABLED": { c: "text-[var(--emerald-bright)]", Icon: ShieldCheck },
      "2FA_DISABLED": { c: "text-[var(--danger)]", Icon: ShieldCheck },
    };
    const m = map[l.action] ?? { c: "text-[var(--text-muted)]", Icon: Activity };
    const labels: Record<string, string> = {
      CREATE: "إضافة حساب",
      DELETE: "حذف حساب",
      UPDATE: "تحديث",
      MT5_ACTION: "إجراء MT5",
      LOGIN: "تسجيل دخول",
      LOGOUT: "تسجيل خروج",
      "2FA_ENABLED": "تفعيل المصادقة الثنائية",
      "2FA_DISABLED": "إلغاء المصادقة الثنائية",
      SETTINGS_CHANGE: "تغيير الإعدادات",
      FAILED_LOGIN: "محاولة دخول فاشلة",
    };
    return {
      Icon: m.Icon,
      c: m.c,
      title: labels[l.action] ?? l.action,
      detail: l.details?.label ?? l.details?.server ?? l.details?.method ?? "",
      time: l.createdAt,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="نظرة عامة" />
        <main className="p-8">
          {/* Welcome banner */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                مرحباً، Super Admin 👋
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                لوحة تحكم إدارة المنصة — آخر تحديث: الآن
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--emerald)]/15 bg-[var(--emerald)]/8 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--emerald-bright)]" />
              </span>
              <span className="text-xs font-semibold text-[var(--emerald-bright)]">
                النظام يعمل
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-smooth hover:border-[var(--border-strong)]"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                        color: s.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                        s.trend === "up"
                          ? "text-[var(--emerald-bright)]"
                          : "text-[var(--danger)]"
                      }`}
                    >
                      {s.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {s.change}
                    </span>
                  </div>
                  <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* MT5 Accounts status */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Active account card */}
            <div className="rounded-2xl border border-[var(--emerald)]/25 bg-gradient-to-br from-[var(--bg-surface)] to-[#0d2018] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--emerald)]/12">
                    <Zap className="h-4 w-4 text-[var(--emerald-bright)]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    الحساب النشط
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald)]/12 px-2 py-0.5 text-[10px] font-bold text-[var(--emerald-bright)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" />
                  متصل
                </span>
              </div>
              {activeAccount ? (
                <>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {activeAccount.label}
                  </p>
                  <p className="mt-0.5 font-mono-nums text-[11px] text-[var(--text-muted)]">
                    Login: {activeAccount.login}
                  </p>
                  <div className="mt-3 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-3">
                    <div>
                      <p className="font-mono-nums text-sm font-bold text-[var(--text-primary)]">
                        {formatMoney(activeAccount.equity, 0)}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">السيولة</p>
                    </div>
                    <div>
                      <p className="font-mono-nums text-sm font-bold text-[var(--text-primary)]">
                        1:{activeAccount.leverage}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">الرافعة</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">لا يوجد حساب نشط</p>
              )}
            </div>

            {/* Master account card */}
            <div className="rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--bg-surface)] to-[#1f1810] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold)]/12">
                    <Crown className="h-4 w-4 text-[var(--gold-bright)]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    الحساب الرئيسي
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)]/12 px-2 py-0.5 text-[10px] font-bold text-[var(--gold-bright)]">
                  Copy Source
                </span>
              </div>
              {masterAccount ? (
                <>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {masterAccount.label}
                  </p>
                  <p className="mt-0.5 font-mono-nums text-[11px] text-[var(--text-muted)]">
                    Login: {masterAccount.login}
                  </p>
                  <div className="mt-3 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-3">
                    <div>
                      <p className="font-mono-nums text-sm font-bold text-[var(--text-primary)]">
                        {formatMoney(masterAccount.equity, 0)}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">السيولة</p>
                    </div>
                    <div>
                      <p className="font-mono-nums text-sm font-bold text-[var(--text-primary)]">
                        {masterAccount.currency}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">العملة</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">لا يوجد حساب رئيسي</p>
              )}
            </div>

            {/* System summary */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--info)]/12">
                  <Server className="h-4 w-4 text-[var(--info)]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  ملخص MT5
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">إجمالي الحسابات</span>
                  <span className="font-mono-nums font-bold text-[var(--text-primary)]">
                    {store.accounts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">حسابات متصلة</span>
                  <span className="font-mono-nums font-bold text-[var(--emerald-bright)]">
                    {connectedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">إجمالي السيولة</span>
                  <span className="font-mono-nums font-bold text-[var(--text-primary)]">
                    {formatMoney(totalEquity, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">المصادقة الثنائية</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--emerald-bright)]">
                    <ShieldCheck className="h-3.5 w-3.5" /> مفعّلة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Activity className="h-4 w-4 text-[var(--emerald)]" />
              آخر النشاطات
            </h3>
            <div className="space-y-1">
              {recentLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                  لا يوجد نشاط مسجّل
                </p>
              ) : (
                recentLogs.map((log, i) => {
                  const Icon = log.Icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-smooth hover:bg-[var(--surface-2)]/40"
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-2)] ${log.c}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-primary)]">{log.title}</p>
                        {log.detail && (
                          <p className="text-[11px] text-[var(--text-muted)]">{String(log.detail)}</p>
                        )}
                      </div>
                      <span className="font-mono-nums text-[10px] text-[var(--text-muted)]">
                        {new Date(log.time).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
