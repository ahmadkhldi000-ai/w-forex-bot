"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { withBase } from "@/lib/path";
import { useI18n } from "@/lib/i18n/provider";
import { LangToggle } from "./lang-toggle";
import { Logo } from "@/components/ui/logo";

export function MarketingNav() {
  const { lang, t } = useI18n();
  const links = t.nav.links[lang];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-smooth",
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Logo height={34} priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)] hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LangToggle variant="compact" />
          <a
            href="/dashboard"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
          >
            {t.nav.signin[lang]}
          </a>
          <a
            href="/dashboard"
            className="shine relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-5 text-sm font-semibold text-[#04130d] shadow-[0_8px_24px_-8px_rgba(25,201,138,0.6)] transition-smooth hover:-translate-y-0.5"
          >
            {t.nav.dashboard[lang]}
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LangToggle variant="compact" />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu[lang]}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden transition-smooth lg:hidden",
          open ? "max-h-96 border-b border-[var(--border-subtle)]" : "max-h-0",
        )}
        style={{ background: "var(--bg-base)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] text-sm font-semibold text-[#04130d]"
          >
            {t.nav.dashboard[lang]}
          </a>
        </div>
      </div>
    </header>
  );
}
