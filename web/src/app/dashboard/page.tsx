"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { StrategyPanel } from "@/components/dashboard/strategy-panel";
import { AllocationDonut } from "@/components/dashboard/allocation-donut";
import { LiveDot } from "@/components/ui/primitives";
import {
  Bot,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] lg:pr-[252px]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 space-y-5 overflow-y-auto p-4 lg:p-6">
          {/* ---- Welcome banner ---- */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[#0d1714] p-5 lg:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--emerald)]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-[var(--gold)]/8 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--emerald)]/25 bg-[var(--emerald)]/10 px-3 py-1">
                  <LiveDot />
                  <span className="text-[11px] font-medium text-[var(--emerald-bright)]">
                    Bot Active · Scalper Strategy
                  </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Welcome back, Ahmad 👋
                </h1>
                <p className="mt-1 max-w-md text-sm text-[var(--fg-muted)]">
                  Your bot is running smoothly. Up{" "}
                  <span className="font-mono-nums font-medium text-[var(--emerald-bright)]">
                    +$2,847.30
                  </span>{" "}
                  this week across 3 active strategies.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/live-trading"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-[#06241a] transition-smooth hover:bg-[var(--emerald-bright)]"
                >
                  <Bot className="h-4 w-4" />
                  Open Terminal
                </Link>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]/60 px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-smooth hover:bg-[var(--bg-hover)]"
                >
                  <TrendingUp className="h-4 w-4 text-[var(--emerald)]" />
                  View Analytics
                </Link>
              </div>
            </div>
          </section>

          {/* ---- Stat cards ---- */}
          <StatCards />

          {/* ---- Charts row ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <EquityChart />
            </div>
            <AllocationDonut />
          </div>

          {/* ---- Strategy + quick actions ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <StrategyPanel />
            </div>
            <aside className="space-y-4">
              <QuickActionCard
                icon={ShieldCheck}
                title="Risk Shield"
                desc="Max daily drawdown 5% · Stop-loss active"
                tone="emerald"
                href="/settings"
              />
              <QuickActionCard
                icon={Sparkles}
                title="Upgrade to Pro"
                desc="Unlock AI signals & unlimited bots"
                tone="gold"
                href="/subscription"
              />
              <QuickActionCard
                icon={Activity}
                title="Live Trading"
                desc="Watch your bots execute in real-time"
                tone="info"
                href="/live-trading"
              />
            </aside>
          </div>

          {/* ---- Positions + Recent trades ---- */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <PositionsTable />
            </div>
            <RecentTrades />
          </div>
        </main>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  desc,
  tone,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tone: "emerald" | "gold" | "info";
  href: string;
}) {
  const toneMap = {
    emerald: "text-[var(--emerald-bright)] bg-[var(--emerald)]/12 border-[var(--emerald)]/20",
    gold: "text-[var(--gold-bright)] bg-[var(--gold)]/12 border-[var(--gold)]/20",
    info: "text-[var(--info)] bg-[var(--info)]/12 border-[var(--info)]/20",
  } as const;
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition-smooth hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-muted)] transition-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--emerald-bright)]" />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
