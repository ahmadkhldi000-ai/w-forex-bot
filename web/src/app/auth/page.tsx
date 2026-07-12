"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Send, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { GoogleIcon } from "@/components/ui/google-icon";
import {
  isGoogleConfigured,
  loadGoogleScript,
  decodeGoogleCredential,
  getGoogleClientId,
} from "@/lib/auth/google-gsi";
import { upsertGoogleAccount, setSession } from "@/lib/auth/account-store";

export default function AuthPage() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Surface errors returned from the Google OAuth callback (?google_error=...)
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const gerr = params.get("google_error");
      if (gerr) {
        setGoogleError(gerr);
        // Clean the URL so the error doesn't persist on refresh
        params.delete("google_error");
        const clean = params.toString()
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, "", clean);
      }
    }
  }, []);

  // ============================================================
  //  Google Sign-In — the only way in.
  //  Flow: click "Continue with Google" → Google account chooser
  //  appears → user picks an email → we register/sign-in them
  //  AUTOMATICALLY and jump straight to the dashboard.
  // ============================================================
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGoogleError(null);

    // Fallback when Google OAuth isn't configured: let the user type
    // their email manually so they can still proceed.
    if (!isGoogleConfigured()) {
      setGoogleLoading(false);
      setGoogleError("not_configured");
      return;
    }

    try {
      await loadGoogleScript();
      window.google!.accounts.id.initialize({
        client_id: getGoogleClientId(),
        callback: (response) => {
          const profile = decodeGoogleCredential(response.credential);
          if (!profile || !profile.email_verified) {
            setGoogleLoading(false);
            setGoogleError("email_not_verified");
            return;
          }
          // ✅ AUTO-REGISTER: create or update the account from the
          // Google profile and start a session immediately.
          const { account } = upsertGoogleAccount(profile);
          setSession(account);
          // → straight to the dashboard
          router.push("/dashboard");
        },
        cancel_on_tap_outside: true,
      });
      // Surface the Google account chooser (One Tap)
      window.google!.accounts.id.prompt();
    } catch {
      setGoogleLoading(false);
      setGoogleError("script_error");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-12">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full opacity-[0.10] blur-[140px]"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[460px] w-[460px] rounded-full opacity-[0.08] blur-[130px]"
          style={{ background: "var(--gold)" }}
        />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للرئيسية
          </Link>

          {/* Logo */}
          <div className="mb-8">
            <Logo height={44} priority />
          </div>

          {/* Card — Google only */}
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/90 p-8 backdrop-blur-xl">
            <h1 className="mb-1 text-center text-2xl font-bold text-[var(--text-primary)]">
              تابع مع جوجل
            </h1>
            <p className="mb-7 text-center text-sm text-[var(--text-muted)]">
              سجّل الدخول أو أنشئ حسابك في ثوانٍ — بإيميل جوجل فقط
            </p>

            {/* Google error */}
            {googleError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2.5 text-xs text-[var(--gold-bright)]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {googleError === "not_configured"
                    ? "تسجيل الدخول عبر جوجل غير مُفعّل حالياً. يرجى المحاولة لاحقاً."
                    : googleError === "email_not_verified"
                      ? "لم يتم تأكيد بريدك الإلكتروني في جوجل."
                      : googleError === "script_error"
                        ? "تعذّر تحميل خدمة جوجل. تحقق من اتصالك وحاول مرة أخرى."
                        : "تعذّر تسجيل الدخول عبر جوجل. حاول مرة أخرى."}
                </span>
              </div>
            )}

            {/* Primary CTA — Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-soft)] bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>
                {googleLoading
                  ? "جارٍ التحويل إلى جوجل..."
                  : "المتابعة باستخدام جوجل"}
              </span>
            </button>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--text-dim)]">
              بالمتابعة، فأنت توافق على شروط الاستخدام وتقرّ بأن التداول
              ينطوي على خطر فقدان رأس المال.
            </p>
          </div>

          {/* Join Telegram Community */}
          <a
            href="https://t.me/+iXalBkHABfBkYWQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#229ED9]/30 bg-[#229ED9]/8 py-2.5 text-sm font-semibold text-[#229ED9] transition-smooth hover:bg-[#229ED9]/15"
          >
            <Send className="h-4 w-4" />
            انضمّ إلى مجتمع تيليجرام
          </a>

          {/* Risk disclaimer */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--gold)]/15 bg-[var(--gold)]/5 p-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold-bright)]" />
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              التداول في سوق الفوركس والأسواق المالية يحمل مخاطر عالية وقد
              يؤدي إلى فقدان جزء كبير أو كامل من رأس المال المستثمر. الأداء
              السابق للبوت أو المنصة ليس ضماناً للنتائج المستقبلية. W Forex
              Bot منصّة تقنية ولا تضمن الأرباح.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
