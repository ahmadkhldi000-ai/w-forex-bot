"use client";

import { useEffect, useState } from "react";
import { X, ArrowUp, ArrowDown, ShieldCheck, Zap } from "lucide-react";
import { SymbolTick } from "@/lib/trading/types";
import { getSpec, fmtPrice } from "@/lib/trading/instruments";
import { cn } from "@/lib/utils";

/* ====================================================================
   OrderDialog — the MetaTrader 5 "New Order" window (F9).

   • Symbol + live Bid / Ask
   • Volume (lots) stepper with quick presets
   • Optional Stop Loss / Take Profit
   • One-click SELL (Bid) and BUY (Ask) execution buttons
   ==================================================================== */

export function OrderDialog({
  open,
  onClose,
  symbol,
  tick,
}: {
  open: boolean;
  onClose: () => void;
  symbol: string;
  tick?: SymbolTick;
}) {
  const [volume, setVolume] = useState(0.1);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const spec = getSpec(symbol);
  const bid = tick?.bid ?? spec.base;
  const ask = tick?.ask ?? spec.base;
  const pip = spec.pip;

  const setLot = (v: number) => setVolume(Math.max(0.01, Math.min(100, +v.toFixed(2))));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* scrim */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="relative w-full max-w-md animate-fade-up overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--accent-bright)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--fg)]">New Order</h3>
              <p className="font-mono-nums text-[11px] text-[var(--fg-muted)]">
                {symbol} · {spec.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Bid / Ask spread */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                Bid · Sell
              </p>
              <p className="mt-0.5 font-mono-nums text-lg font-bold tabular-nums text-[var(--danger)]">
                {fmtPrice(bid, symbol)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--emerald)]/30 bg-[var(--emerald)]/5 p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--emerald-bright)]">
                Ask · Buy
              </p>
              <p className="mt-0.5 font-mono-nums text-lg font-bold tabular-nums text-[var(--emerald-bright)]">
                {fmtPrice(ask, symbol)}
              </p>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
              Volume (lots)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLot(volume - 0.01)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] font-mono-nums text-[var(--fg-muted)] transition-smooth hover:border-[var(--accent)]/40 hover:text-[var(--fg)]"
              >
                −
              </button>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={volume}
                onChange={(e) => setLot(parseFloat(e.target.value) || 0.01)}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-center font-mono-nums text-sm font-semibold text-[var(--fg)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
              />
              <button
                onClick={() => setLot(volume + 0.01)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] font-mono-nums text-[var(--fg-muted)] transition-smooth hover:border-[var(--accent)]/40 hover:text-[var(--fg)]"
              >
                +
              </button>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[0.01, 0.1, 0.5, 1].map((v) => (
                <button
                  key={v}
                  onClick={() => setLot(v)}
                  className={cn(
                    "flex-1 rounded-md py-1 font-mono-nums text-[10px] font-medium transition-smooth",
                    volume === v
                      ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                      : "bg-[var(--bg-elev)] text-[var(--fg-dim)] hover:text-[var(--fg-muted)]"
                  )}
                >
                  {v.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* SL / TP */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Stop Loss
              </label>
              <input
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                placeholder={fmtPrice(bid - pip * 200, symbol)}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-3 font-mono-nums text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:border-[var(--danger)]/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                Take Profit
              </label>
              <input
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                placeholder={fmtPrice(ask + pip * 300, symbol)}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-3 font-mono-nums text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:border-[var(--emerald)]/40 focus:outline-none"
              />
            </div>
          </div>

          {/* disclaimer */}
          <p className="flex items-center gap-1.5 text-[10px] text-[var(--fg-dim)]">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            Demo simulation — orders reflect master-account activity.
          </p>

          {/* SELL / BUY */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex flex-col items-center gap-0.5 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 py-2.5 transition-smooth hover:bg-[var(--danger)]/20 active:scale-[0.98]"
            >
              <ArrowDown className="h-4 w-4 text-[var(--danger)]" />
              <span className="text-[11px] font-bold uppercase text-[var(--danger)]">Sell</span>
              <span className="font-mono-nums text-[11px] font-semibold tabular-nums text-[var(--danger)]">
                {fmtPrice(bid, symbol)}
              </span>
            </button>
            <button
              onClick={onClose}
              className="flex flex-col items-center gap-0.5 rounded-lg border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 py-2.5 transition-smooth hover:bg-[var(--emerald)]/20 active:scale-[0.98]"
            >
              <ArrowUp className="h-4 w-4 text-[var(--emerald-bright)]" />
              <span className="text-[11px] font-bold uppercase text-[var(--emerald-bright)]">Buy</span>
              <span className="font-mono-nums text-[11px] font-semibold tabular-nums text-[var(--emerald-bright)]">
                {fmtPrice(ask, symbol)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
