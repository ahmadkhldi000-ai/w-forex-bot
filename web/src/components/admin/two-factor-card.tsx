"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  KeyRound,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Two-Factor Authentication management widget.
 * Mirrors the server flow (server/src/routes/admin-auth.ts setup/verify/disable).
 */
export function TwoFactorCard({ enabled, onToggle }: Props) {
  const [step, setStep] = useState<"idle" | "secret" | "verify">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // mock secret (server generates a real base32 secret + otpauth URI)
  const secret = "JBSWY3DPEHPK3PXP-7M4XQZVF";

  const startEnable = () => {
    setStep("secret");
  };

  const verify = () => {
    if (code.length < 6) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep("idle");
      setCode("");
      onToggle(true);
    }, 800);
  };

  const disable = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onToggle(false);
    }, 600);
  };

  const copySecret = () => {
    navigator.clipboard?.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              enabled ? "bg-[var(--emerald)]/12 text-[var(--emerald-bright)]" : "bg-[var(--gold)]/12 text-[var(--gold-bright)]"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              المصادقة الثنائية (2FA)
              {enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--emerald-bright)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" /> مُفعّلة
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--danger)]/12 px-1.5 py-0.5 text-[10px] font-bold text-[var(--danger)]">
                  غير مُفعّلة
                </span>
              )}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              طبقة حماية إضافية باستخدام تطبيق Authenticator (Google / Authy) عند كل تسجيل دخول.
            </p>
          </div>
        </div>
      </div>

      {/* states */}
      <div className="mt-4">
        {enabled ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[var(--emerald-bright)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">حسابك محمي</p>
                <p className="text-[11px] text-[var(--text-muted)]">طريقة TOTP · آخر تحقق قبل 38 دقيقة</p>
              </div>
            </div>
            <button
              onClick={disable}
              disabled={busy}
              className="rounded-lg border border-[var(--danger)]/30 px-3 py-2 text-xs font-semibold text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/10 disabled:opacity-50"
            >
              {busy ? "جارٍ التعطيل…" : "تعطيل 2FA"}
            </button>
          </div>
        ) : step === "idle" ? (
          <button
            onClick={startEnable}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--emerald)] py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]"
          >
            <Lock className="h-4 w-4" /> تفعيل المصادقة الثنائية
          </button>
        ) : step === "secret" ? (
          <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              {/* mock QR */}
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-white p-2">
                <QrCodeArt />
                <QrCode className="absolute h-6 w-6 text-[var(--bg-base)]" />
              </div>
              <div className="flex-1 text-center sm:text-right">
                <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] sm:justify-start">
                  <Smartphone className="h-4 w-4" /> امسح باستخدام تطبيق Authenticator
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  أو أدخل المفتاح يدوياً في تطبيقك:
                </p>
                <button
                  onClick={copySecret}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 font-mono-nums text-xs text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)] sm:justify-start"
                >
                  {secret}
                  {copied ? <Check className="h-3.5 w-3.5 text-[var(--emerald-bright)]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setStep("verify")}
              className="w-full rounded-xl bg-[var(--emerald)] py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]"
            >
              التالي — أدخل الرمز
            </button>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <KeyRound className="h-3.5 w-3.5" /> رمز التحقق المكوّن من 6 أرقام
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] py-2.5 text-center font-mono-nums text-lg tracking-[0.4em] text-[var(--text-primary)] transition-smooth focus:border-[var(--emerald)] focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("secret")}
                className="flex-1 rounded-xl border border-[var(--border-strong)] py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-smooth hover:bg-[var(--surface-2)]"
              >
                رجوع
              </button>
              <button
                onClick={verify}
                disabled={code.length < 6 || busy}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[var(--emerald)] py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ التحقق…</>
                ) : (
                  <>تفعيل الآن</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Decorative faux-QR pattern */
function QrCodeArt() {
  // deterministic block pattern
  const cells = Array.from({ length: 49 }, (_, i) => {
    const x = i % 7;
    const y = Math.floor(i / 7);
    const corner = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4);
    const on = corner || ((x * 7 + y * 3 + 1) % 3 === 0);
    return on;
  });
  return (
    <div className="grid grid-cols-7 gap-px">
      {cells.map((on, i) => (
        <span key={i} className={cn("h-3 w-3 rounded-[1px]", on ? "bg-[var(--bg-base)]" : "bg-white")} />
      ))}
    </div>
  );
}
