"use client";

import {
  Plus,
  Crosshair,
  TrendingUp,
  Ruler,
  TextCursorInput,
  Shapes,
  Undo2,
  Redo2,
  Printer,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Timeframe } from "@/lib/trading/use-live-feed";

/* ====================================================================
   TradeToolbar — the iconic MetaTrader 5 chart toolbar.
   Left cluster  : New Order, cursor, crosshair, trend-line, rulers…
   Right cluster : undo / redo / print / full-screen
   ==================================================================== */

const TOOLS = [
  { id: "cursor", icon: TextCursorInput, label: "Crosshair" },
  { id: "cross", icon: Crosshair, label: "Cursor" },
  { id: "trend", icon: TrendingUp, label: "Trend Line" },
  { id: "ruler", icon: Ruler, label: "Ruler" },
  { id: "shapes", icon: Shapes, label: "Shapes" },
] as const;

export function TradeToolbar({
  timeframes,
  timeframe,
  onTimeframe,
  onNewOrder,
}: {
  timeframes: { id: Timeframe; label: string; ms: number }[];
  timeframe: Timeframe;
  onTimeframe: (tf: Timeframe) => void;
  onNewOrder?: () => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--bg-elev)]/60 px-2 py-1.5">
      {/* New Order — the primary MT5 action */}
      <button
        onClick={onNewOrder}
        className="flex items-center gap-1.5 rounded-md bg-[var(--accent)]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--accent-bright)] transition-smooth hover:bg-[var(--accent)]/25"
        title="New Order (F9)"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">New Order</span>
      </button>

      <span className="mx-1 h-5 w-px bg-[var(--border)]" />

      {/* drawing tools */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              title={t.label}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]",
                i === 0 && "bg-[var(--bg-hover)] text-[var(--accent-bright)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      <span className="mx-1 h-5 w-px bg-[var(--border)]" />

      {/* timeframe switcher */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf.id}
            onClick={() => onTimeframe(tf.id)}
            className={cn(
              "shrink-0 rounded px-2 py-1 font-mono-nums text-[10px] font-semibold tabular-nums transition-smooth",
              timeframe === tf.id
                ? "bg-[var(--accent)] text-[var(--bg)]"
                : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* right cluster */}
 <div className="ms-auto flex items-center gap-0.5">
        <button
          title="Undo"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--fg-dim)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg-muted)]"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          title="Redo"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--fg-dim)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg-muted)]"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-[var(--border)]" />
        <button
          title="Print"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--fg-dim)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg-muted)]"
        >
          <Printer className="h-3.5 w-3.5" />
        </button>
        <button
          title="Full Screen"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--fg-dim)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg-muted)]"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
