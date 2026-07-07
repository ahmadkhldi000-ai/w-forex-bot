import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { StrategyPanel } from "@/components/dashboard/strategy-panel";
import { AllocationDonut } from "@/components/dashboard/allocation-donut";
import { RecentTrades } from "@/components/dashboard/recent-trades";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)]">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[460px] w-[460px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px]"
          style={{ animation: "floatGlow 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-[var(--gold)] opacity-[0.05] blur-[120px]"
          style={{ animation: "floatGlow 18s ease-in-out infinite reverse" }}
        />
      </div>

      <Sidebar />

      <div className="lg:pl-[252px]">
        <Topbar />

        <main className="relative z-10 px-6 py-7 lg:px-8">
          {/* Page header */}
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
            <div>
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
                Trading Overview
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Live performance across all active strategies ·{" "}
                <span className="text-[var(--text-muted)]">
                  Last sync 2s ago
                </span>
              </p>
            </div>
          </div>

          {/* KPI cards */}
          <StatCards />

          {/* Main grid */}
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-5">
              <EquityChart />
              <PositionsTable />
            </div>
            <div className="space-y-5">
              <StrategyPanel />
              <AllocationDonut />
              <RecentTrades />
              {/* Quick action */}
              <div className="card relative overflow-hidden p-6">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)] opacity-10 blur-2xl" />
                <h3 className="text-sm font-semibold">Need a hand?</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Backtest a strategy against 2 years of tick data before going live.
                </p>
                <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#0f8f5f] py-2.5 text-sm font-semibold text-black transition-smooth hover:brightness-110">
                  Run Backtest
                </button>
              </div>
            </div>
        </div>

          {/* Footer note */}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5 text-[11px] text-[var(--text-muted)]">
            <p>
              W-Forex Bot · Simulated trading data for demonstration. Not financial advice.
            </p>
            <p>Engine v2.4.1 · Latency 12ms</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
