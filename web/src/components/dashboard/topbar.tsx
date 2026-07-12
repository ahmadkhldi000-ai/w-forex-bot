"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Crown } from "lucide-react";
import { LiveDot } from "@/components/ui/primitives";
import { getSession, clearSession, type Session } from "@/lib/auth/account-store";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const [session] = useState<Session | null>(() => getSession());
  const [showOwnerEntry, setShowOwnerEntry] = useState(false);

  // Secret keyboard shortcut to reveal the Owner Vault entry (Ctrl+Shift+M).
  // Hidden from regular users — only someone who knows the shortcut sees the
  // golden crown button that leads to the master-account console.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "M" || e.key === "m")) {
        e.preventDefault();
        setShowOwnerEntry((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const user = session;

  // Owner-only gate: the Master Account button appears ONLY when the
  // signed-in email belongs to the platform owner (ahmadkhldi000).
  const isOwner = (user?.email ?? "").toLowerCase().startsWith("ahmadkhldi000");

  const initials = (user?.name ?? user?.email ?? "U")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    clearSession();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-6 backdrop-blur-xl lg:px-8">
      {/* Status */}
      <div className="flex items-center gap-2 rounded-full bg-[var(--bg-surface)] px-3 py-1.5">
        <LiveDot />
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          متصل
        </span>
      </div>

      <div className="flex-1" />

      {/* Owner Vault entry — visible ONLY for the owner (ahmadkhldi000) */}
      {isOwner && (
        <button
          onClick={() => router.push("/owner")}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 text-xs font-bold text-[var(--gold-bright)] transition-smooth hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/15"
          title="حساب الماستر (MT5)"
        >
          <Crown className="h-[16px] w-[16px]" />
          <span className="hidden sm:inline">حساب الماستر</span>
        </button>
      )}

      {/* Notifications */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        aria-label="الإشعارات"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </button>

      {/* Account */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 ps-1.5 pe-3">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--gold)] to-[#c97f1e] text-xs font-bold text-black">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || "U"
          )}
        </div>
        <div className="hidden text-start sm:block">
          <p className="text-xs font-semibold leading-tight text-[var(--text-primary)]">
            {user?.name ?? user?.email?.split("@")[0] ?? "مستخدم"}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {user?.email ?? "زائر"}
          </p>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-[var(--text-muted)] sm:block" />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </header>
  );
}
