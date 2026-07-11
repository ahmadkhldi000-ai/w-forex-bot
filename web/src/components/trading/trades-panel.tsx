"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, X, CheckCircle2, XCircle, Clock, Wallet } from "lucide-react";
import { Trade, SymbolTick, AccountSnapshot } from "@/lib/trading/types";
import { getSpec, fmtPrice, toPips } from "@/lib/trading/instruments";
import { cn, formatMoney } from "@/lib/utils";

interface Props {
  openTrades: Trade[];
  closedTrades: Trade[];
  ticks: Record<string, SymbolTick>;
  account: AccountSnapshot;
  onClose: (id: string) => void;
}

type Tab = "open" | "closed";

export function TradesPanel({ openTrades, closedTrades, ticks, account, onClose }: Props) {
  const realizedPnl = useMemo(
    () => closedTrades.reduce((s, t) => s + (t.profit ?? 0), 0),
    [closedTrades]
  );
  const winRate = useMemo(() => {
    if (!closedTrades.length) return 0;
    return (closedTrades.filter((t) => (t.profit ?? 0) >= 0).length / closedTrades.length) * 100;
  }, [closedTrades]);

  return (
    <div className="flex h-full flex-col">
      {/* Account summary */}
      <div className="grid grid-cols-3 gap-2 border-b border-[var(--border)] px-4 py-3">
        <Stat
          label="Equity"
          value={formatMoney(account.equity, 2)}
          sub={`Bal ${formatMoney(account.balance, 0)}`}
        />
        <Stat
          label="Floating P/L"
          value={formatMoney(account.floatingPnl, 2)}
          tone={account.floatingPnl >= 0 ? "up" : "down"}
          sub={`Margin ${formatMoney(account.margin, 0)}`}
        />
        <Stat
          label="Realized"
          value={formatMoney(realizedPnl, 2)}
          tone={realizedPnl >= 0 ? "up" : "down"}
          sub={`Win ${winRate.toFixed(0)}%`}
        />
      </div>

      {/* Open positions */}
      <div className="border-b border-[var(--border)] px-4 py-2.5">
        <div className="mb-2 flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-[var(--emerald)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Open Trades
          </h3>
          <span className="rounded-full bg-[var(--emerald)]/12 px-1.5 py-0.5 text-[10px] font-bold text-[var(--emerald-bright)]">
            {openTrades.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {openTrades.length === 0 && (
            <p className="py-4 text-center text-xs text-[var(--fg-dim)]">No open positions</p>
          )}
          {openTrades.map((t) => {
            const tick = ticks[t.symbol];
            const price = tick?.price ?? t.entryPrice;
            const spec = getSpec(t.symbol);
            const dir = t.type === "BUY" ? 1 : -1;
            const pnl = (price - t.entryPrice) * dir * t.volume * scale(t.symbol);
            const pnlPips = toPips((price - t.entryPrice) * dir, t.symbol);
            return (
              <div
                key={t.id}
                className="group rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2.5 transition-smooth hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold",
                        t.type === "BUY"
                          ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
                          : "bg-[var(--danger)]/15 text-[var(--danger)]"
                      )}
                    >
                      {t.type === "BUY" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                      {t.type}
                    </span>
                    <span className="font-mono-nums text-sm font-semibold text-[var(--fg)]">{t.symbol}</span>
                    <span className="text-[10px] text-[var(--fg-dim)]">{t.volume.toFixed(2)} lots</span>
                  </div>
                  <button
                    onClick={() => onClose(t.id)}
                    title="Close position"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--fg-dim)] opacity-0 transition-smooth hover:bg-[var(--danger)]/15 hover:text-[var(--danger)] group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-1 font-mono-nums text-[10px]">
                  <Cell label="Entry" value={fmtPrice(t.entryPrice, t.symbol)} />
                  <Cell label="SL" value={fmtPrice(t.stopLoss, t.symbol)} tone="down" />
                  <Cell label="TP" value={fmtPrice(t.takeProfit, t.symbol)} tone="up" />
                  <Cell label="Now" value={fmtPrice(price, t.symbol)} />
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-[var(--fg-dim)]">
                    <Clock className="h-2.5 w-2.5" />#{t.ticket}
                  </span>
                  <div className="flex items-center gap-3 font-mono-nums">
                    <span className={cn("text-[10px]", pnlPips >= 0 ? "text-[var(--emerald)]" : "text-[var(--danger)]")}>
                      {pnlPips >= 0 ? "+" : ""}
                      {pnlPips.toFixed(1)} pips
                    </span>
                    <span className={cn("text-xs font-bold", pnl >= 0 ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
                      {pnl >= 0 ? "+" : ""}
                      {formatMoney(pnl, 2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closed trades */}
      <div className="flex min-h-0 flex-1 flex-col px-4 py-2.5">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--fg-muted)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Closed Trades
          </h3>
          <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--fg-muted)]">
            {closedTrades.length}
          </span>
        </div>

        <div className="-mr-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {closedTrades.length === 0 && (
            <p className="py-4 text-center text-xs text-[var(--fg-dim)]">No closed trades yet</p>
          )}
          {closedTrades.map((t) => {
            const win = (t.profit ?? 0) >= 0;
            return (
              <div
                key={t.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/30 p-2 transition-smooth hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {win ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald)]" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-[var(--danger)]" />
                    )}
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 text-[9px] font-bold",
                        t.type === "BUY" ? "bg-[var(--emerald)]/12 text-[var(--emerald)]" : "bg-[var(--danger)]/12 text-[var(--danger)]"
                      )}
                    >
                      {t.type}
                    </span>
                    <span className="font-mono-nums text-xs font-semibold text-[var(--fg)]">{t.symbol}</span>
                  </div>
                  <span
                    className={cn(
                      "font-mono-nums text-xs font-bold",
                      win ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                    )}
                  >
                    {win ? "+" : ""}
                    {formatMoney(t.profit ?? 0, 2)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono-nums text-[10px] text-[var(--fg-dim)]">
                  <span>
                    {fmtPrice(t.entryPrice, t.symbol)} → {fmtPrice(t.closePrice ?? 0, t.symbol)}
                  </span>
                  <span className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-[9px] uppercase">
                    {t.closeReason === "TAKE_PROFIT" ? "TP" : t.closeReason === "STOP_LOSS" ? "SL" : "MAN"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "up" | "down" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--fg-dim)]">{label}</p>
      <p
        className={cn(
          "font-mono-nums text-base font-bold",
          tone === "up" ? "text-[var(--emerald-bright)]" : tone === "down" ? "text-[var(--danger)]" : "text-[var(--fg)]"
        )}
      >
        {value}
      </p>
      {sub && <p className="font-mono-nums text-[10px] text-[var(--fg-dim)]">{sub}</p>}
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div>
      <p className="text-[9px] uppercase text-[var(--fg-dim)]">{label}</p>
      <p
        className={cn(
          "font-semibold",
          tone === "up" ? "text-[var(--emerald-bright)]" : tone === "down" ? "text-[var(--danger)]" : "text-[var(--fg)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function scale(symbol: string): number {
  switch (getSpec(symbol).category) {
    case "FX": return symbol === "USDJPY" ? 65 : 1000;
    case "Metal": return 10;
    case "Index": return 5;
    case "Crypto": return 1;
    default: return 1;
  }
}
