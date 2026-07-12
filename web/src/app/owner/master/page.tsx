"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Server,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Plug,
  PlugZap,
  Trash2,
  LogOut,
  RefreshCw,
  Crown,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/auth/account-store";
import {
  isOwnerUnlocked,
  lockOwner,
  renewOwnerSession,
  getOwnerSession,
  getMasterAccount,
  saveMasterAccount,
  updateMasterConnection,
  deleteMasterAccount,
  type MasterAccount,
  type OwnerSession,
} from "@/lib/owner/master-store";

/**
 * Owner Master Console — /owner/master
 * -------------------------------------------------
 * Private workspace where the OWNER registers their real MT5
 * master account credentials. Nothing here is ever shown to
 * regular users or to the regular admin console.
 */
export default function OwnerMasterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<OwnerSession | null>(null);
  const [master, setMaster] = useState<MasterAccount | null>(null);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [leverage, setLeverage] = useState(100);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // connecting state
  const [connecting, setConnecting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [minsLeft, setMinsLeft] = useState(0);

  // ---------- master refresh ----------
  const refreshMaster = useCallback(() => {
    setMaster(getMasterAccount());
  }, []);

  // ---------- auth gate ----------
  useEffect(() => {
    setMounted(true);
    // OWNER-ONLY: verify the signed-in user is ahmadkhldi000
    const session = getSession();
    const email = (session?.email ?? "").toLowerCase();
    const isOwnerEmail = email.startsWith("ahmadkhldi000");
    if (!session || !isOwnerEmail || !isOwnerUnlocked()) {
      router.replace("/owner");
      return;
    }
    setAuthed(true);
    setSession(getOwnerSession());
    refreshMaster();
  }, [router, refreshMaster]);

  // ---------- session refresh watcher ----------
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => {
      renewOwnerSession();
      const s = getOwnerSession();
      if (!s) {
        router.replace("/owner");
      } else {
        setSession(s);
      }
    }, 60000); // renew every minute
    return () => clearInterval(t);
  }, [authed, router]);

  // recompute session minutes left on a timer
  useEffect(() => {
    if (!session) return;
    const tick = () =>
      setMinsLeft(
        Math.max(
          0,
          Math.round(
            (new Date(session.expiresAt).getTime() - Date.now()) / 60000
          )
        )
      );
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [session]);

  if (!mounted || !authed) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
      </main>
    );
  }

  // ---------- handlers ----------
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!label || !login || !server || !password) return;
    setSaving(true);
    setTimeout(() => {
      const saved = saveMasterAccount({
        label,
        login,
        server,
        password,
        currency,
        leverage,
      });
      setMaster(saved);
      setSaving(false);
      setShowForm(false);
      // reset form
      setLabel("");
      setLogin("");
      setServer("");
      setPassword("");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    }, 700);
  }

  function handleConnect() {
    if (!master) return;
    setConnecting(true);
    // Simulate the MT5 bridge handshake
    updateMasterConnection("connecting");
    refreshMaster();
    setTimeout(() => {
      // 90% success on demo
      const ok = Math.random() > 0.1;
      if (ok) {
        const updated = updateMasterConnection("connected");
        setMaster(updated);
      } else {
        const updated = updateMasterConnection(
          "error",
          "تعذّر الاتصال بالخادم — تحقّق من بيانات الدخول"
        );
        setMaster(updated);
      }
      setConnecting(false);
    }, 1600);
  }

  function handleDisconnect() {
    if (!master) return;
    updateMasterConnection("disconnected");
    refreshMaster();
  }

  function handleDelete() {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف حساب الماستر؟ سيتمّ مسح جميع البيانات نهائياً."
      )
    )
      return;
    deleteMasterAccount();
    setMaster(null);
    setShowForm(true);
  }

  function handleLock() {
    lockOwner();
    router.replace("/owner");
  }

  function copyValue(field: string, value: string) {
    try {
      navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="relative min-h-[100dvh] bg-[var(--bg-base)]">
      {/* Ambient gold aura */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute right-0 top-0 h-[460px] w-[460px] rounded-full bg-[var(--gold)]/6 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-[var(--emerald)]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 py-8 lg:px-10 lg:py-12">
        {/* ---------- Top bar ---------- */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex items-center gap-3">
            <Logo height={30} priority />
            <div className="flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold-bright)]">
              <Lock className="h-3 w-3" />
              Owner Vault
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] text-[var(--text-muted)]">
              <Clock className="h-3.5 w-3.5" />
              <span>
                الجلسة تنتهي خلال{" "}
                <span className="font-mono-nums font-semibold text-[var(--gold-bright)]">
                  {minsLeft}
                </span>{" "}
                د
              </span>
            </div>
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              قفل الخزنة
            </button>
          </div>
        </header>

        {/* ---------- Page title ---------- */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold)]/15 to-[var(--gold-deep)]/10">
              <Crown className="h-5 w-5 text-[var(--gold-bright)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] lg:text-2xl">
                حساب الماستر — MT5
              </h1>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                حساب التداول الرئيسي الذي يديره الروبوت نيابةً عنك. خاصّ بك
                وحدك.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- Saved flash banner ---------- */}
        {savedFlash && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--emerald)]/25 bg-[var(--emerald)]/8 px-4 py-3 text-sm text-[var(--emerald-bright)] flash-green">
            <CheckCircle2 className="h-4 w-4" />
            تمّ حفظ حساب الماستر بنجاح.
          </div>
        )}

        {/* ---------- Master account card / empty state ---------- */}
        {!master && !showForm && (
          <EmptyState onAdd={() => setShowForm(true)} />
        )}

        {master && !showForm && (
          <MasterCard
            master={master}
            connecting={connecting}
            copiedField={copiedField}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onEdit={() => {
              setLabel(master.label);
              setLogin(master.login);
              setServer(master.server);
              setPassword(master.password);
              setCurrency(master.currency);
              setLeverage(master.leverage);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onCopy={copyValue}
          />
        )}

        {/* ---------- Register / edit form ---------- */}
        {showForm && (
          <MasterForm
            label={label}
            login={login}
            server={server}
            password={password}
            currency={currency}
            leverage={leverage}
            showPassword={showPassword}
            saving={saving}
            isEdit={!!master}
            onLabel={setLabel}
            onLogin={setLogin}
            onServer={setServer}
            onPassword={setPassword}
            onCurrency={setCurrency}
            onLeverage={setLeverage}
            onTogglePassword={() => setShowPassword((s) => !s)}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false);
              if (!master) {
                setLabel("");
                setLogin("");
                setServer("");
                setPassword("");
              }
            }}
          />
        )}

        {/* ---------- Security note ---------- */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/60 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--emerald)]/12">
            <ShieldCheck className="h-4 w-4 text-[var(--emerald-bright)]" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-[var(--text-primary)]">
              حماية البيانات
            </p>
            <p className="mt-1 leading-relaxed text-[var(--text-muted)]">
              تُخزَّن بيانات حساب الماستر مشفّرةً على جهازك فقط، ولا تظهر في
              أي مكان آخر داخل الموقع. هذه البوابة مخفيّة تماماً ولا يمكن
              الوصول إليها إلا برمز الدخول السريّ الخاصّ بك.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// ===================================================================
