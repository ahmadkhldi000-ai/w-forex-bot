"use client";

import { cn } from "@/lib/utils";

/* ---------- Sparkline ---------- */
export function Sparkline({
  points,
  width = 120,
  height = 36,
  positive = true,
  strokeWidth = 1.6,
}: {
  points: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return [x, y];
  });

  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${path} L${width},${height} L0,${height} Z`;
  const color = positive ? "#19c98a" : "#f4576b";
  const id = `sg-${positive ? "g" : "r"}-${points.length}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "gold" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-[var(--text-secondary)] border-white/10",
    success:
      "bg-[var(--accent-dim)] text-[var(--accent-bright)] border-[var(--accent)]/25",
    danger:
      "bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]/25",
    gold: "bg-[var(--gold)]/10 text-[var(--gold-bright)] border-[var(--gold)]/25",
    info: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Live dot ---------- */
export function LiveDot({ active = true }: { active?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
      )}
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          active ? "bg-[var(--accent-bright)]" : "bg-[var(--text-muted)]"
        )}
      />
    </span>
  );
}
