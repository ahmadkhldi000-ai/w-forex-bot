"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CandlestickChart,
  Bot,
  History,
  Settings2,
  Newspaper,
  CircleHelp,
  Radio,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/ui/primitives";
import { SmartLogo } from "@/components/ui/smart-logo";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Live Trading", icon: Radio, href: "/live-trading" },
  { label: "Analytics", icon: CandlestickChart, href: "/analytics" },
  { label: "Strategies", icon: Bot, href: "/strategies" },
  { label: "Trade History", icon: History, href: "/history" },
  { label: "Subscription", icon: Newspaper, href: "/subscription" },
  { label: "Settings", icon: Settings2, href: "/settings" },
];

/* Shared inner content so desktop + mobile draw the exact same nav */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <SmartLogo height={32} priority />
        <p className="text-[11px] text-[var(--text-muted)]">Trading Terminal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Workspace
        </p>
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-smooth",
                active
                  ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bot status card */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              Engine
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent-bright)]">
              <LiveDot />
              Live
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">strategies active</p>
          <Link
            href="/strategies"
            onClick={onNavigate}
            className="mt-3 flex items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white/[0.02] py-2 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--accent)]/40 hover:text-[var(--accent-bright)]"
          >
            Manage
          </Link>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile menu trigger — floats at the top-right (RTL) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar (hidden on mobile) */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[252px] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-xl lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Drawer — slides in from the right (RTL-friendly) */}
          <aside className="absolute inset-y-0 right-0 flex w-[280px] max-w-[85vw] animate-[slideIn_0.22s_ease-out] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute left-3 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
