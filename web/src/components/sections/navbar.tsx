"use client";

import { useEffect, useState } from "react";
import { Menu, X, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "الميزات", href: "#features" },
  { label: "الاستراتيجية", href: "#strategy" },
  { label: "كيف يعمل", href: "#how" },
  { label: "الأسعار", href: "#pricing" },
  { label: "الآراء", href: "#testimonials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container className="flex h-18 items-center justify-between py-4">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-bright to-emerald-deep shadow-[0_6px_20px_-6px_rgba(16,185,129,0.7)]">
            <TrendingUp className="h-5 w-5 text-[#04130d]" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-fg">W</span>
            <span className="text-lg font-bold tracking-tight text-gradient-emerald">
              Forex
            </span>
            <span className="text-sm font-medium text-fg-muted">Bot</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm">
            تسجيل الدخول
          </Button>
          <Button variant="primary" size="sm">
            ابدأ مجاناً
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-fg hover:bg-white/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 glass-strong",
          open ? "max-h-96 border-b border-border" : "max-h-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:text-fg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1">
              تسجيل الدخول
            </Button>
            <Button variant="primary" size="sm" className="flex-1">
              ابدأ مجاناً
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
