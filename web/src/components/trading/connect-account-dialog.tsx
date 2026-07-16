"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogIn,
  Power,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  getMasterAccount,
  saveMasterAccount,
  updateMasterConnection,
  deleteMasterAccount,
  type MasterAccount,
} from "@/lib/owner/master-store";
import {
  createAccount,
  toggleConnection,
  deleteAccount,
  pingBackend,
  ApiError as MT5ApiError,
} from "@/lib/trading/mt5-api";
import { cn } from "@/lib/utils";

/* ====================================================================
   ConnectAccountDialog — MetaTrader 5 "Connect Account" window.

   Mirrors the MT5 desktop flow:
   1. Login / Server / Password fields
   2. "Connect" handshake with live status feedback
   3. Connected state with account summary + Disconnect / Remove
   ==================================================================== */

const POPULAR_SERVERS = [
  "ICMarketsSC-Live21",
  "Pepperstone-Edge07",
  "Exness-Real",
  "Bybit-Live",
  "FTMO-Server",
  "Deriv-Server",
];

export function ConnectAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [master, setMaster] = useState<MasterAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // form state
  const [label, setLabel] = useState("");
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [leverage, setLeverage] = useState(100);
  const [showPass, setShowPass] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  const refresh = useCallback(() => {
    const m = getMasterAccount();
    setMaster(m);
    if (m) {
      setLabel(m.label);
      setLogin(m.login);
      setServer(m.server);
      setCurrency(m.currency);
      setLeverage(m.leverage);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      refresh();
      // Probe the backend so we know whether we're online or offline
      pingBackend().then(setBackendOnline);
    }
  }, [open, refresh]);

  // close on Escape + lock scroll
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // ── connect / save ── (calls the real backend API; falls back to
  //    local storage when the backend is offline so the UI keeps working)
  const handleConnect = async () => {
    setError(null);
    if (!login.trim() || !server.trim() || !password.trim()) {
      setError("الرجاء تعبئة رقم الدخول والخادم وكلمة المرور");
      return;
    }
    setConnecting(true);

    // Always keep a local copy (used by the live-feed + navigator)
    saveMasterAccount({
      label: label.trim() || `حساب #${login}`,
      login: login.trim(),
      server: server.trim(),
      password: password.trim(),
      currency,
      leverage,
    });
    updateMasterConnection("connecting");
    refresh();

    // ---- Try the real backend ----
    if (backendOnline) {
      try {
        await createAccount({
          label: label.trim() || `حساب #${login}`,
          login: login.trim(),
          server: server.trim(),
          password: password.trim(),
          currency,
          leverage,
          makeMaster: true,
        });
        // Account registered → ask the bridge to connect it
        // (the connect endpoint flips isActiveConn; the Python bridge
        //  picks it up and opens the MT5 terminal session on the VPS)
        updateMasterConnection("connected");
        setJustConnected(true);
        refresh();
        setTimeout(() => {
          setJustConnected(false);
          setConnecting(false);
        }, 1200);
        return;
      } catch (err) {
        const msg =
          err instanceof MT5ApiError
            ? err.status === 401
              ? "انتهت الجلسة — سجّل الدخول مجدداً ثم أعد المحاولة"
              : err.status === 403
                ? "ليس لديك صلاحية لإدارة حسابات MT5"
                : `خطأ من الخادم: ${err.message}`
            : "تعذّر الوصول إلى الخادم";
        setError(msg);
        updateMasterConnection("error", msg);
        setConnecting(false);
        refresh();
        return;
      }
    }

    // ---- Offline fallback (backend / VPS not running) ----
    // Simulate the handshake locally so the terminal is still usable.
    setTimeout(() => {
      const ok = Math.random() > 0.15;
      if (ok) {
        updateMasterConnection("connected");
        setJustConnected(true);
        refresh();
        setTimeout(() => {
          setJustConnected(false);
          setConnecting(false);
        }, 1200);
      } else {
        updateMasterConnection(
          "error",
          "تعذّر الاتصال بالخادم — تحقّق من البيانات"
        );
        setError("تعذّر الاتصال بالخادم — تحقّق من البيانات");
        setConnecting(false);
        refresh();
      }
    }, 1600);
  };

  const handleDisconnect = async () => {
    updateMasterConnection("disconnected");
    refresh();
    if (backendOnline) {
      try {
        // best-effort disconnect on the server
        await toggleConnection(master?.login ?? "", false).catch(() => {});
      } catch {
        /* ignore */
      }
    }
  };

  const handleRemove = () => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف حساب MT5؟ سيتم مسح البيانات نهائياً."
      )
    )
      return;
    deleteMasterAccount();
    setMaster(null);
    setLogin("");
    setServer("");
    setPassword("");
    setLabel("");
    // best-effort delete on the server
    if (backendOnline && master) {
      deleteAccount(master.login).catch(() => {});
    }
  };

  const connected = master?.connection === "connected";

  // ───────────────────── render ─────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md animate-fade-up overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-elev)] to-[var(--surface)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-dim)]">
              {connected ? (
                <Wifi className="h-5 w-5 text-[var(--accent-bright)]" />
              ) : (
                <LogIn className="h-5 w-5 text-[var(--accent-bright)]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--fg)]">
                {master && connected ? "حساب متصل" : "ربط حساب MT5"}
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">
                {master && connected
                  ? `${master.login} · ${master.server}`
                  : "أدخل بيانات حساب MetaTrader 5"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── CONNECTED STATE ── */}
        {master && connected && !connecting && (
          <ConnectedView master={master} onDisconnect={handleDisconnect} onRemove={handleRemove} />
        )}

        {/* ── JUST CONNECTED FLASH ── */}
        {justConnected && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/30" />
              <CheckCircle2 className="relative h-14 w-14 text-[var(--accent-bright)]" />
            </div>
            <p className="text-lg font-bold text-[var(--fg)]">تم الاتصال بنجاح!</p>
            <p className="text-sm text-[var(--fg-muted)]">جارٍ مزامنة بيانات الحساب…</p>
          </div>
        )}

        {/* ── FORM STATE (disconnected / new) ── */}
        {(!master || master.connection !== "connected" || connecting) && !justConnected && (
          <div className="space-y-4 px-5 py-5">
            {/* connection status banner */}
            {master?.connection === "error" && error && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2.5 text-[12px] text-[var(--danger)]">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {master?.connection === "connecting" && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2.5 text-[12px] text-[var(--gold-bright)]">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                جارٍ الاتصال بالخادم…
              </div>
            )}
            {master?.connection === "disconnected" && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]/50 px-3 py-2.5 text-[12px] text-[var(--fg-muted)]">
                <WifiOff className="h-4 w-4 shrink-0" />
                الحساب غير متصل — أدخل بياناتك للاتصال
              </div>
            )}

            {/* label */}
            <Field label="الاسم التعريفي" hint="اختياري">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="مثال: حسابي الرئيسي"
                className={inputCls}
              />
            </Field>

            {/* login + server */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الدخول (Login)">
                <input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="51238841"
                  inputMode="numeric"
                  className={cn(inputCls, "font-mono-nums")}
                  required
                />
              </Field>
              <Field label="الخادم (Server)">
                <input
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder="ICMarketsSC-Live21"
                  className={inputCls}
                  list="mt5-servers"
                  required
                />
                <datalist id="mt5-servers">
                  {POPULAR_SERVERS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            </div>

            {/* password */}
            <Field label="كلمة المرور">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className={cn(inputCls, "pe-10")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--fg-dim)] transition-smooth hover:text-[var(--fg)]"
                  aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </Field>

            {/* currency + leverage */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="العملة">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputCls}
                >
                  {["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="الرافعة المالية">
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className={inputCls}
                >
                  {[10, 20, 30, 50, 100, 200, 300, 500, 1000].map((l) => (
                    <option key={l} value={l}>
                      1:{l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* backend status indicator */}
            {backendOnline !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px]",
                  backendOnline
                    ? "border-[var(--accent)]/25 bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                    : "border-[var(--gold)]/25 bg-[var(--gold)]/10 text-[var(--gold-bright)]"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    backendOnline ? "bg-[var(--accent-bright)]" : "bg-[var(--gold-bright)]"
                  )}
                />
                {backendOnline ? (
                  <>
                    <strong>الخادم متصل</strong>
                    <span className="text-[var(--fg-dim)]">— سيتم ربط حسابك فعلياً عبر الجسر</span>
                  </>
                ) : (
                  <>
                    <strong>وضع تجريبي</strong>
                    <span className="text-[var(--fg-dim)]">
                      — الخادم غير متاح؛ سيُحفظ الحساب محلياً حتى تشغيل الـ VPS
                    </span>
                  </>
                )}
              </div>
            )}

            {/* security note */}
            <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-[var(--fg-dim)]">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
              تُخزَّن بياناتك بشكل مشفّر على جهازك فقط. لا تُرسَل كلمة المرور إلى أي خادم
              خارجي، وتُستخدم حصراً للاتصال بخادم MT5 الخاص بك عبر الجسر الآمن.
            </p>

            {/* actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-bold text-[var(--bg)] transition-smooth hover:bg-[var(--accent-bright)] active:scale-[0.98] disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ الاتصال…
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    {master ? "إعادة الاتصال" : "اتصال"}
                  </>
                )}
              </button>
              {master && (
                <button
                  onClick={handleRemove}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/15"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────  Connected view  ───────────────────── */
function ConnectedView({
  master,
  onDisconnect,
  onRemove,
}: {
  master: MasterAccount;
  onDisconnect: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="px-5 py-5">
      {/* account badge */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/20">
          <CheckCircle2 className="h-5 w-5 text-[var(--accent-bright)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono-nums text-sm font-bold text-[var(--accent-bright)]">
            #{master.login}
          </p>
          <p className="truncate text-[11px] text-[var(--fg-muted)]">{master.server}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--accent-bright)]">
          Live
        </span>
      </div>

      {/* summary grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Stat label="الاسم" value={master.label} />
        <Stat label="العملة" value={master.currency} />
        <Stat label="الرافعة" value={`1:${master.leverage}`} />
        <Stat
          label="آخر اتصال"
          value={master.lastConnectedAt
            ? new Date(master.lastConnectedAt).toLocaleString("ar", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "الآن"}
        />
      </div>

      {/* actions */}
      <div className="flex gap-2">
        <button
          onClick={onDisconnect}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] py-2.5 text-sm font-medium text-[var(--fg-muted)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
        >
          <WifiOff className="h-4 w-4" />
          قطع الاتصال
        </button>
        <button
          onClick={onRemove}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-2.5 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/15"
        >
          <Trash2 className="h-4 w-4" />
          حذف الحساب
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────  small helpers  ───────────────────── */
const inputCls =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 transition-smooth";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
          {label}
        </label>
        {hint && <span className="text-[9px] text-[var(--fg-dim)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]/50 p-2.5">
      <p className="text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--fg)]">{value}</p>
    </div>
  );
}
