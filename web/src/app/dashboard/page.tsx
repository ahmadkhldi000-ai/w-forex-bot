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
import { LivePriceTicker } from "@/components/dashboard/live-price-ticker";
import { useAuth } from "@/lib/auth/use-auth";
import {
  useMasterData,
  masterToStats,
  masterToOpenTrades,
  masterToClosedTrades,
  masterToEquityHistory,
} from "@/lib/trading/master-data";
import { formatMoney } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, Wifi, WifiOff } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, requireAuth } = useAuth();
  const master = useMasterData(); // ← real MT5 data (only source of truth)

  // Derive ALL dashboard numbers from the master account
  const stats = masterToStats(master);
  const openPositions = masterToOpenTrades(master);
  const closedTrades = masterToClosedTrades(master);
  const equityHistory = masterToEquityHistory(master);
  const masterConnected = master.connected;
  const masterConfigured = master.login !== null || master.stats !== null;

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
          {/* ---- Master account connection status ---- */}
          <MasterStatusBanner
            connected={masterConnected}
            configured={masterConfigured}
            login={master.login}
            server={master.server}
            lastUpdate={master.lastUpdate}
            error={master.error}
          />

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
              {masterConnected
                ? `متصل بحساب الماستر. الرصيد الحقيقي ${formatMoney(stats.balance)} · ${stats.openCount} مركز مفتوح.`
                : masterConfigured
                  ? "حساب الماستر مُعدّ لكن غير متصل حالياً. الأرقام ستظهر لحظة الاتصال."
                  : "لم يتم ربط حساب الماستر بعد. اذهب إلى لوحة المالك لربط حساب MT5."}
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

          {/* ---- Live real-price ticker ---- */}
          <LivePriceTicker />

          {/* ---- Stat cards ---- */}
          <StatCards stats={stats} />

          {/* ---- Charts row ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <EquityChart history={equityHistory} />
            </div>
            <AllocationDonut positions={openPositions} />
          </div>

          {/* ---- Positions + Recent trades ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <PositionsTable positions={openPositions} />
            </div>
            <div className="xl:col-span-2">
              <RecentTrades trades={closedTrades} />
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

/**
 * Banner showing the live connection status of the master MT5 account.
 * Green when connected live, amber when configured-but-offline,
 * red/muted when not configured. All numbers below derive from this state.
 */
function MasterStatusBanner({
  connected,
  configured,
  login,
  server,
  lastUpdate,
  error,
}: {
  connected: boolean;
  configured: boolean;
  login: string | null;
  server: string | null;
  lastUpdate: string | null;
  error: string | null;
}) {
  // Not configured at all
  if (!configured) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/60 px-4 py-3">
        <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            حساب الماستر غير مربوط
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
            جميع الأرقام تُعرض بصفر حتى يتم ربط حساب MT5. اذهب إلى{" "}
            <Link
              href="/owner/master"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              لوحة المالك
            </Link>{" "}
            لربط الحساب.
          </p>
        </div>
      </div>
    );
  }

  // Configured but offline
  if (!connected) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              حساب الماستر غير متصل
            </p>
            {login && (
              <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                #{login}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
            {error
              ? `خطأ الاتصال: ${error}`
              : "بانتظار إعادة الاتصال بالخادم. الأرقام الحقيقية ستظهر لحظة الاتصال."}
          </p>
        </div>
      </div>
    );
  }

  // Connected live
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Wifi className="h-5 w-5 text-emerald-400" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              متصل بحساب الماستر — بيانات حقيقية مباشرة
            </p>
            {login && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                #{login}
              </span>
            )}
            {server && (
              <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                {server}
              </span>
            )}
          </div>
          {lastUpdate && (
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
              آخر تحديث: {new Date(lastUpdate).toLocaleTimeString("ar")}
            </p>
          )}
        </div>
      </div>
      <ShieldCheck className="hidden h-5 w-5 shrink-0 text-emerald-400 sm:block" />
    </div>
  );
}
