"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { Badge, LiveDot } from "@/components/ui/primitives";

type Side = "BUY" | "SELL";
type Position = {
  id: string;
  pair: string;
  side: Side;
  size: number;
  entry: number;
  price: number;
  sl: number;
  tp: number;
};

const initial: Position[] = [
  { id: "p1", pair: "EUR/USD", side: "BUY", size: 1.5, entry: 1.0842, price: 1.0876, sl: 1.081, tp: 1.092 },
  { id: "p2", pair: "GBP/JPY", side: "SELL", size: 0.8, entry: 198.45, price: 197.92, sl: 199.2, tp: 196.5 },
  { id: "p3", pair: "XAU/USD", side: "BUY", size: 0.3, entry: 2331.4, price: 2338.6, sl: 2325, tp: 2350 },
  { id: "p4", pair: "USD/JPY", side: "BUY", size: 2.0, entry: 151.22, price: 151.05, sl: 150.6, tp: 152.4 },
  { id: "p5", pair: "AUD/CAD", side: "SELL", size: 1.2, entry: 0.8934, price: 0.8941, sl: 0.897, tp: 0.888 },
];

const pipMap: Record<string, number> = {
  "EUR/USD": 0.0001,
  "GBP/JPY": 0.01,
  "XAU/USD": 0.1,
  "USD/JPY": 0.01,
  "AUD/CAD": 0.0001,
};

export function PositionsTable() {
  const [rows, setRows] = useState(initial);
  const [flash, setFlash] = useState<Record<string, "up" | "down" | undefined>>({});
  // Seed previous-price lookup once from the initial snapshot
  const prevRef = useRef<Record<string, number>>(
    Object.fromEntries(initial.map((r) => [r.id, r.price])) as Record<string, number>
  );

  useEffect(() => {
    const t = setInterval(() => {
      setRows((prev) =>
        prev.map((p) => {
          const tick = (Math.random() - 0.5) * pipMap[p.pair] * 4;
          const next = +(p.price + tick).toFixed(pipMap[p.pair] < 0.01 ? 4 : 3);
          const dir = next > prevRef.current[p.id] ? "up" : "down";
          prevRef.current[p.id] = next;
          setFlash((f) => ({ ...f, [p.id]: dir }));
          setTimeout(() => setFlash((f) => ({ ...f, [p.id]: undefined })), 650);
          return { ...p, price: next };
        })
      );
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold tracking-tight">Open Positions</h3>
          <Badge tone="success">
            <LiveDot />
            {rows.length} live
          </Badge>
        </div>
        <button className="text-xs font-medium text-[var(--text-muted)] transition-smooth hover:text-[var(--danger)]">
          Close all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <th className="px-6 py-3 font-medium">Instrument</th>
              <th className="px-3 py-3 font-medium">Side</th>
              <th className="px-3 py-3 text-right font-medium">Size</th>
              <th className="px-3 py-3 text-right font-medium">Entry</th>
              <th className="px-3 py-3 text-right font-medium">Current</th>
              <th className="px-3 py-3 text-right font-medium">P&L</th>
              <th className="px-6 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const pip = pipMap[p.pair];
              const pips =
                p.side === "BUY"
                  ? ((p.price - p.entry) / pip).toFixed(1)
                  : ((p.entry - p.price) / pip).toFixed(1);
              const pnl = +pips * 10 * p.size;
              const pnlUp = pnl >= 0;
              return (
                <tr
                  key={p.id}
                  className="group border-b border-[var(--border-subtle)] transition-smooth last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] text-[10px] font-bold tracking-tight text-[var(--text-secondary)]">
                        {p.pair.split("/")[0]}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{p.pair}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          SL {p.sl} · TP {p.tp}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
                        p.side === "BUY"
                          ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                          : "bg-[var(--danger-dim)] text-[var(--danger)]"
                      )}
                    >
                      {p.side === "BUY" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {p.side}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right font-mono-nums text-[var(--text-secondary)]">
                    {p.size.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 text-right font-mono-nums text-[var(--text-secondary)]">
                    {p.entry}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 font-mono-nums font-medium tabular-nums",
                        flash[p.id] === "up" && "flash-green",
                        flash[p.id] === "down" && "flash-red"
                      )}
                    >
                      {p.price.toFixed(pip < 0.01 ? 4 : 3)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span
                      className={cn(
                        "font-mono-nums font-semibold tabular-nums",
                        pnlUp
                          ? "text-[var(--accent-bright)]"
                          : "text-[var(--danger)]"
                      )}
                    >
                      {pnlUp ? "+" : ""}
                      {formatMoney(pnl, 0)}
                    </span>
                    <span
                      className={cn(
                        "ml-1 text-[11px]",
                        pnlUp ? "text-[var(--accent)]/70" : "text-[var(--danger)]/70"
                      )}
                    >
                      {pnlUp ? "+" : ""}
                      {pips}p
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] opacity-0 transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)] group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
