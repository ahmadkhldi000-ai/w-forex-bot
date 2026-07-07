"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-emerald-bright to-emerald-deep text-[#04130d] font-semibold shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] hover:shadow-[0_14px_40px_-8px_rgba(16,185,129,0.8)] hover:-translate-y-0.5",
  secondary:
    "glass text-fg hover:bg-surface-2 hover:border-border-strong hover:-translate-y-0.5",
  ghost:
    "text-fg-muted hover:text-fg hover:bg-white/5",
  gold:
    "bg-gradient-to-b from-gold-bright to-gold-deep text-[#1a1003] font-semibold shadow-[0_10px_30px_-8px_rgba(245,185,66,0.55)] hover:shadow-[0_14px_40px_-8px_rgba(245,185,66,0.75)] hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "shine relative inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:pointer-events-none active:translate-y-0 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
