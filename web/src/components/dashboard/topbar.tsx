"use client";

import { Bell, Search, ChevronDown, Zap } from "lucide-react";
import { LiveDot } from "@/components/ui/primitives";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-6 backdrop-blur-xl lg:px-8">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search markets, trades, signals…"
          className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--accent)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Market clock */}
        <div className="hidden items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 md:flex">
          <LiveDot />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Markets Open
          </span>
          <span className="font-mono-nums text-xs text-[var(--text-muted)]">
            · FX · NY
          </span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
        </button>

        {/* Quick trade */}
        <button className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#0f8f5f] px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[var(--accent)]/20 transition-smooth hover:shadow-[var(--accent)]/30 hover:brightness-110 sm:flex">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
          New Trade
        </button>

        {/* Account */}
        <button className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 pl-1.5 pr-3 transition-smooth hover:border-[var(--border-strong)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gold)] to-[#c97f1e] text-xs font-bold text-black">
            AK
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight">Ahmad K.</p>
            <p className="text-[10px] text-[var(--text-muted)]">Pro · Verified</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-[var(--text-muted)] sm:block" />
        </button>
      </div>
    </header>
  );
}