//  EMPTY STATE
// ===================================================================
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]/40 px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-[var(--gold)]/10 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold)]/12 to-[var(--gold-deep)]/8">
          <KeyRound className="h-7 w-7 text-[var(--gold-bright)]" />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">
        لم يتمّ ربط حساب ماستر بعد
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
        أضِف حساب MT5 الرئيسي ليتمكّن الروبوت من فتح وإدارة الصفقات على
        حسابك الحقيقي.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-6 py-3 text-sm font-bold text-[var(--bg-base)] transition-smooth hover:shadow-[0_8px_30px_-8px_var(--gold)]"
      >
        <Plug className="h-4 w-4" />
        ربط حساب الماستر
      </button>
    </div>
  );
}

// ===================================================================
//  MASTER ACCOUNT CARD
// ===================================================================
function MasterCard({
  master,
  connecting,
  copiedField,
  onConnect,
  onDisconnect,
  onEdit,
  onDelete,
  onCopy,
}: {
  master: MasterAccount;
  connecting: boolean;
  copiedField: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (field: string, value: string) => void;
}) {
  const connMeta = getConnMeta(master.connection);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
      {/* Card header with connection status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--gold)]/6 to-transparent px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border",
              connMeta.border,
              connMeta.bg
            )}
          >
            {master.connection === "connected" ? (
              <PlugZap className={cn("h-5 w-5", connMeta.text)} />
            ) : (
              <Server className={cn("h-5 w-5", connMeta.text)} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {master.label}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  connMeta.badgeBg,
                  connMeta.text
                )}
              >
                {connMeta.icon}
                {connMeta.label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {master.lastConnectedAt
                ? `آخر اتصال ${timeAgo(master.lastConnectedAt)}`
                : "لم يتّصل بعد"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {master.connection !== "connected" ? (
            <button
              onClick={onConnect}
              disabled={connecting || master.connection === "connecting"}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--emerald)] to-[var(--emerald-deep)] px-4 py-2 text-xs font-bold text-[var(--bg-base)] transition-smooth hover:shadow-[0_6px_20px_-6px_var(--emerald)] disabled:opacity-50"
            >
              {connecting || master.connection === "connecting" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wifi className="h-3.5 w-3.5" />
              )}
              {connecting || master.connection === "connecting"
                ? "جارٍ الاتصال..."
                : "اتصال"}
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
            >
              <WifiOff className="h-3.5 w-3.5" />
              قطع الاتصال
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {master.connection === "error" && master.lastError && (
        <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/8 px-3 py-2.5 text-xs text-[var(--danger)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{master.lastError}</span>
        </div>
      )}

      {/* Credential grid */}
      <div className="grid grid-cols-1 gap-px bg-[var(--border-subtle)] sm:grid-cols-2">
        <CredField
          label="رقم الدخول (Login)"
          value={master.login}
          mono
          copied={copiedField === "login"}
          onCopy={() => onCopy("login", master.login)}
        />
        <CredField
          label="الخادم (Server)"
          value={master.server}
          mono
          copied={copiedField === "server"}
          onCopy={() => onCopy("server", master.server)}
        />
        <CredField
          label="كلمة المرور"
          value="••••••••••"
          copied={copiedField === "password"}
          onCopy={() => onCopy("password", master.password)}
        />
        <div className="bg-[var(--bg-surface)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            العملة / الرافعة
          </p>
          <p className="mt-1.5 text-sm font-bold text-[var(--text-primary)]">
            {master.currency}{" "}
            <span className="text-[var(--text-muted)]">·</span>{" "}
            <span className="font-mono-nums">1:{master.leverage}</span>
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Activity className="h-3.5 w-3.5" />
          <span>
            أُنشئ في {new Date(master.createdAt).toLocaleDateString("ar")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--gold)]/40 hover:text-[var(--gold-bright)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            تعديل البيانات
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function CredField({
  label,
  value,
  mono,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="group bg-[var(--bg-surface)] px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <button
          onClick={onCopy}
          className="text-[var(--text-dim)] opacity-0 transition-smooth hover:text-[var(--gold-bright)] group-hover:opacity-100"
          aria-label="نسخ"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[var(--emerald-bright)]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p
        className={cn(
          "mt-1.5 truncate text-sm font-bold text-[var(--text-primary)]",
          mono && "font-mono-nums"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ===================================================================
//  MASTER FORM (register / edit)
// ===================================================================
function MasterForm(props: {
  label: string;
  login: string;
  server: string;
  password: string;
  currency: string;
  leverage: number;
  showPassword: boolean;
  saving: boolean;
  isEdit: boolean;
  onLabel: (v: string) => void;
  onLogin: (v: string) => void;
  onServer: (v: string) => void;
  onPassword: (v: string) => void;
  onCurrency: (v: string) => void;
  onLeverage: (v: number) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const inputCls =
    "w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] transition-smooth focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20";

  return (
    <form
      onSubmit={props.onSubmit}
      className="mt-8 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]"
    >
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--gold)]/6 to-transparent px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--gold)]/25 bg-[var(--gold)]/10">
          <KeyRound className="h-4 w-4 text-[var(--gold-bright)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {props.isEdit ? "تعديل حساب الماستر" : "تسجيل حساب الماستر"}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            أدخل بيانات حساب MT5 الرئيسي الخاصّ بك
          </p>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الاسم التعريفي">
            <input
              value={props.label}
              onChange={(e) => props.onLabel(e.target.value)}
              placeholder="مثال: حسابي الرئيسي"
              className={inputCls}
              required
            />
          </Field>
          <Field label="رقم الدخول (Login)">
            <input
              value={props.login}
              onChange={(e) => props.onLogin(e.target.value)}
              placeholder="51238841"
              inputMode="numeric"
              className={cn(inputCls, "font-mono-nums")}
              required
            />
          </Field>
        </div>

        <Field label="الخادم (Server)">
          <input
            value={props.server}
            onChange={(e) => props.onServer(e.target.value)}
            placeholder="ICMarketsSC-Live21"
            className={cn(inputCls, "font-mono-nums")}
            required
          />
        </Field>

        <Field label="كلمة المرور">
          <div className="relative">
            <input
              type={props.showPassword ? "text" : "password"}
              value={props.password}
              onChange={(e) => props.onPassword(e.target.value)}
              placeholder="••••••••••"
              className={cn(inputCls, "pl-10")}
              required
            />
            <button
              type="button"
              onClick={props.onTogglePassword}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-secondary)]"
              aria-label="إظهار/إخفاء كلمة المرور"
            >
              {props.showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="العملة">
            <select
              value={props.currency}
              onChange={(e) => props.onCurrency(e.target.value)}
              className={inputCls}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
            </select>
          </Field>
          <Field label="الرافعة المالية">
            <select
              value={props.leverage}
              onChange={(e) => props.onLeverage(Number(e.target.value))}
              className={inputCls}
            >
              {[10, 20, 30, 50, 100, 200, 300, 400, 500].map((l) => (
                <option key={l} value={l}>
                  1:{l}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* helper note */}
        <div className="flex items-start gap-2 rounded-lg border border-[var(--info)]/15 bg-[var(--info)]/6 px-3 py-2.5 text-xs text-[var(--text-secondary)]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--info)]" />
          <span>
            تجد هذه البيانات داخل تطبيق MetaTrader 5 ← ملف ← فتح حساب، أو في
            البريد الإلكتروني من وسيطك. يُفضّل استخدام كلمة مرور المستثمر
            (Investor) للقراءة فقط إن أردت مراقبة الحساب بدون صلاحية التداول.
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
        <button
          type="button"
          onClick={props.onCancel}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--text-muted)]"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={props.saving}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] px-5 py-2 text-xs font-bold text-[var(--bg-base)] transition-smooth hover:shadow-[0_6px_20px_-6px_var(--gold)] disabled:opacity-50"
        >
          {props.saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {props.saving ? "جارٍ الحفظ..." : "حفظ الحساب"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      {children}
    </label>
  );
}

// ===================================================================
//  Helpers
// ===================================================================
function getConnMeta(conn: MasterAccount["connection"]) {
  switch (conn) {
    case "connected":
      return {
        label: "متّصل",
        text: "text-[var(--emerald-bright)]",
        border: "border-[var(--emerald)]/30",
        bg: "bg-[var(--emerald)]/10",
        badgeBg: "bg-[var(--emerald)]/15",
        icon: <Wifi className="h-2.5 w-2.5" />,
      };
    case "connecting":
      return {
        label: "جارٍ الاتصال",
        text: "text-[var(--gold-bright)]",
        border: "border-[var(--gold)]/30",
        bg: "bg-[var(--gold)]/10",
        badgeBg: "bg-[var(--gold)]/15",
        icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
      };
    case "error":
      return {
        label: "خطأ",
        text: "text-[var(--danger)]",
        border: "border-[var(--danger)]/30",
        bg: "bg-[var(--danger)]/10",
        badgeBg: "bg-[var(--danger)]/15",
        icon: <AlertTriangle className="h-2.5 w-2.5" />,
      };
    default:
      return {
        label: "غير متّصل",
        text: "text-[var(--text-muted)]",
        border: "border-[var(--border-soft)]",
        bg: "bg-[var(--bg-elevated)]",
        badgeBg: "bg-[var(--bg-elevated)]",
        icon: <WifiOff className="h-2.5 w-2.5" />,
      };
  }
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
