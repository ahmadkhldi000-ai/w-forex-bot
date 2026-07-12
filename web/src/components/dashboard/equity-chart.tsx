"use client";

import { useMemo, useRef, useState } from "react";
import { cn, formatMoney } from "@/lib/utils";
import type { EquityPoint } from "@/lib/trading/profile";

const RANGES = ["1H", "4H", "1D", "1W", "1M", "ALL"] as const;
type Range = (typeof RANGES)[number];

export function EquityChart({ history }: { history: EquityPoint[] }) {
  const [range, setRange] = useState<Range>("ALL");
  const [hover, setHover] = useState<{ x: number; y: number; v: number; i: number } | null>(
    null
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  const W = 760;
  const H = 280;
  const padX = 8;
  const padY = 24;

  const data = useMemo(() => {
    // Use the REAL equity history; fall back to a single zero point if empty.
    const values = history.map((p) => p.equity);
    if (values.length === 0) return [0];
    return values;
  }, [history]);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range01 = max - min || 1;
  const stepX = (W - padX * 2) / (data.length - 1);

  const coords = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = H - padY - ((v - min) / range01) * (H - padY * 2);
    return { x, y, v };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${path} L${coords[coords.length - 1].x.toFixed(1)},${H} L${padX},${H} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const changePct = ((last - first) / first) * 100;
  const positive = changePct >= 0;

  function handleMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round((relX - padX) / stepX);
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    setHover({
      x: coords[clamped].x,
      y: coords[clamped].y,
      v: data[clamped],
      i: clamped,
    });
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold tracking-tight">
              Equity Curve
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                positive
                  ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "bg-[var(--danger-dim)] text-[var(--danger)]"
              )}
            >
              {positive ? "+" : ""}
              {changePct.toFixed(2)}%
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono-nums text-2xl font-semibold tracking-tight">
              {formatMoney(last, 0)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {positive ? "+" : ""}
              {formatMoney(last - first, 0)} · {range}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHover(null);
              }}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-smooth",
                range === r
                  ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-5 w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[260px] w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="eq-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? "#19c98a" : "#f4576b"} stopOpacity="0.32" />
              <stop offset="100%" stopColor={positive ? "#19c98a" : "#f4576b"} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="eq-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={positive ? "#0f8f5f" : "#c93648"} />
              <stop offset="100%" stopColor={positive ? "#2ee9a8" : "#f4576b"} />
            </linearGradient>
          </defs>

          {/* gridlines */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={W - padX}
              y1={padY + g * (H - padY * 2)}
              y2={padY + g * (H - padY * 2)}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 5"
            />
          ))}

          <path d={areaPath} fill="url(#eq-area)" />
          <path
            d={path}
            fill="none"
            stroke="url(#eq-line)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hover && (
            <>
              <line
                x1={hover.x}
                x2={hover.x}
                y1={padY}
                y2={H - padY}
                stroke="rgba(255,255,255,0.18)"
                strokeDasharray="3 3"
              />
              <circle cx={hover.x} cy={hover.y} r="9" fill={positive ? "#19c98a" : "#f4576b"} opacity="0.18" />
              <circle
                cx={hover.x}
                cy={hover.y}
                r="4"
                fill={positive ? "#2ee9a8" : "#f4576b"}
                stroke="#070a0b"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 shadow-xl"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
              transform: `translate(-50%, calc(-100% - 12px))`,
            }}
          >
            <p className="font-mono-nums text-sm font-semibold">
              {formatMoney(hover.v, 0)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">point #{hover.i + 1}</p>
          </div>
        )}
      </div>
    </div>
  );
}
