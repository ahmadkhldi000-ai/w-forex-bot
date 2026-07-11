"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Badge } from "@/components/ui/primitives";
import { cn, formatMoney } from "@/lib/utils";
import {
  History,
  Search,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Side = "BUY" | "SELL";
type Outcome = "win" | "loss";

type Trade = {
  id: string;
  pair: string;
  side: Side;
  size: number;
  entry: number;
  exit: number;
  pnl: number;
  outcome: Outcome;
  opened: string;
  closed: string;
  duration: string;
  strategy: string;
};

const TRADES: Trade[] = [
  { id: "T-5042", pair: "EUR/USD", side: "BUY", size: 0.5, entry: 1.0842, exit: 1.0876, pnl: 170.0, outcome: "win", opened: "2026-07-09 10:32", closed: "2026-07-09 11:15", duration: "43m", strategy: "VWAP Scalper" },
  { id: "T-5041", pair: "GBP/JPY", side: "SELL", size: 0.3, entry: 198.45, exit: 198.02, pnl: 129.0, outcome: "win", opened: "2026-07-09 09:14", closed: "2026-07-09 10:48", duration: "1h 34m", strategy: "EMA Cross" },
  { id: "T-5040", pair: "XAU/USD", side: "BUY", size: 0.2, entry: 2358.4, exit: 2356.1, pnl: -46.0, outcome: "loss", opened: "2026-07-09 08:00", closed: "2026-07-09 08:22", duration: "22m", strategy: "Grid Master" },
  { id: "T-5039", pair: "USD/CHF", side: "SELL", size: 0.4, entry: 0.9024, exit: 0.8998, pnl: 104.0, outcome: "win", opened: "2026-07-08 22:10", closed: "2026-07-08 23:45", duration: "1h 35m", strategy: "RSI Reversion" },
  { id: "T-5038", pair: "EUR/USD", side: "BUY", size: 0.5, entry: 1.0834, exit: 1.0850, pnl: 80.0, outcome: "win", opened: "2026-07-08 16:20", closed: "2026-07-08 17:02", duration: "42m", strategy: "VWAP Scalper" },
  { id: "T-5037", pair: "BTC/USD", side: "BUY", size: 0.1, entry: 58420, exit: 58100, pnl: -32.0, outcome: "loss", opened: "2026-07-08 14:00", closed: "2026-07-08 14:18", duration: "18m", strategy: "Breakout Hunter" },
  { id: "T-5036", pair: "GBP/USD", side: "SELL", size: 0.3, entry: 1.2845, exit: 1.2820, pnl: 75.0, outcome: "win", opened: "2026-07-08 11:30", closed: "2026-07-08 12:44", duration: "1h 14m", strategy: "EMA Cross" },
  { id: "T-5035", pair: "XAU/USD", side: "BUY", size: 0.2, entry: 2352.0, exit: 2358.4, pnl: 128.0, outcome: "win", opened: "2026-07-07 20:15", closed: "2026-07-07 22:30", duration: "2h 15m", strategy: "Grid Master" },
  { id: "T-5034", pair: "USD/JPY", side: "SELL", size: 0.4, entry: 161.20, exit: 161.45, pnl: -100.0, outcome: "loss", opened: "2026-07-07 15:00", closed: "2026-07-07 16:10", duration: "1h 10m", strategy: "RSI Reversion" },
  { id: "T-5033", pair: "EUR/USD", side: "BUY", size: 0.5, entry: 1.0820, exit: 1.0842, pnl: 110.0, outcome: "win", opened: "2026-07-07 09:22", closed: "2026-07-07 10:05", duration: "43m", strategy: "VWAP Scalper" },
];

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<Side | "all">("all");
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | "all">("all");

  const filtered = useMemo(() => {
    return TRADES.filter((t) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || t.pair.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.strategy.toLowerCase().includes(q);
      const matchS = sideFilter === "all" || t.side === sideFilter;
      const matchO = outcomeFilter === "all" || t.outcome === outcomeFilter;
      return matchQ && matchS && matchO;
    });
  }, [query, sideFilter, outcomeFilter]);

  const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0);
  const wins = filtered.filter((t) => t.outcome === "win").length;
  const losses = filtered.filter((t) => t.outcome === "loss").length;
  const winRate = filtered.length > 0 ? (wins / filtered.length) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-5 overflow-y-auto p-4 lg:p-6">
          {/* header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2">
                <History className="h-4 w-4 text-[var(--emerald)]" />
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Trade History
                </h1>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">
                Complete record of all closed positions.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]/60 px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-smooth hover:bg-[var(--bg-hover)]">
              <Download className="h-4 w-4 text-[var(--fg-muted)]" />
              Export CSV
            </button>
          </header>

          {/* summary tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryTile label="Net P&L" value={formatMoney(totalPnl, 2)} icon={totalPnl >= 0 ? TrendingUp : TrendingDown} accent={totalPnl >= 0 ? "var(--emerald-bright)" : "var(--danger)"} valueClass={totalPnl >= 0 ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"} />
            <SummaryTile label="Total Trades" value={filtered.length.toString()} icon={Activity} accent="var(--info)" />
            <SummaryTile label="Win Rate" value={`${winRate.toFixed(1)}%`} icon={CheckCircle2} accent="var(--emerald-bright)" />
            <SummaryTile label="W / L" value={`${wins} / ${losses}`} icon={Calendar} accent="var(--gold-bright)" />
          </div>

          {/* toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by pair, ID, or strategy..."
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 py-2.5 pl-10 pr-4 text-sm text-[var(--fg)] outline-none transition-smooth focus:border-[var(--emerald)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--fg-muted)]" />
              <select
                value={sideFilter}
                onChange={(e) => setSideFilter(e.target.value as Side | "all")}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2.5 text-sm text-[var(--fg-muted)] outline-none focus:border-[var(--emerald)]"
              >
                <option value="all">All Sides</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value as Outcome | "all")}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2.5 text-sm text-[var(--fg-muted)] outline-none focus:border-[var(--emerald)]"
              >
                <option value="all">All Results</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
              </select>
            </div>
          </div>

          {/* table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Pair</th>
                    <th className="px-4 py-3 font-semibold">Side</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold">Entry</th>
                    <th className="px-4 py-3 font-semibold">Exit</th>
                    <th className="px-4 py-3 font-semibold">P&L</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Strategy</th>
                    <th className="px-4 py-3 font-semibold">Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((t) => {
                    const positive = t.pnl >= 0;
                    return (
                      <tr key={t.id} className="transition-smooth hover:bg-[var(--bg-hover)]/40">
                        <td className="px-4 py-3.5">
                          <span className="font-mono-nums text-xs text-[var(--fg-muted)]">{t.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-medium text-[var(--fg)]">{t.pair}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            t.side === "BUY"
                              ? "border-[var(--emerald)]/20 bg-[var(--emerald)]/12 text-[var(--emerald-bright)]"
                              : "border-[var(--danger)]/20 bg-[var(--danger)]/12 text-[var(--danger)]"
                          )}>
                            {t.side === "BUY" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                            {t.side}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono-nums text-sm text-[var(--fg-muted)]">{t.size}</td>
                        <td className="px-4 py-3.5 font-mono-nums text-sm text-[var(--fg-muted)]">{t.entry}</td>
                        <td className="px-4 py-3.5 font-mono-nums text-sm text-[var(--fg-muted)]">{t.exit}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {positive ? <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald-bright)]" /> : <XCircle className="h-3.5 w-3.5 text-[var(--danger)]" />}
                            <span className={cn("font-mono-nums text-sm font-semibold", positive ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
                              {positive ? "+" : ""}{formatMoney(t.pnl, 2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[var(--fg-muted)]">{t.duration}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-[var(--fg-secondary)]">{t.strategy}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[var(--fg-muted)]">{t.closed}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <History className="mx-auto mb-3 h-8 w-8 text-[var(--fg-muted)]" />
                <p className="text-sm text-[var(--fg-muted)]">No trades found matching your filters</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span>Showing {filtered.length} of {TRADES.length} trades</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 transition-smooth hover:bg-[var(--bg-hover)]" disabled>Previous</button>
              <button className="rounded-lg border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-3 py-1.5 text-[var(--emerald-bright)]">1</button>
              <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 transition-smooth hover:bg-[var(--bg-hover)]">2</button>
              <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 transition-smooth hover:bg-[var(--bg-hover)]">Next</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  accent,
  valueClass,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className={cn("font-mono-nums text-xl font-bold", valueClass ?? "text-[var(--fg)]")}>{value}</p>
      <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{label}</p>
    </div>
  );
}
