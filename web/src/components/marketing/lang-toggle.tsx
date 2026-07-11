"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Variant = "ghost" | "solid" | "compact";

export function LangToggle({ variant = "ghost", className }: { variant?: Variant; className?: string }) {
  const { lang, toggle } = useI18n();
  const label = lang === "ar" ? "EN" : "ع";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Switch language"
        className={cn(
          "group inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5",
          "text-xs font-semibold text-[var(--text-secondary)] transition-smooth",
          "hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "solid") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Switch language"
        dir={lang === "ar" ? "ltr" : "rtl"}
        className={cn(
          "group inline-flex h-9 items-center gap-1.5 rounded-lg px-3",
          "bg-[var(--accent-dim)] text-xs font-semibold text-[var(--accent-bright)]",
          "transition-smooth hover:bg-[var(--accent)]/20",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
        {lang === "ar" ? "English" : "العربية"}
      </button>
    );
  }

  // ghost (default)
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch language"
      dir={lang === "ar" ? "ltr" : "rtl"}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3",
        "text-xs font-medium text-[var(--text-secondary)] transition-smooth",
        "hover:border-[var(--accent)]/40 hover:text-[var(--accent-bright)]",
        className,
      )}
    >
      <Languages className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
      {lang === "ar" ? "English" : "العربية"}
    </button>
  );
}
