"use client";

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
  Activity,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Live Trading", icon: Radio, href: "/live-trading" },
  { label: "Analytics", icon: CandlestickChart, href: "/analytics" },
  { label: "Strategies", icon: Bot, href: "/strategies" },
  { label: "Trade History", icon: History, href: "/history" },
  { label: "Subscription", icon: Newspaper, href: "/subscription" },
  { label: "Settings", icon: Settings2, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-[252px] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo height={32} priority />
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
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-smooth",
                active
                  ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-smooth",
                  active
                    ? "text-[var(--accent-bright)]"
                    : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                )}
                strokeWidth={2}
              />
              <span className="font-medium">{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" />
              )}
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
            <div className="flex items-center gap-1.5">
              <LiveDot />
              <span className="text-[11px] font-medium text-[var(--accent-bright)]">
                LIVE
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--text-primary)]">
            3
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            strategies active
          </p>

          <Link
            href="/strategies"
            className="mt-3 flex items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white/[0.02] py-2 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--accent)]/40 hover:text-[var(--accent-bright)]"
          >
            Manage
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-3 px-3 py-2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-secondary)]">
          <CircleHelp className="h-4 w-4" />
          <span className="text-xs">Help & Docs</span>
        </div>
      </div>
    </aside>
  );
}
