"use client";

import {
  Crown,
  Zap,
  Plug,
  PlugZap,
  Trash2,
  Star,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { type MT5Account, SERVER_LABELS } from "@/lib/admin/mt5-types";
import { cn, formatMoney } from "@/lib/utils";

interface Props {
  account: MT5Account;
  onActivate: (id: string) => void;
  onSetMaster: (id: string) => void;
  onToggleConn: (id: string, connect: boolean) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onActivate, onSetMaster, onToggleConn, onDelete }: Props) {
  const [confirmDel, setConfirmDel] = useState(false);
  const a = account;
  const pnl = a.equity - a.balance;
  const pnlPct = a.balance > 0 ? (pnl / a.balance) * 100 : 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[var(--bg-surface)] transition-smooth",
        a.isActive
          ? "border-[var(--emerald)]/40 shadow-[0_0_0_1px_rgba(25,201,138,0.12),0_8px_30px_-12px_rgba(25,201,138,0.25)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
      )}
    >
      {/* status accent bar */}
      <div className={cn("h-1 w-full", a.isActive ? "bg-gradient-to-l from-[var(--emerald)] to-[var(--emerald-bright)]" : a.isMaster ? "bg-gradient-to-l from-[var(--gold-deep)] to-[var(--gold)]" : "bg-transparent")} />

      <div className="p-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-[var(--text-primary)]">{a.label}</h3>
              {a.isMaster && (
                <Badge tone="gold" icon={<Crown className="h-2.5 w-2.5" />}>MASTER</Badge>
              )}
              {a.isActive && (
                <Badge tone="emerald" icon={<Zap className="h-2.5 w-2.5" />}>ACTIVE</Badge>
              )}
            </div>
            <p className="mt-0.5 font-mono-nums text-xs text-[var(--text-muted)]">
              #{a.login} · {SERVER_LABELS[a.server]}
            </p>
          </div>

          <ConnStatus connected={a.isActiveConn} error={a.lastError} />
        </div>

        {/* balance / equity */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Metric label="الرصيد" value={formatMoney(a.balance, 2)} />
          <Metric label="حقوق الملكية" value={formatMoney(a.equity, 2)} />
          <Metric
            label="P/L طافٍ"
            value={`${pnl >= 0 ? "+" : ""}${formatMoney(pnl, 2)}`}
            tone={pnl >= 0 ? "up" : "down"}
            sub={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`}
          />
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-3 text-[11px] text-[var(--text-muted)]">
          <span className="font-mono-nums">{a.currency}</span>
          <span className="text-[var(--fg-dim)]">·</span>
          <span>1:{a.leverage}</span>
          <span className="text-[var(--fg-dim)]">·</span>
          <span>{a.lastConnectedAt ? `آخر اتصال ${timeAgo(a.lastConnectedAt)}` : "لم يتّصل بعد"}</span>
        </div>

        {/* actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!a.isActive ? (
            <ActionBtn primary onClick={() => onActivate(a.id)} icon={<Zap className="h-3.5 w-3.5" />}>
              تنشيط
            </ActionBtn>
          ) : (
            <ActionBtn disabled icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              الحساب النشط
            </ActionBtn>
          )}

          {!a.isMaster ? (
            <ActionBtn ghost onClick={() => onSetMaster(a.id)} icon={<Star className="h-3.5 w-3.5" />}>
              رئيسي
            </ActionBtn>
          ) : (
            <ActionBtn ghost disabled icon={<Crown className="h-3.5 w-3.5" />}>
              الحساب الرئيسي
            </ActionBtn>
          )}

          <ActionBtn
            ghost
            onClick={() => onToggleConn(a.id, !a.isActiveConn)}
            icon={a.isActiveConn ? <PlugZap className="h-3.5 w-3.5" /> : <Plug className="h-3.5 w-3.5" />}
          >
            {a.isActiveConn ? "قطع الاتصال" : "اتصال"}
          </ActionBtn>

          <div className="ml-auto">
            {confirmDel ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(a.id); setConfirmDel(false); }}
                  className="rounded-lg bg-[var(--danger)] px-2.5 py-1.5 text-[11px] font-bold text-white transition-smooth hover:opacity-90"
                >
                  تأكيد الحذف
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="rounded-lg px-2 py-1.5 text-[11px] text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                title="حذف"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-smooth hover:bg-[var(--danger)]/12 hover:text-[var(--danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- sub-components ----------
function Badge({ tone, icon, children }: { tone: "emerald" | "gold"; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        tone === "emerald"
          ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
          : "bg-[var(--gold)]/15 text-[var(--gold-bright)]"
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function ConnStatus({ connected, error }: { connected: boolean; error?: string | null }) {
  if (connected) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/30 bg-[var(--emerald)]/8 px-2 py-1 text-[10px] font-semibold text-[var(--emerald-bright)]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald-bright)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" />
        </span>
        متّصل
      </span>
    );
  }
  if (error) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-2 py-1 text-[10px] font-semibold text-[var(--danger)]" title={error}>
        <AlertTriangle className="h-3 w-3" /> خطأ
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)]">
      غير متّصل
    </span>
  );
}

function Metric({ label, value, tone, sub }: { label: string; value: string; tone?: "up" | "down"; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className={cn("font-mono-nums text-sm font-bold", tone === "up" ? "text-[var(--emerald-bright)]" : tone === "down" ? "text-[var(--danger)]" : "text-[var(--text-primary)]")}>
        {value}
      </p>
      {sub && (
        <p className={cn("font-mono-nums text-[10px]", tone === "up" ? "text-[var(--emerald)]" : tone === "down" ? "text-[var(--danger)]" : "text-[var(--text-muted)]")}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ActionBtn({
  children,
  icon,
  onClick,
  primary,
  ghost,
  disabled,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  ghost?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-smooth disabled:cursor-default disabled:opacity-50",
        primary && !disabled && "bg-[var(--emerald)] text-black hover:bg-[var(--emerald-bright)]",
        ghost && !disabled && "border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
        primary && disabled && "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]",
        ghost && disabled && "border border-[var(--gold)]/30 bg-[var(--gold)]/8 text-[var(--gold-bright)]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} ي`;
}
