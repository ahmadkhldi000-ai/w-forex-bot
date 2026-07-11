"use client";

import { useState } from "react";
import { Plus, Lock, ShieldCheck } from "lucide-react";
import { AccountCard } from "@/components/admin/account-card";
import { AddAccountDialog } from "@/components/admin/add-account-dialog";
import { type MT5Account, type MT5AccountInput } from "@/lib/admin/mt5-types";
import { formatMoney } from "@/lib/utils";

interface Props {
  accounts: MT5Account[];
  onAdd: (input: MT5AccountInput) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onSetMaster: (id: string) => void;
  onToggleConn: (id: string, connect: boolean) => void;
}

export function AccountsTab({
  accounts,
  onAdd,
  onDelete,
  onActivate,
  onSetMaster,
  onToggleConn,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);

  const active = accounts.find((a) => a.isActive);
  const master = accounts.find((a) => a.isMaster);
  const connected = accounts.filter((a) => a.isActiveConn).length;
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">حسابات MT5</h1>
            <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
              {accounts.length} حسابات
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <Lock className="h-3.5 w-3.5 text-[var(--accent-bright)]" />
            مساحة محمية — حساب واحد فقط Active. جميع العمليات مسجّلة في سجلّ النشاط.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-5 text-sm font-semibold text-[#04130d] shadow-[0_8px_24px_-8px_rgba(25,201,138,0.6)] transition-smooth hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          إضافة حساب MT5
        </button>
      </div>

      {/* Quick summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryPill
          label="إجمالي حقوق الملكية"
          value={formatMoney(totalEquity, 0)}
          tone="neutral"
        />
        <SummaryPill label="متصل" value={String(connected)} tone="accent" />
        <SummaryPill
          label="النشط"
          value={active ? `#${active.login}` : "—"}
          tone="accent"
        />
        <SummaryPill
          label="الرئيسي"
          value={master ? `#${master.login}` : "—"}
          tone="gold"
        />
      </div>

      {/* Accounts grid */}
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-dim)]">
            <ShieldCheck className="h-7 w-7 text-[var(--accent-bright)]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
            لا توجد حسابات بعد
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            ابدأ بإضافة أول حساب MT5 لإدارة التداول
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-5 text-sm font-semibold text-[#04130d]"
          >
            <Plus className="h-4 w-4" />
            إضافة أول حساب
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              onActivate={onActivate}
              onSetMaster={onSetMaster}
              onToggleConn={onToggleConn}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddAccountDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(input) => {
          onAdd(input);
          setShowAdd(false);
        }}
      />
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "gold" | "neutral";
}) {
  const tones = {
    accent: "border-[var(--accent)]/20 bg-[var(--accent-dim)] text-[var(--accent-bright)]",
    gold: "border-[var(--gold)]/20 bg-[var(--gold)]/10 text-[var(--gold-bright)]",
    neutral: "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-mono-nums text-sm font-bold">{value}</p>
    </div>
  );
}
