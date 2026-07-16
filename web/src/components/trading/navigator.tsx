"use client";

import { useState } from "react";
import {
  ChevronRight,
  FolderTree,
  FolderOpen,
  Calculator,
  Wallet,
  User,
  Cpu,
  PlugZap,
} from "lucide-react";
import { AccountSnapshot } from "@/lib/trading/types";
import { cn, formatMoney } from "@/lib/utils";

/* ====================================================================
   Navigator — re-creates the MT5 "Navigator" panel (left in LTR /
   right in RTL after the Market Watch).

   Tree structure mirrors MT5:
   • Accounts   → current login + demo/real badge
   • Indicators → technical indicators list
   • Expert Advisors → the W-Forex-Bot engine
   • Scripts    → quick one-shot scripts
   ==================================================================== */

type NodeKey = "accounts" | "indicators" | "eas" | "scripts";

export function Navigator({
  account,
  masterLogin,
  connected,
  onConnect,
}: {
  account: AccountSnapshot | null;
  masterLogin?: number | string;
  connected?: boolean;
  onConnect?: () => void;
}) {
  const [open, setOpen] = useState<Record<NodeKey, boolean>>({
    accounts: true,
    indicators: false,
    eas: true,
    scripts: false,
  });

  const toggle = (k: NodeKey) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <FolderTree className="h-3.5 w-3.5 text-[var(--accent)]" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-muted)]">
          Navigator
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 text-[12px]">
        {/* ===== Accounts ===== */}
        <TreeNode
          label="Accounts"
          icon={open.accounts ? FolderOpen : ChevronRight}
          onToggle={() => toggle("accounts")}
          expanded={open.accounts}
        />
        {open.accounts && (
          <div className="ms-3 border-s border-[var(--border)] ps-2">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-smooth hover:bg-[var(--bg-hover)]/60">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  connected
                    ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                    : "bg-[var(--bg-hover)] text-[var(--fg-dim)]"
                )}
              >
                <User className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-[var(--fg)]">
                  {masterLogin ? `#${masterLogin}` : "No account"}
                </p>
                <p className="text-[9px] text-[var(--fg-dim)]">
                  {connected ? "Connected · Real" : "Disconnected"}
                </p>
              </div>
            </div>

            {account && (
              <div className="mt-1 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]/50 p-2">
                <NavRow icon={Wallet} label="Balance" value={formatMoney(account.balance, 2)} />
                <NavRow icon={Calculator} label="Equity" value={formatMoney(account.equity, 2)} />
                <NavRow
                  icon={Calculator}
                  label="Free Margin"
                  value={formatMoney(account.freeMargin, 2)}
                />
                <NavRow
                  icon={Calculator}
                  label="Margin Lvl"
                  value={`${account.marginLevel.toFixed(1)}%`}
                  tone={account.marginLevel < 200 ? "danger" : "neutral"}
                />
              </div>
            )}

            {/* Connect / manage MT5 account button */}
            <button
              onClick={onConnect}
              className={cn(
                "mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-smooth",
                connected
                  ? "text-[var(--fg-muted)] hover:bg-[var(--bg-hover)]/60 hover:text-[var(--fg)]"
                  : "bg-[var(--accent)]/15 text-[var(--accent-bright)] hover:bg-[var(--accent)]/25"
              )}
            >
              <PlugZap className="h-3.5 w-3.5 shrink-0" />
              {connected ? "إدارة الحساب" : "ربط حساب MT5"}
            </button>
          </div>
        )}

        {/* ===== Indicators ===== */}
        <div className="mt-1">
          <TreeNode
            label="Indicators"
            icon={open.indicators ? FolderOpen : ChevronRight}
            onToggle={() => toggle("indicators")}
            expanded={open.indicators}
          />
          {open.indicators && (
            <div className="ms-3 border-s border-[var(--border)] ps-2">
              {["Trend", "Oscillators", "Volume", "Bill Williams", "Custom"].map((g) => (
                <div
                  key={g}
                  className="cursor-pointer rounded px-2 py-1 text-[11px] text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)]/60 hover:text-[var(--fg)]"
                >
                  {g}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Expert Advisors ===== */}
        <div className="mt-1">
          <TreeNode
            label="Expert Advisors"
            icon={open.eas ? FolderOpen : ChevronRight}
            onToggle={() => toggle("eas")}
            expanded={open.eas}
          />
          {open.eas && (
            <div className="ms-3 border-s border-[var(--border)] ps-2">
              <div className="flex items-center gap-2 rounded-md bg-[var(--accent-dim)] px-2 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--accent)]/20">
                  <Cpu className="h-3 w-3 text-[var(--accent-bright)]" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--accent-bright)]">
                    W-Forex-Bot
                  </p>
                  <p className="text-[9px] text-[var(--fg-dim)]">v2.0 · Attached</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Scripts ===== */}
        <div className="mt-1">
          <TreeNode
            label="Scripts"
            icon={open.scripts ? FolderOpen : ChevronRight}
            onToggle={() => toggle("scripts")}
            expanded={open.scripts}
          />
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  label,
  icon: Icon,
  onToggle,
  expanded,
}: {
  label: string;
  icon: React.ElementType;
  onToggle: () => void;
  expanded: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-start text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)]/60 hover:text-[var(--fg)]"
    >
      <Icon
        className={cn(
          "h-3 w-3 shrink-0 transition-transform",
          expanded && "rotate-90 text-[var(--accent)]"
        )}
      />
      {label}
    </button>
  );
}

function NavRow({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[9px] text-[var(--fg-dim)]">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </span>
      <span
        className={cn(
          "font-mono-nums text-[10px] font-semibold tabular-nums",
          tone === "danger" ? "text-[var(--danger)]" : "text-[var(--fg)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
