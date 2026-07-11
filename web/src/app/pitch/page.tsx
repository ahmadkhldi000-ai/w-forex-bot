"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SLIDES } from "@/components/pitch/slides";
import { cn } from "@/lib/utils";

export default function PitchPage() {
  const [current, setCurrent] = useState(0);
  const [grid, setGrid] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const total = SLIDES.length;

  const go = useCallback(
    (n: number) => setCurrent((c) => Math.max(0, Math.min(total - 1, n))),
    [total]
  );
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key === "Escape") setGrid(false);
      else if (e.key === "g" || e.key === "G") setGrid((g) => !g);
      else if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total]);

  const ActiveSlide = SLIDES[current];

  return (
    <div dir="ltr" className={cn("flex min-h-screen flex-col bg-[var(--bg)]", fullscreen && "fixed inset-0 z-50")}>
      {/* top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono-nums text-sm font-black tracking-tight text-[var(--fg)]">
            W.<span className="text-[var(--emerald-bright)]">FOREX</span>
          </span>
          <span className="hidden rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold-bright)] sm:inline">
            INVESTOR DECK
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setGrid((g) => !g)}
            title="Overview (G)"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-smooth",
              grid
                ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/10 text-[var(--emerald-bright)]"
                : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            title="Fullscreen (F)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-strong)] text-[var(--fg-muted)] transition-smooth hover:text-[var(--fg)]"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* stage */}
      {!grid ? (
        <main className="flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-6">
          <div className="flex w-full max-w-[1280px] items-center gap-2 sm:gap-4">
            <NavButton dir="left" disabled={current === 0} onClick={prev} />
            <div key={current} className="min-w-0 flex-1 animate-[fadeIn_0.3s_ease-out]">
              <ActiveSlide />
            </div>
            <NavButton dir="right" disabled={current === total - 1} onClick={next} />
          </div>
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SLIDES.map((S, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setGrid(false); }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-[var(--bg-elev)] p-1 transition-smooth hover:-translate-y-0.5",
                  i === current ? "border-[var(--emerald)]/50 ring-2 ring-[var(--emerald)]/20" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className="pointer-events-none aspect-[16/9] overflow-hidden rounded-lg [&_*]:!pointer-events-none">
                  <div className="origin-top-left scale-[0.34]">
                    <S />
                  </div>
                </div>
                <span className="absolute left-2 top-2 rounded-md bg-[var(--bg-base)]/80 px-1.5 py-0.5 font-mono-nums text-[10px] font-bold text-[var(--fg)] backdrop-blur">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {/* bottom controls */}
      {!grid && (
        <footer className="border-t border-[var(--border)] px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-[1280px] items-center gap-4">
            {/* progress */}
            <div className="flex flex-1 items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="group flex-1"
                  title={`Slide ${i + 1}`}
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-smooth",
                      i === current ? "bg-[var(--emerald-bright)]" : i < current ? "bg-[var(--emerald)]/50" : "bg-[var(--surface-2)] group-hover:bg-[var(--border-strong)]"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="shrink-0 font-mono-nums text-xs font-semibold text-[var(--fg-muted)]">
              {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

function NavButton({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled?: boolean }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/60 text-[var(--fg-muted)] transition-smooth hover:border-[var(--emerald)]/40 hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-25 sm:flex"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
