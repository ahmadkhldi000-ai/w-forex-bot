"use client";

import { useState } from "react";
import { X, Plus, Server, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { MT5Server, SERVER_LABELS, type MT5AccountInput } from "@/lib/admin/mt5-types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MT5AccountInput) => void;
}

const SERVERS = Object.keys(SERVER_LABELS) as MT5Server[];

export function AddAccountDialog({ open, onClose, onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [login, setLogin] = useState("");
  const [server, setServer] = useState<MT5Server>("ICMARKETS_REAL");
  const [serverName, setServerName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [leverage, setLeverage] = useState(100);
  const [currency, setCurrency] = useState("USD");
  const [makeActive, setMakeActive] = useState(false);
  const [makeMaster, setMakeMaster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const valid = label.trim() && login.trim() && password.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    // simulate network latency to match real API behaviour
    setTimeout(() => {
      onSubmit({
        label: label.trim(),
        login: login.trim(),
        server,
        serverName: server === "CUSTOM" ? serverName.trim() || undefined : undefined,
        password: password,
        leverage,
        currency,
        makeActive,
        makeMaster,
      });
      setSaving(false);
      setDone(true);
      setTimeout(() => {
        reset();
        onClose();
      }, 850);
    }, 700);
  };

  function reset() {
    setLabel(""); setLogin(""); setServer("ICMARKETS_REAL"); setServerName("");
    setPassword(""); setShowPw(false); setLeverage(100); setCurrency("USD");
    setMakeActive(false); setMakeMaster(false); setSaving(false); setDone(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-2xl">
        {done ? (
          <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
            <CheckCircle2 className="h-12 w-12 text-[var(--emerald-bright)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تمّت الإضافة</h3>
            <p className="text-sm text-[var(--text-muted)]">تم تسجيل حساب MT5 بنجاح.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--emerald)]/15 text-[var(--emerald-bright)]">
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">إضافة حساب MT5</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">يُشفّر المعرّف وكلمة المرور قبل التخزين</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] transition-smooth hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              <Field label="الاسم التعريفي">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="مثال: Primary — Prop Firm"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="رقم الحساب (Login)">
                  <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="5123 8841"
                    className={cn(inputCls, "font-mono-nums")}
                  />
                </Field>
                <Field label="الرافعة المالية">
                  <select value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className={inputCls}>
                    {[30, 50, 100, 200, 300, 500, 1000].map((l) => (
                      <option key={l} value={l}>1:{l}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="الخادم">
                <div className="relative">
                  <Server className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value as MT5Server)}
                    className={cn(inputCls, "pr-10")}
                  >
                    {SERVERS.map((s) => (
                      <option key={s} value={s}>{SERVER_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                {server === "CUSTOM" && (
                  <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="اسم الخادم المخصّص"
                    className={cn(inputCls, "mt-2")}
                  />
                )}
              </Field>

              <Field label="كلمة مرور المستثمر">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(inputCls, "pr-10 pl-12 font-mono-nums")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
                  >
                    {showPw ? "إخفاء" : "إظهار"}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  checked={makeActive}
                  onChange={setMakeActive}
                  label="تعيين كحساب نشط"
                  hint="حساب واحد فقط"
                  color="emerald"
                />
                <Toggle
                  checked={makeMaster}
                  onChange={setMakeMaster}
                  label="تعيين كحساب رئيسي"
                  hint="مصدر Copy-Trading"
                  color="gold"
                />
              </div>

              <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[var(--border-strong)] py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-smooth hover:bg-[var(--surface-2)]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!valid || saving}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[var(--emerald)] py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ التسجيل…</>
                  ) : (
                    <><Plus className="h-4 w-4" /> إضافة الحساب</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)] py-2.5 pr-3 pl-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--emerald)] focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  color,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  color: "emerald" | "gold";
}) {
  const active = color === "emerald";
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-right transition-smooth",
        checked
          ? active
            ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/10"
            : "border-[var(--gold)]/40 bg-[var(--gold)]/10"
          : "border-[var(--border-soft)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]"
      )}
    >
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-smooth",
          checked ? (active ? "bg-[var(--emerald)]" : "bg-[var(--gold)]") : "bg-[var(--surface-2)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-smooth",
            checked ? "left-0.5" : "right-0.5"
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-[var(--text-primary)]">{label}</span>
        <span className="block text-[10px] text-[var(--text-muted)]">{hint}</span>
      </span>
    </button>
  );
}
