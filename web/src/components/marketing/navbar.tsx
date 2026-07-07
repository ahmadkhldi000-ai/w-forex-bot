"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "الميزات", href: "#features" },
  { label: "الاستراتيجية", href: "#strategy" },
  { label: "كيف يعمل", href: "#how" },
  { label: "الأسعار", href: "#pricing" },
];

export function MarketingNav() {
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
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)] shadow-[0_6px_20px_-6px_rgba(25,201,138,0.7)]">
            <TrendingUp className="h-5 w-5 text-[#04130d]" strokeWidth={2.5} />
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              W
            </span>
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(120deg,#2ee9a8,#19c98a 60%,#6ee7b7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Forex
            </span>
            <span className="text-sm font-medium text-[var(--text-muted)]">
              Bot
            </span>
          </span>
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
          <a
            href="/dashboard"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
          >
            تسجيل الدخول
          </a>
          <a
            href="/dashboard"
            className="shine relative inline-flex h-10 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-5 text-sm font-semibold text-[#04130d] shadow-[0_8px_24px_-8px_rgba(25,201,138,0.6)] transition-smooth hover:-translate-y-0.5"
          >
            الدخول للوحة التحكم
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-white/5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden transition-smooth lg:hidden",
          open ? "max-h-80 border-b border-[var(--border-subtle)]" : "max-h-0",
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
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] text-sm font-semibold text-[#04130d]"
          >
            الدخول للوحة التحكم
          </a>
        </div>
      </div>
    </header>
  );
}
