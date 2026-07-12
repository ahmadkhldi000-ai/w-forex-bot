"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import {
  upsertGoogleAccount,
  linkEmailAndPassword,
  setSession,
  type StoredAccount,
} from "@/lib/auth/account-store";
import type { GoogleProfile } from "@/lib/auth/google-gsi";

export default function LinkAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  // Read the Google profile saved by the auth page after sign-in
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wfb_pending_google");
      if (!raw) {
        router.replace("/auth");
        return;
      }
      setProfile(JSON.parse(raw) as GoogleProfile);
    } catch {
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!accepted) {
      setShowRiskModal(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1) Ensure the Google account exists in our local store
      const { account } = upsertGoogleAccount(profile);
      // 2) Link the email + password to it
      const result = await linkEmailAndPassword(
        profile.email,
        password,
        accepted
      );
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      // 3) Create the session and clean up the pending flag
      setSession(result.account);
      sessionStorage.removeItem("wfb_pending_google");
      router.push("/dashboard?welcome=1");
    } catch {
      setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setSubmitting(false);
    }
  };

  // Option to skip linking and continue with Google only
  const handleSkip = () => {
    if (!profile) return;
    if (!accepted) {
      setShowRiskModal(true);
      return;
    }
    const { account } = upsertGoogleAccount(profile);
    const updated: StoredAccount = {
      ...account,
      riskAccepted: true,
      riskAcceptedAt: new Date().toISOString(),
    };
    setSession(updated);
    sessionStorage.removeItem("wfb_pending_google");
    router.push("/dashboard?welcome=1");
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-[var(--bg-base)] py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-[var(--accent)]/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--gold)]/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-md">
          <Link
            href="/auth"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Link>

          <div className="mb-8">
            <Logo height={44} priority />
          </div>

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/90 p-8 backdrop-blur-xl">
            {/* Google success banner */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/8 p-4">
              {profile?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.picture}
                  alt={profile.name}
                  className="h-11 w-11 rounded-full ring-2 ring-[var(--accent)]/30"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]/20">
                  <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  تم ربط حساب جوجل
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {profile?.email}
                </p>
              </div>
            </div>

            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              إكمال إنشاء الحساب
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              عظيم! تم تأكيد حسابك عبر جوجل بحساب{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {profile?.email}
              </span>
              . لتتمكن من تسجيل الدخول أيضاً بالبريد وكلمة المرور، أنشئ كلمة مرور
              لحسابك.
            </p>

            <form onSubmit={handleLink} className="mt-6 space-y-4">
              {/* Email (read-only, from Google) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-3 text-sm text-[var(--text-muted)]">
                  <Mail className="me-2 h-4 w-4" />
                  {profile?.email}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-3 ps-10 pe-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-1/2 end-3 -translate-y-1/2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? "إخفاء" : "إظهار"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-3 ps-10 pe-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]"
                  />
                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <Check className="absolute top-1/2 end-3 h-4 w-4 -translate-y-1/2 text-[var(--accent)]" />
                  )}
                </div>
              </div>

              {/* Risk consent */}
              <button
                type="button"
                onClick={() => setAccepted((a) => !a)}
                className="flex w-full items-start gap-2.5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]/50 p-3 text-start transition-smooth hover:border-[var(--border-strong)]"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-smooth ${
                    accepted
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-[var(--border-strong)]"
                  }`}
                >
                  {accepted && (
                    <Check className="h-3.5 w-3.5 text-[var(--bg-base)]" strokeWidth={3} />
                  )}
                </div>
                <span className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  أوافق على{" "}
                  <span className="font-semibold text-[var(--gold-bright)]">
                    تحذير المخاطر
                  </span>{" "}
                  وأقرّ بأن التداول في الفوركس يحمل خطراً عالياً وقد يؤدي إلى خسارة
                  رأس المال.
                </span>
              </button>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2.5 text-xs text-[var(--danger)]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] py-3 text-sm font-semibold text-[var(--bg-base)] shadow-lg shadow-[var(--accent)]/20 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    ربط الحساب وإكمال التسجيل
                  </>
                )}
              </button>
            </form>

            {/* Skip option */}
            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-xs text-[var(--text-muted)] underline-offset-4 transition-smooth hover:text-[var(--text-secondary)] hover:underline"
              >
                المتابعة بحساب جوجل فقط (بدون كلمة مرور)
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
            بياناتك محفوظة بأمان على جهازك. لن يتم مشاركة معلوماتك مع أي طرف ثالث.
          </p>
        </div>
      </Container>

      {/* Risk modal */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--gold)]/30 bg-[var(--bg-surface)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)]/15">
                <AlertTriangle className="h-5 w-5 text-[var(--gold-bright)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                تحذير المخاطر
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              التداول في الفوركس والأسواق المالية يحمل مستوى عالٍ من المخاطر وقد
              يؤدي إلى خسارة كامل رأس المال. الأداء السابق لا يضمن النتائج
              المستقبلية. يجب عليك ألا تستثمر أموالاً لا يمكنك تحمّل خسارتها.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRiskModal(false)}
                className="flex-1 rounded-xl border border-[var(--border-strong)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-elevated)]"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setAccepted(true);
                  setShowRiskModal(false);
                }}
                className="flex-1 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--bg-base)] transition-smooth hover:bg-[var(--accent-bright)]"
              >
                أوافق وأتابع
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
