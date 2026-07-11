"use client";

import { ArrowDown, ArrowUp, Activity } from "lucide-react";
import { SymbolTick } from "@/lib/trading/types";
import { getSpec, fmtPrice } from "@/lib/trading/instruments";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/lib/trading/types";

interface Props {
  tick: SymbolTick | undefined;
  connection: ConnectionStatus;
}

export function SymbolHeader({ tick, connection }: Props) {
  if (!tick) return null;
  const spec = getSpec(tick.symbol);
  const up = tick.price >= tick.prevPrice;
  const flash = tick.price !== tick.prevPrice;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-1">
      <div className="flex items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono-nums text-2xl font-bold tracking-tight text-[var(--fg)]">
              {tick.symbol}
            </h1>
            <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--fg-dim)]">
              {spec.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{spec.name}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            key={tick.price}
            className={cn(
              "font-mono-nums text-3xl font-bold tabular-nums transition-colors duration-200",
              up ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]",
              flash && "animate-[pulse_0.4s_ease-out]"
            )}
          >
            {fmtPrice(tick.price, tick.symbol)}
          </span>
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm font-semibold",
              tick.changePct >= 0 ? "text-[var(--emerald)]" : "text-[var(--danger)]"
            )}
          >
            {tick.changePct >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            {tick.changePct >= 0 ? "+" : ""}
            {tick.changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5 font-mono-nums text-xs">
        <Quote label="Bid" value={fmtPrice(tick.bid, tick.symbol)} tone="down" />
        <Quote label="Ask" value={fmtPrice(tick.ask, tick.symbol)} tone="up" />
        <Quote label="Spread" value={`${tick.spread.toFixed(1)} p`} tone="flat" />
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1.5">
          <Activity className={cn("h-3 w-3", connection.state === "live" ? "text-[var(--emerald)]" : "text-[var(--gold)]")} />
          <span className={cn("font-semibold", connection.state === "live" ? "text-[var(--emerald-bright)]" : "text-[var(--gold)]")}>
            {connection.state === "live" ? "LIVE" : connection.state.toUpperCase()}
          </span>
          <span className="text-[var(--fg-dim)]">· {connection.latencyMs}ms</span>
        </div>
      </div>
    </div>
  );
}

function Quote({ label, value, tone }: { label: string; value: string; tone: "up" | "down" | "flat" }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-[var(--fg-dim)]">{label}</span>
      <span
        className={cn(
          "font-semibold",
          tone === "up" ? "text-[var(--emerald-bright)]" : tone === "down" ? "text-[var(--danger)]" : "text-[var(--fg)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
