"use client";

import { Bell, Zap, Crown, Search, ShieldAlert } from "lucide-react";
import { type MT5Account } from "@/lib/admin/mt5-types";
import { LiveDot } from "@/components/ui/primitives";

interface Props {
  activeAccount?: MT5Account;
  masterAccount?: MT5Account;
  accountsCount: number;
}

export function AdminTopbar({ activeAccount, masterAccount, accountsCount }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-6 backdrop-blur-xl">
      {/* Search (decorative) */}
      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="بحث في النظام..."
          className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] pr-10 pl-4 text-sm text-[var(--text-secondary)] outline-none transition-smooth placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/40"
        />
      </div>

      <div className="flex-1" />

      {/* Active account pill */}
      {activeAccount ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-dim)] px-3.5 py-2">
          <LiveDot active={activeAccount.isActiveConn} />
          <div className="hidden text-right sm:block">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
              <Zap className="h-3 w-3 text-[var(--accent-bright)]" />
              {activeAccount.label}
            </p>
            <p className="font-mono-nums text-[10px] text-[var(--text-muted)]">
              #{activeAccount.login}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-dim)] px-3.5 py-2">
          <ShieldAlert className="h-4 w-4 text-[var(--danger)]" />
          <span className="text-xs font-medium text-[var(--danger)]">
            لا يوجد حساب نشط
          </span>
        </div>
      )}

      {/* Master pill */}
      {masterAccount && (
        <div className="hidden items-center gap-2.5 rounded-xl border border-[var(--gold)]/25 bg-[var(--gold)]/10 px-3.5 py-2 md:flex">
          <Crown className="h-4 w-4 text-[var(--gold-bright)]" />
          <div className="text-right">
            <p className="text-xs font-semibold text-[var(--gold-bright)]">
              {masterAccount.label}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">الحساب الرئيسي</p>
          </div>
        </div>
      )}

      {/* Notifications */}
      <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]">
        <Bell className="h-5 w-5" />
        {accountsCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent-bright)] ring-2 ring-[var(--bg-surface)]" />
        )}
      </button>
    </header>
  );
}
