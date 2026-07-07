"use client";

import { Search, Bell, Settings, Globe } from "lucide-react";

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-8 backdrop-blur-xl">
      <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="بحث..."
            className="w-56 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] py-2 pr-9 pl-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--gold)] focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Admin profile */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-bright)] text-xs font-bold text-[var(--bg-base)]">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Super Admin
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">admin@wforexbot.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
