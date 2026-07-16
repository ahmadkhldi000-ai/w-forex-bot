"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { CandlestickChart } from "@/components/trading/candlestick-chart";
import { SymbolHeader } from "@/components/trading/symbol-header";
import { MarketWatch } from "@/components/trading/market-watch";
import { Navigator } from "@/components/trading/navigator";
import { TradeToolbar } from "@/components/trading/trade-toolbar";
import { Toolbox } from "@/components/trading/toolbox";
import { OrderDialog } from "@/components/trading/order-dialog";
import { useLiveFeed } from "@/lib/trading/use-live-feed";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ====================================================================
   Live Trading — MetaTrader 5 style terminal.

   Faithful MT5 multi-panel layout:
   ┌──────────────────────────────────────────────────────┐
   │  Topbar (terminal chrome)                             │
   ├──────┬───────────────────────────────────┬───────────┤
   │ Nav  │  Toolbar · SymbolHeader · Chart   │ Market    │
   │      │                                   │ Watch     │
   ├──────┴───────────────────────────────────┴───────────┤
   │  Toolbox  (Trading | History | Exposure | News …)     │
   └──────────────────────────────────────────────────────┘
   ==================================================================== */

export default function LiveTradingPage() {
  const feed = useLiveFeed();
  const [toolboxHeight, setToolboxHeight] = useState<"open" | "closed">("open");
  const [orderOpen, setOrderOpen] = useState(false);

  // positions relevant to the currently selected symbol
  const tradesForSymbol = useMemo(
    () =>
      feed.openTrades.filter(
        (t) => t.symbol === feed.symbol || t.symbol === feed.symbol.replace("/", "")
      ),
    [feed.openTrades, feed.symbol]
  );

  return (
    <div className="bg-[var(--bg-base)]">
      <Sidebar />

      <div className="flex min-h-dvh min-w-0 flex-col lg:mr-[252px] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
        <Topbar />

        {/* ============ Terminal body — fills remaining viewport ============ */}
        <main dir="ltr" className="flex min-h-0 flex-1 flex-col p-1.5 sm:p-2">
          {/* ---- top row: Navigator | Chart | Market Watch ---- */}
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 sm:gap-2 lg:flex-row">
            {/* Navigator panel (desktop XL+) */}
            <div className="hidden w-[208px] shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)]/50 xl:flex">
              <Navigator
                account={feed.account}
                masterLogin={feed.masterLogin ?? undefined}
                connected={feed.masterConnected}
              />
            </div>

            {/* Center: Toolbar + SymbolHeader + Chart */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)]/50">
              <TradeToolbar
                timeframes={feed.timeframes}
                timeframe={feed.timeframe}
                onTimeframe={feed.setTimeframe}
                onNewOrder={() => setOrderOpen(true)}
              />

              {/* live symbol header — Bid / Ask / spread */}
              {feed.tick && (
                <div className="border-b border-[var(--border)] bg-[var(--bg-elev)]/30">
                  <SymbolHeader tick={feed.tick} connection={feed.connection} />
                </div>
              )}

              <div className="relative min-h-[260px] flex-1">
                <CandlestickChart
                  symbol={feed.symbol}
                  candles={feed.candles}
                  trades={tradesForSymbol}
                  livePrice={feed.tick?.price ?? 0}
                  tfMs={feed.tfMs}
                />
              </div>
            </div>

            {/* Market Watch panel */}
            <div className="h-[280px] w-full shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)]/50 sm:h-auto lg:w-[300px] xl:w-[316px]">
              <MarketWatch
                active={feed.symbol}
                ticks={feed.allTicks}
                onSelect={feed.setSymbol}
              />
            </div>
          </div>

          {/* ---- Toolbox (bottom) ---- MT5 collapsible panel */}
          <div className="mt-1.5 shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-elev)]/40 sm:mt-2">
            {/* collapse toggle tab */}
            <button
              onClick={() => setToolboxHeight((h) => (h === "open" ? "closed" : "open"))}
              className="flex h-[34px] w-full items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-elev)]/70 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)] transition-smooth hover:text-[var(--fg)]"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[var(--fg-dim)] transition-transform duration-200",
                  toolboxHeight === "closed" && "rotate-180"
                )}
              />
              Toolbox
              <span className="flex items-center gap-1 rounded-full bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] normal-case tracking-normal text-[var(--accent-bright)]">
                {feed.openTrades.length} open
              </span>
            </button>

            <div
              className={cn(
                "transition-[height] duration-300 ease-out",
                toolboxHeight === "open" ? "h-[240px]" : "h-0"
              )}
            >
              {toolboxHeight === "open" && (
                <Toolbox
                  openTrades={feed.openTrades}
                  closedTrades={feed.closedTrades}
                  account={feed.account}
                  connection={feed.connection}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <OrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        symbol={feed.symbol}
        tick={feed.tick}
      />
    </div>
  );
}
