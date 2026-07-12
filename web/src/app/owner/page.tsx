"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Fingerprint,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  isOwnerUnlocked,
  unlockOwner,
  getOwnerSession,
  OWNER_PASSCODE,
} from "@/lib/owner/master-store";

/**
 * Hidden Owner Gate — /owner
 * ----------------------------------
 * A secret, unlinked page that ONLY the platform owner can reach.
 * Regular users and admins never see this route in any navigation.
 *
 * The owner enters a private passcode to unlock the master account
 * console (/owner/master) where the real MT5 master credentials live.
 *
 * To reach it: navigate manually to /owner
 */
export default function OwnerGatePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-unlock and go straight to the master console (direct access).
    unlockOwner(OWNER_PASSCODE);
    router.replace("/owner/master");
  }, [router]);

  // Auto-expiry watcher
  useEffect(() => {
    const t = setInterval(() => {
      if (!getOwnerSession()) setUnlocked(false);
    }, 15000);
    return () => clearInterval(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lockedOut) return;
    setError(null);
    setLoading(true);

    // Simulate auth latency
    setTimeout(() => {
      setLoading(false);
      const ok = unlockOwner(passcode.trim());
      if (ok) {
        setUnlocked(true);
        setPasscode("");
        setTimeout(() => router.replace("/owner/master"), 400);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) {
          setLockedOut(true);
          setError(
            "تم تجاوز عدد المحاولات المسموح. تم قفل البوابة مؤقتاً."
          );
        } else {
          setError(
            `رمز الدخول غير صحيح. المحاولات المتبقية: ${5 - next}`
          );
        }
      }
    }, 650);
  }

  if (!mounted) return null;

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-12">
      {/* Ambient owner-grade background: deep gold/emerald aura */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--gold)]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-[var(--emerald)]/6 blur-[110px]" />
        <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-[var(--gold-deep)]/5 blur-[90px]" />
      </div>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Status badge */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-bright)]">
            <Lock className="h-3 w-3" />
            <span>Owner Vault</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-[var(--gold)]/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/15 to-[var(--gold-deep)]/10">
                <Fingerprint className="h-8 w-8 text-[var(--gold-bright)]" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Logo height={28} priority />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
              بوابة المالك
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              منطقة محمية خاصّة بمالك المنصّة فقط. أدخل رمز الدخول السريّ
              للوصول إلى حساب الماستر الخاص بـ MT5.
            </p>
          </div>

          {/* Unlocked confirmation */}
          {unlocked ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-[var(--emerald)]/25 bg-[var(--emerald)]/8 py-8 text-center">
              <ShieldCheck className="h-10 w-10 text-[var(--emerald-bright)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                تم التحقّق. جارٍ الدخول إلى وحدة التحكم...
              </p>
              <Loader2 className="h-4 w-4 animate-spin text-[var(--emerald)]" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* Passcode field */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  رمز الدخول السريّ
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showCode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    disabled={lockedOut}
                    autoFocus
                    autoComplete="off"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-3 pr-10 pl-10 text-center font-mono-nums tracking-[0.2em] text-sm text-[var(--text-primary)] placeholder:tracking-[0.2em] placeholder:text-[var(--text-dim)] transition-smooth focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20 disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-secondary)]"
                    aria-label={showCode ? "إخفاء الرمز" : "إظهار الرمز"}
                  >
                    {showCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/8 px-3 py-2.5 text-xs text-[var(--danger)]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || lockedOut || passcode.length < 4}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-deep)] py-3 text-sm font-bold text-[var(--bg-base)] transition-smooth hover:shadow-[0_8px_30px_-8px_var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                {loading ? "جارٍ التحقّق..." : "فتح الخزنة"}
              </button>

              {lockedOut && (
                <button
                  type="button"
                  onClick={() => {
                    setLockedOut(false);
                    setAttempts(0);
                    setError(null);
                  }}
                  className="w-full text-center text-xs text-[var(--text-muted)] underline transition-smooth hover:text-[var(--text-secondary)]"
                >
                  إعادة المحاولة
                </button>
              )}
            </form>
          )}

          {/* Footer warning */}
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)]/50 px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
            <p className="text-[11px] leading-snug text-[var(--text-muted)]">
              هذه المنطقة مخصّصة للاستخدام الخاصّ بمالك المنصّة فقط. أي
              محاولة وصول غير مصرّح بها يتمّ تسجيلها.
            </p>
          </div>
        </div>

        {/* Back to safety */}
        <div className="mt-5 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-[var(--text-dim)] transition-smooth hover:text-[var(--text-muted)]"
          >
            ← العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    </main>
  );
}
