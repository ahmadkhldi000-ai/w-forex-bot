"use client";

import {
  Users,
  Repeat,
  DollarSign,
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default function AdminOverviewPage() {
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

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="نظرة عامة" />
        <main className="px-8 py-6">
          {/* Bot status banner */}
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-l from-[var(--accent-dim)] to-transparent p-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/15">
                <Bot className="h-6 w-6 text-[var(--accent-bright)]" />
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent-bright)]" />
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  البوت يعمل · MT5 متصل
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Latency 12ms · 12 أزواج نشطة · آخر تحديث قبل ثانيتين
                </p>
              </div>
            </div>
            <button className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]">
              إدارة البوت
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-smooth hover:border-[var(--border-strong)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${s.color}15`, color: s.color }}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      s.trend === "up"
                        ? "text-[var(--accent-bright)]"
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
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue chart placeholder + Recent activity */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                الإيرادات (آخر 7 أيام)
              </h3>
              <div className="flex h-48 items-end justify-between gap-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[var(--accent)] to-[var(--accent-bright)] opacity-80 transition-all duration-500 hover:opacity-100"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {["س", "أ", "إ", "ث", "ر", "خ", "ج"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
              <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                أحدث النشاطات
              </h3>
              <div className="space-y-3">
                {[
                  { t: "اشتراك جديد (PRO)", c: "var(--accent)", time: "قبل دقيقة" },
                  { t: "دفعة $79 USDT", c: "var(--gold)", time: "قبل 5 د" },
                  { t: "تسجيل دخول أدمن", c: "var(--info)", time: "قبل 12 د" },
                  { t: "إلغاء اشتراك", c: "var(--danger)", time: "قبل 23 د" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: a.c }}
                    />
                    <span className="flex-1 text-[var(--text-secondary)]">{a.t}</span>
                    <span className="text-[var(--text-muted)]">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
