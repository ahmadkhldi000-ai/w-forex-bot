"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, TrendingUp, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { AllocationDonut } from "@/components/dashboard/allocation-donut";
import { useAuth } from "@/lib/auth/use-auth";
import { formatMoney } from "@/lib/utils";

export default function DashboardPage() {
  const { user, stats, profile, loading, requireAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Guard: redirect to /auth if not logged in
  useEffect(() => {
    requireAuth();
    setAuthChecked(true);
  }, [requireAuth]);

  if (loading || !authChecked || !user) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </main>
    );
  }

  const firstName = (user.name ?? user.email).split(/[\s@]+/)[0];

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg-base)]">
      <Sidebar />

      <div className="flex flex-1 flex-col lg:mr-72">
        <Topbar />

        <main className="flex-1 space-y-5 p-5 lg:p-8">
          {/* ---- Welcome header ---- */}
          <section>
            <p className="text-sm text-[var(--text-muted)]">
              {new Date().toLocaleDateString("ar", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)] lg:text-2xl">
              أهلاً، {firstName} 👋
            </h1>
            <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
              {stats && stats.openCount > 0
                ? `لديك ${stats.openCount} مركز مفتوح. الرصيد الحالي ${formatMoney(stats.balance)}.`
                : "هذه لوحة التحكم الخاصة بك. ابدأ بتشغيل الروبوت لرؤية البيانات الحقيقية."}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/live-trading"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] px-4 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition-smooth hover:shadow-lg hover:shadow-[var(--accent)]/20"
              >
                <Bot className="h-4 w-4" />
                فتح وحدة التداول
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                عرض التحليلات
              </Link>
            </div>
          </section>

          {/* ---- Stat cards ---- */}
          <StatCards stats={stats} />

          {/* ---- Charts row ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <EquityChart history={profile?.equityHistory ?? []} />
            </div>
            <AllocationDonut />
          </div>

          {/* ---- Positions + Recent trades ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <PositionsTable positions={profile?.openPositions ?? []} />
            </div>
            <div className="xl:col-span-2">
              <RecentTrades trades={profile?.closedTrades ?? []} />
            </div>
          </div>

          {/* ---- Quick links ---- */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink
              href="/live-trading"
              icon={Bot}
              title="وحدة التداول المباشر"
              desc="راقب الصفقات وفتح وإغلاق المراكز لحظياً"
            />
            <QuickLink
              href="/strategies"
              icon={Wallet}
              title="الاستراتيجيات"
              desc="خصّص استراتيجية الروبوت ومعاملات المخاطرة"
            />
            <QuickLink
              href="/settings"
              icon={TrendingUp}
              title="إعدادات الحساب"
              desc="إدارة الحساب، الأمان، والربط مع MT5"
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-bright)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent-bright)]" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          {desc}
        </p>
      </div>
    </Link>
  );
}
