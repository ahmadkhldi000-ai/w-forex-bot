"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Send,
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import {
  registerAccount,
  loginAccount,
  setSession,
} from "@/lib/auth/account-store";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  //  Email + Password auth (works instantly, no external setup).
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        if (!riskAccepted) {
          setError("يجب الموافقة على إقرار المخاطر للمتابعة");
          setLoading(false);
          return;
        }
        const result = await registerAccount({
          email: email.trim(),
          password,
          name: name.trim() || undefined,
          riskAccepted,
        });
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        setSession(result.account);
      } else {
        const result = await loginAccount(email.trim(), password);
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        setSession(result.account);
      }
      // → straight to the dashboard
      router.push("/dashboard");
    } catch {
      setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-12">
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
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للرئيسية
          </Link>

          {/* Card */}
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/90 p-8 backdrop-blur-xl">
            <div className="mb-6 flex flex-col items-center">
              <Logo height={40} priority />
            </div>

            {/* Mode toggle */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-smooth ${
                  mode === "register"
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                حساب جديد
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-smooth ${
                  mode === "login"
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                تسجيل الدخول
              </button>
            </div>

            <h1 className="mb-1 text-center text-2xl font-bold text-[var(--text-primary)]">
              {mode === "register" ? "أنشئ حسابك المجاني" : "أهلاً بعودتك 👋"}
            </h1>
            <p className="mb-6 text-center text-sm text-[var(--text-muted)]">
              {mode === "register"
                ? "ابدأ التداول الذكي خلال أقل من دقيقة"
                : "سجّل دخولك للوصول إلى لوحة التحكم"}
            </p>

            {/* Form error */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email + Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                    الاسم (اختياري)
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك الكامل"
                      className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 pr-10 pl-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 pr-10 pl-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 pr-10 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition-smooth hover:text-[var(--text-muted)]"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                    8 أحرف على الأقل
                  </p>
                )}
              </div>

              {/* Risk acceptance (register only) */}
              {mode === "register" && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/40 px-3 py-3 transition-smooth hover:border-[var(--accent)]/30">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={riskAccepted}
                    onClick={() => setRiskAccepted((v) => !v)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-smooth ${
                      riskAccepted
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--border-soft)] bg-transparent"
                    }`}
                  >
                    {riskAccepted && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                  <span className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                    أُقرّ بأن التداول في الفوركس ينطوي على خطر كبير، وأنني أتحمّل
                    كامل المسؤولية عن قراراتي الاستثمارية.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition-smooth hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ المعالجة...
                  </>
                ) : (
                  <>{mode === "register" ? "إنشاء الحساب" : "تسجيل الدخول"}</>
                )}
              </button>
            </form>

            {/* Switch mode link */}
            <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
              {mode === "register" ? (
                <>
                  لديك حساب بالفعل؟{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    سجّل الدخول
                  </button>
                </>
              ) : (
                <>
                  ليس لديك حساب؟{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    أنشئ حساباً مجانياً
                  </button>
                </>
              )}
            </p>

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

          {/* Risk disclosure */}
          <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/40 p-4">
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
