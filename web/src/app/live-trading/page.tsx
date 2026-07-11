"use client";

import { useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CandlestickChart } from "@/components/trading/candlestick-chart";
import { SymbolHeader } from "@/components/trading/symbol-header";
import { SymbolPicker } from "@/components/trading/symbol-picker";
import { TradesPanel } from "@/components/trading/trades-panel";
import { useLiveFeed } from "@/lib/trading/use-live-feed";
import { Layers, Crosshair, TrendingUp, TrendingDown } from "lucide-react";

export default function LiveTradingPage() {
  const feed = useLiveFeed();
  const tradesForSymbol = useMemo(
    () => feed.trades.filter((t) => t.symbol === feed.symbol),
    [feed.trades, feed.symbol]
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
            {/* ===== Symbol watchlist ===== */}
            <aside className="hidden flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 xl:flex">
              <div className="mb-3 flex items-center gap-2 px-1">
                <Layers className="h-4 w-4 text-[var(--emerald)]" />
                <h2 className="text-sm font-semibold text-[var(--fg)]">Markets</h2>
              </div>
              <SymbolPicker active={feed.symbol} ticks={feed.allTicks} onSelect={feed.setSymbol} />
            </aside>

            {/* ===== Chart + header ===== */}
            <section className="flex min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-4">
              <SymbolHeader tick={feed.tick} connection={feed.connection} />

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] pb-3 text-[11px]">
                <ChartLegend color="var(--emerald)" label="Bullish" />
                <ChartLegend color="var(--danger)" label="Bearish" />
                <span className="mx-1 h-3 w-px bg-[var(--border)]" />
                <ChartMark icon={<TrendingUp className="h-3 w-3" />} color="var(--emerald-bright)" label="BUY" />
                <ChartMark icon={<TrendingDown className="h-3 w-3" />} color="var(--danger)" label="SELL" />
                <span className="mx-1 h-3 w-px bg-[var(--border)]" />
                <ChartLegend color="var(--danger)" label="Stop Loss" dashed />
                <ChartLegend color="var(--emerald)" label="Take Profit" dashed />
                <ChartLegend color="rgba(255,255,255,0.5)" label="Entry" dashed />
                <span className="ml-auto flex items-center gap-1 text-[var(--fg-dim)]">
                  <Crosshair className="h-3 w-3" /> Hover for OHLC
                </span>
              </div>

              <div className="mt-2 min-h-0 flex-1">
                <CandlestickChart
                  symbol={feed.symbol}
                  candles={feed.candles}
                  trades={tradesForSymbol}
                  livePrice={feed.tick?.price ?? 0}
                />
              </div>
            </section>

            {/* ===== Trades + account ===== */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
              <TradesPanel
                openTrades={feed.openTrades}
                closedTrades={feed.closedTrades}
                ticks={feed.allTicks}
                account={feed.account}
                onClose={feed.closeTrade}
              />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[var(--fg-muted)]">
      <span
        className="inline-block h-2 w-2 rounded-sm"
        style={{ background: dashed ? "transparent" : color, borderTop: dashed ? `2px dashed ${color}` : undefined }}
      />
      {label}
    </span>
  );
}

function ChartMark({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[var(--fg-muted)]">
      <span style={{ color }}>{icon}</span>
      {label}
    </span>
  );
}
