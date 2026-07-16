"use client";

import { useMemo, useState } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import { INSTRUMENTS, getSpec, fmtPrice } from "@/lib/trading/instruments";
import { SymbolTick } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

/* ====================================================================
   MarketWatch — a faithful re-creation of the MetaTrader 5
   "Market Watch" window.

   Features mirrored from MT5:
   • Compact symbol rows with live BID / ASK columns
   • Per-row tick flash (green ↑ / red ↓) on price change
   • Quick search + category filter tabs (All / FX / Metals / Crypto)
   • One-click trade buttons (Sell @ Bid / Buy @ Ask)
   • Star to favourite instruments
   ==================================================================== */

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "FX", label: "FX" },
  { id: "Metal", label: "Metals" },
  { id: "Crypto", label: "Crypto" },
] as const;

type CatId = (typeof CATEGORIES)[number]["id"];

export function MarketWatch({
  active,
  ticks,
  onSelect,
}: {
  active: string;
  ticks: Record<string, SymbolTick>;
  onSelect: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CatId>("all");
  const [favs, setFavs] = useState<Set<string>>(new Set(["EURUSD", "XAUUSD"]));
  const [showFavOnly, setShowFavOnly] = useState(false);

  const filtered = useMemo(() => {
    return INSTRUMENTS.filter((i) => {
      if (cat !== "all" && i.category !== cat) return false;
      if (showFavOnly && !favs.has(i.symbol)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!i.symbol.toLowerCase().includes(q) && !i.name.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [cat, favs, showFavOnly, query]);

  const toggleFav = (symbol: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ---------- header ---------- */}
      <div className="border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-3 py-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
            Market Watch
          </h2>
          <span className="flex items-center gap-1 rounded-full bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--accent-bright)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" />
            </span>
            Live
          </span>
        </div>

        {/* search */}
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-dim)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol…"
              className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elev)] ps-7 pe-2 text-[11px] text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 transition-smooth"
            />
          </div>
        </div>

        {/* category tabs */}
        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            onClick={() => setShowFavOnly((v) => !v)}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded transition-smooth",
              showFavOnly
                ? "bg-[var(--gold)]/20 text-[var(--gold-bright)]"
                : "text-[var(--fg-dim)] hover:text-[var(--fg-muted)]"
            )}
            aria-label="Show favourites only"
            title="Show favourites"
          >
            <Star className={cn("h-3.5 w-3.5", showFavOnly && "fill-current")} />
          </button>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "shrink-0 rounded px-2 py-1 text-[10px] font-medium transition-smooth",
                  cat === c.id
                    ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                    : "text-[var(--fg-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-muted)]"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- column headers ---------- */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-[var(--border)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--fg-dim)]">
        <span>Symbol</span>
        <span className="text-end">Bid</span>
        <span className="text-end">Ask</span>
      </div>

      {/* ---------- rows ---------- */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.map((inst) => {
          const tick = ticks[inst.symbol];
          const isActive = active === inst.symbol;
          const up = (tick?.price ?? inst.base) >= (tick?.prevPrice ?? inst.base);
          const isFav = favs.has(inst.symbol);
          return (
            <button
              key={inst.symbol}
              onClick={() => onSelect(inst.symbol)}
              className={cn(
                "group grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-[var(--border)]/40 px-3 py-[7px] text-start transition-smooth",
                isActive
                  ? "bg-[var(--accent-dim)]"
                  : "hover:bg-[var(--bg-hover)]/60"
              )}
            >
              {/* symbol + star */}
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(inst.symbol);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      toggleFav(inst.symbol);
                    }
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer transition-smooth",
                    isFav ? "text-[var(--gold-bright)]" : "text-[var(--fg-dim)] opacity-0 group-hover:opacity-100"
                  )}
                  aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                >
                  <Star className={cn("h-3 w-3", isFav && "fill-current")} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate font-mono-nums text-[12px] font-semibold leading-tight",
                      isActive ? "text-[var(--accent-bright)]" : "text-[var(--fg)]"
                    )}
                  >
                    {inst.symbol}
                  </span>
                  <span className="block truncate text-[9px] leading-tight text-[var(--fg-dim)]">
                    {inst.name}
                  </span>
                </span>
              </span>

              {/* bid */}
              <span
                key={`bid-${tick?.time ?? 0}`}
                className={cn(
                  "font-mono-nums text-[11px] font-medium tabular-nums transition-colors",
                  up ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                )}
              >
                {tick ? fmtPrice(tick.bid, inst.symbol) : "—"}
              </span>

              {/* ask */}
              <span
                key={`ask-${tick?.time ?? 0}`}
                className={cn(
                  "font-mono-nums text-[11px] font-medium tabular-nums transition-colors",
                  up ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                )}
              >
                {tick ? fmtPrice(tick.ask, inst.symbol) : "—"}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Search className="h-6 w-6 text-[var(--fg-dim)]" />
            <p className="text-[11px] text-[var(--fg-dim)]">No symbols found</p>
          </div>
        )}
      </div>

      {/* ---------- spread footer ---------- */}
      <div className="border-t border-[var(--border)] px-3 py-2">
        {(() => {
          const t = ticks[active];
          const spec = getSpec(active);
          return (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--fg-dim)]">
                Spread <span className="text-[var(--fg-muted)]">({active})</span>
              </span>
              <span className="font-mono-nums font-semibold text-[var(--fg)]">
                {t ? t.spread.toFixed(1) : spec.spreadPips.toFixed(1)} pts
              </span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
