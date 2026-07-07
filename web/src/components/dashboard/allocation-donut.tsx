"use client";

import { TrendingUp } from "lucide-react";

type Slice = { label: string; value: number; color: string };

const data: Slice[] = [
  { label: "FX Majors", value: 42, color: "#19c98a" },
  { label: "Metals", value: 28, color: "#f5b14e" },
  { label: "FX Crosses", value: 18, color: "#46c2e0" },
  { label: "Indices", value: 12, color: "#9d7bff" },
];

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

export function AllocationDonut() {
  const segments = buildSegments(data);
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 56;
  const C = 2 * Math.PI * R;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5">
        <TrendingUp className="h-[18px] w-[18px] text-[var(--accent-bright)]" />
        <h3 className="text-base font-semibold tracking-tight">Exposure</h3>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-[140px] w-[140px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="14"
            />
            {segments.map((s) => (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${s.len - 4} ${C - s.len + 4}`}
                strokeDashoffset={-s.offset}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-nums text-xl font-semibold">$48.7K</span>
            <span className="text-[10px] text-[var(--text-muted)]">deployed</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs text-[var(--text-secondary)]">
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
