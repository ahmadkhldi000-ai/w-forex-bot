"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, LogOut, PlugZap } from "lucide-react";
import { LiveDot } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { ConnectAccountDialog } from "@/components/trading/connect-account-dialog";
import { getMasterAccount, type MasterAccount } from "@/lib/owner/master-store";
import { getSession, clearSession, type Session } from "@/lib/auth/account-store";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { LangToggle } from "@/components/marketing/lang-toggle";
import { cn } from "@/lib/utils";

/** The platform owner — the ONLY account that ever sees master-account entry points. */
const OWNER_EMAIL_PREFIX = "ahmadkhldi000";

export function Topbar({ showConnectMT5 = false }: { showConnectMT5?: boolean } = {}) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [connectOpen, setConnectOpen] = useState(false);
  const [master, setMaster] = useState<MasterAccount | null>(null);

  // Keep session in sync if it changes (e.g. after login on another tab)
  useEffect(() => {
    setSession(getSession());
    setMaster(getMasterAccount());
  }, []);

  // Re-read master account whenever the dialog closes (state may have changed)
  const refreshMaster = useCallback(() => setMaster(getMasterAccount()), []);
  useEffect(() => {
    if (!connectOpen) refreshMaster();
  }, [connectOpen, refreshMaster]);

  const user = session
    ? {
        name: session.name,
        email: session.email,
        avatarUrl: session.avatarUrl,
      }
    : null;
  const isOwner = (user?.email ?? "").toLowerCase().startsWith(OWNER_EMAIL_PREFIX);
  const displayName =
    user?.name ?? user?.email?.split("@")[0] ?? t.topbar.guest[lang];
  const initials = (user?.name ?? user?.email ?? "U")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    clearSession();
    router.push("/auth");
  };

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-4 pr-14 backdrop-blur-xl transition-smooth sm:h-[68px] sm:gap-4 sm:px-6 sm:pr-6 lg:px-8"
    >
      {/* ============================================================ */}
      {/*  BRAND LOGO — always visible on the right (start in RTL)      */}
      {/*  This is the persistent brand anchor across all dashboard     */}
      {/*  pages. Clicking it returns to the dashboard root.            */}
      {/* ============================================================ */}
      <a
        href="/dashboard"
        className="logo-ring flex shrink-0 items-center gap-2.5 ps-1 pe-2 py-1 outline-none transition-smooth"
        aria-label="W Forex Bot — Trading Terminal"
      >
        <Logo height={30} variant="icon" priority />
        <span className="hidden flex-col leading-none sm:flex">
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
            W Forex
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {lang === "ar" ? "غرفة التداول" : "Terminal"}
          </span>
        </span>
      </a>

      <div className="flex-1" />

      {/* Owner-only master entry — completely hidden for everyone else.
          Runs silently in the background; no UI hint for non-owners. */}
      {false && <span className="hidden">{isOwner ? "owner" : ""}</span>}

      {/* Language switcher */}
      <LangToggle
        variant="ghost"
        className="h-9 px-3 text-xs font-medium"
      />

      {showConnectMT5 && <MT5ConnectButton
        master={master}
        lang={lang}
        t={t}
        onOpen={() => setConnectOpen(true)}
      />}

      {/* Notifications */}
      <button
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        aria-label={t.topbar.notifications[lang]}
        title={t.topbar.notifications[lang]}
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </button>

      {/* Account chip — avatar + name + connected status */}
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 ps-1.5 pe-2 transition-smooth hover:border-[var(--border-soft)] sm:pe-3">
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

      {showConnectMT5 && (
        <ConnectAccountDialog
          open={connectOpen}
          onClose={() => setConnectOpen(false)}
        />
      )}
    </header>
  );
}

/* ============================================================
   MT5ConnectButton — prominent connect affordance shown in the
   Topbar on the Live Trading page. Reflects live connection state
   from the master store and adapts its look accordingly.
   ============================================================ */
function MT5ConnectButton({
  master,
  lang,
  t,
  onOpen,
}: {
  master: MasterAccount | null;
  lang: "ar" | "en";
  t: ReturnType<typeof useI18n>["t"];
  onOpen: () => void;
}) {
  const connected = master?.connection === "connected";
  const connecting = master?.connection === "connecting";

  const label = connecting
    ? t.topbar.mt5Connecting[lang]
    : connected
      ? t.topbar.manageMT5[lang]
      : t.topbar.connectMT5[lang];

  return (
    <button
      onClick={onOpen}
      dir={lang === "ar" ? "rtl" : "ltr"}
      title={
        master
          ? `${t.topbar.mt5Login[lang]} #${master.login} · ${
              connected
                ? t.topbar.mt5Connected[lang]
                : connecting
                  ? t.topbar.mt5Connecting[lang]
                  : t.topbar.mt5Disconnected[lang]
            }`
          : t.topbar.connectMT5[lang]
      }
      className={cn(
        "group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl border px-3 text-xs font-semibold transition-smooth",
        "h-9",
        connected
          ? "border-[var(--accent)]/30 bg-[var(--accent-dim)] text-[var(--accent-bright)] hover:border-[var(--accent)]/55"
          : connecting
            ? "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-bright)]"
            : "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent-bright)] hover:bg-[var(--accent)]/25"
      )}
    >
      {/* subtle sheen sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      <span className="relative flex items-center gap-2">
        <span
          className={cn(
            "relative flex h-1.5 w-1.5 items-center justify-center rounded-full",
            connected
              ? "bg-[var(--accent-bright)]"
              : connecting
                ? "bg-[var(--gold-bright)]"
                : "bg-[var(--accent)]"
          )}
        >
          {connected && (
            <span className="absolute h-full w-full animate-ping rounded-full bg-[var(--accent-bright)] opacity-75" />
          )}
          {connecting && (
            <span className="absolute h-full w-full animate-ping rounded-full bg-[var(--gold-bright)] opacity-75" />
          )}
        </span>
        <PlugZap
          className={cn(
            "h-[15px] w-[15px] transition-transform duration-300 group-hover:scale-110",
            connecting && "animate-pulse"
          )}
        />
        <span className="hidden xs:inline sm:inline md:inline">{label}</span>
      </span>
    </button>
  );
}
