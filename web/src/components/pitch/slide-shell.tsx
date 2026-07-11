"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PITCH } from "@/lib/pitch/content";

/** The 16:9 stage every slide renders inside */
export function SlideShell({
  index,
  total,
  children,
  className,
}: {
  index: number;
  total: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[16/9] w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elev)] shadow-2xl",
        className
      )}
    >
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--emerald)]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[var(--gold)]/8 blur-[100px]" />

      {/* body */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-[5%] py-[4%]">{children}</div>

      {/* footer */}
      <SlideFooter index={index} total={total} />
    </div>
  );
}

function SlideFooter({ index, total }: { index: number; total: number }) {
  return (
    <div className="relative z-10 flex items-center justify-between border-t border-[var(--border)] px-[5%] py-2 text-[10px] text-[var(--fg-dim)]">
      <span className="font-mono-nums font-semibold tracking-[0.2em]">{PITCH.brand}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono-nums">
          INVESTOR DECK · {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </span>
      <span className="hidden font-mono-nums sm:inline">Telegram · {PITCH.telegram}</span>
    </div>
  );
}

/** Eyebrow label shown at top-left of most slides */
export function SlideEyebrow({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono-nums text-xs font-bold text-[var(--emerald-bright)]">{num}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--fg-muted)]">
        {title}
      </span>
    </div>
  );
}
