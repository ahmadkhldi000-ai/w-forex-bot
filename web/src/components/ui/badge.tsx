import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  tone = "emerald",
}: {
  children: ReactNode;
  className?: string;
  tone?: "emerald" | "gold" | "neutral";
}) {
  const tones = {
    emerald:
      "border-emerald/25 bg-emerald/10 text-emerald-bright",
    gold: "border-gold/25 bg-gold/10 text-gold-bright",
    neutral: "border-white/10 bg-white/5 text-fg-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
