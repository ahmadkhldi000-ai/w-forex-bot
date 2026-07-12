"use client";

import { useMemo } from "react";
import { TrendingUp, PieChart } from "lucide-react";
import type { Trade } from "@/lib/trading/profile";

type Slice = { label: string; value: number; color: string };

// Color per asset class (kept stable across renders)
const CLASS_COLOR: Record<string, string> = {
  "FX Majors": "#19c98a",
  Metals: "#f5b14e",
  "FX Crosses": "#46c2e0",
  Indices: "#9d7bff",
  Crypto: "#f5786e",
  Energy: "#d2a855",
  Other: "#7e8a9a",
};

/**
 * Classify a symbol into an asset class for the allocation donut.
 * Works with MT5 symbol naming conventions (EURUSD, XAUUSD, US30, BTCUSD, UKOIL…).
 */
function classifySymbol(symbol: string): string {
  const s = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Metals: XAU (gold), XAG (silver), XPT, XPD, GOLD, SILVER
  if (/^(XAU|XAG|XPT|XPD|GOLD|SILVER)/.test(s)) return "Metals";

  // Indices: US30, NAS100, SPX500, GER40, UK100, JP225, etc.
  if (/^(US30|US500|SPX500|NAS100|NDX|GER40|DAX|UK100|JP225|NIKKEI|FRA40|AUS200|HK50|US2000)/.test(s))
    return "Indices";

  // Crypto: BTC, ETH, etc.
  if (/^(BTC|ETH|LTC|XRP|SOL|ADA|DOGE)/.test(s)) return "Crypto";

  // Energy: UKOIL, USOIL, WTI, BRENT, NGAS
  if (/^(UKOIL|USOIL|WTI|BRENT|NGAS|XBR|XTB)/.test(s)) return "Energy";

  // FX Crosses: pairs without USD (e.g. EURGBP, AUDJPY)
  if (/^(EURGBP|EURJPY|EURCHF|EURAUD|EURCAD|EURNZD|GBPJPY|GBPCHF|GBPAUD|GBPCAD|GBPNZD|AUDJPY|AUDCAD|AUDCHF|AUDNZD|CADJPY|CADCHF|CHFJPY|NZDJPY|NZDCAD)/.test(s))
    return "FX Crosses";

  // FX Majors: anything else that looks like a 6-letter forex pair
  if (/^[A-Z]{6}$/.test(s)) return "FX Majors";

  return "Other";
}

/** Approximate notional exposure per position (volume in lots × 100k × price). */
function notional(p: Trade): number {
  // For FX, 1 lot = 100,000 units; for metals/indices volume is already meaningful.
  // We use volume × openPrice as a rough relative weight — good enough for a donut.
  const vol = Math.abs(p.volume || 0);
  const price = p.openPrice || 0;
  return vol * price;
}

/** Group positions into slices by asset class. */
function buildSlices(positions: Trade[]): Slice[] {
  const buckets = new Map<string, number>();
  for (const p of positions) {
    const cls = classifySymbol(p.symbol);
    buckets.set(cls, (buckets.get(cls) ?? 0) + notional(p));
  }
  const slices: Slice[] = [];
  for (const [label, value] of buckets) {
    if (value > 0) {
      slices.push({ label, value, color: CLASS_COLOR[label] ?? CLASS_COLOR.Other });
    }
  }
  // Sort largest first for a cleaner donut
  slices.sort((a, b) => b.value - a.value);
  return slices;
}

// Precompute arc segments (avoid mutating a shared variable during render)
function buildSegments(items: Slice[]) {
  const total = items.reduce((s, d) => s + d.value, 0);
  const R = 56;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return items.map((d) => {
    const len = (d.value / total) * C;
    const seg = { ...d, len, offset: acc };
    acc += len;
    return seg;
  });
}

export function AllocationDonut({ positions }: { positions?: Trade[] }) {
  const data = useMemo(() => buildSlices(positions ?? []), [positions]);
  const segments = buildSegments(data);
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 56;
  const C = 2 * Math.PI * R;

  // Empty state: no positions → no allocation to show
  if (total <= 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2.5">
          <PieChart className="h-[18px] w-[18px] text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            توزيع المراكز
          </h3>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="relative mb-3 h-32 w-32">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth="14"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-nums text-lg font-semibold text-[var(--text-muted)]">
                0%
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            لا توجد مراكز مفتوحة حالياً
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]/70">
            يظهر التوزيع عند فتح المراكز
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5">
        <TrendingUp className="h-[18px] w-[18px] text-[var(--accent-bright)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          توزيع المراكز
        </h3>
      </div>

      <div className="mt-6 flex items-center gap-6">
        {/* Donut */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${seg.len} ${C - seg.len}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-500 ease-out"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-nums text-lg font-semibold text-[var(--text-primary)]">
              {data.length}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">فئات</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <div className="flex-1">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {d.label}
                </span>
              </div>
              <span className="font-mono-nums text-xs font-medium">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
