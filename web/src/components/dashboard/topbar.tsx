"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { LiveDot } from "@/components/ui/primitives";
import { getSession, clearSession, type Session } from "@/lib/auth/account-store";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";

/** The platform owner — the ONLY account that ever sees master-account entry points. */
const OWNER_EMAIL_PREFIX = "ahmadkhldi000";

export function Topbar() {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [session, setSession] = useState<Session | null>(() => getSession());

  // Keep session in sync if it changes (e.g. after login on another tab)
  useEffect(() => {
    setSession(getSession());
  }, []);

  const user = session;

  // Owner-only gate: anything master-related is invisible to everyone else.
  const isOwner = (user?.email ?? "").toLowerCase().startsWith(OWNER_EMAIL_PREFIX);

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? t.topbar.guest[lang];
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
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-4 pr-14 backdrop-blur-xl sm:h-[68px] sm:gap-4 sm:px-6 sm:pr-6 lg:px-8">
      <div className="flex-1" />

      {/* Owner-only master entry — completely hidden for everyone else.
          Runs silently in the background; no UI hint for non-owners. */}
      {false && <span className="hidden">{isOwner ? "owner" : ""}</span>}

      {/* Notifications */}
      <button
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        aria-label={t.topbar.notifications[lang]}
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </button>

      {/* Account chip — avatar + name + connected status */}
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 ps-1.5 pe-2 sm:pe-3">
        {/* Avatar — shows the user's email/profile picture when available */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[var(--gold)] to-[#c97f1e] text-xs font-bold text-black">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            (initials || "U")
          )}
        </div>

        {/* Name + connected badge (kept together so "متصل" sits next to the name) */}
        <div className="min-w-0 text-start">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-semibold leading-tight text-[var(--text-primary)] sm:max-w-[140px]">
              {displayName}
            </p>
            {/* Connected indicator — localized per language */}
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent-dim)] px-1.5 py-0.5">
              <LiveDot />
              <span className="hidden text-[10px] font-medium text-[var(--accent-bright)] xs:inline sm:inline">
                {t.topbar.connected[lang]}
              </span>
            </span>
          </div>
          <p className="hidden truncate text-[10px] text-[var(--text-muted)] sm:block sm:max-w-[160px]">
            {user?.email ?? t.topbar.guest[lang]}
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
        aria-label={t.topbar.logout[lang]}
        title={t.topbar.logout[lang]}
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </header>
  );
}
