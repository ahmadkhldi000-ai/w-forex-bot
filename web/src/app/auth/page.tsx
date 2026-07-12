"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Check,
  AlertTriangle,
  Send,
  Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { GoogleIcon } from "@/components/ui/google-icon";
import { GOOGLE_AUTH_URL } from "@/lib/auth/config";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Kick off Google OAuth — full-page redirect to the backend
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setGoogleError(null);
    window.location.href = `${GOOGLE_AUTH_URL}?mode=${mode}`;
  };

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && !accepted) {
      setShowRiskModal(true);
      return;
    }
    setLoading(true);
    // Simulate auth → redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 900);
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
          className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "var(--gold)" }}
        />
        <div className="grain-overlay absolute inset-0" />
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

          {/* Card */}
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/90 p-8 backdrop-blur-xl">
            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[var(--bg-elevated)] p-1">
              <button
                onClick={() => setMode("register")}
                className={`rounded-lg py-2 text-sm font-medium transition-smooth ${
                  mode === "register"
                    ? "bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                حساب جديد
              </button>
              <button
                onClick={() => setMode("login")}
                className={`rounded-lg py-2 text-sm font-medium transition-smooth ${
                  mode === "login"
                    ? "bg-[var(--bg-base)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                تسجيل الدخول
              </button>
            </div>

            <h1 className="mb-1 text-2xl font-bold text-[var(--text-primary)]">
              {mode === "register"
                ? "أنشئ حسابك المجاني"
                : "مرحباً بعودتك 👋"}
            </h1>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              {mode === "register"
                ? "ابدأ التداول الذكي في أقل من دقيقة"
                : "سجّل دخولك للوصول إلى لوحة التحكم"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <Field
                  icon={User}
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={setName}
                  required
                />
              )}

              <Field
                icon={Mail}
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={setEmail}
                required
              />

              <div className="relative">
                <Field
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Risk consent checkbox — required for register */}
              {mode === "register" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-dim)]/50 p-3.5 transition-smooth hover:border-[var(--danger)]/40">
                  <button
                    type="button"
                    onClick={() => setAccepted(!accepted)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                      accepted
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--border-strong)] bg-transparent"
                    }`}
                  >
                    {accepted && (
                      <Check className="h-3.5 w-3.5 text-[var(--bg-base)]" />
                    )}
                  </button>
                  <span className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                    أقرأت ووافقت على{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowRiskModal(true);
                      }}
                      className="font-semibold text-[var(--danger)] underline decoration-dotted underline-offset-2"
                    >
                      تحذير المخاطر
                    </a>{" "}
                    وأفهم أن التداول ينطوي على خطر فقدان رأس المال. يتم تسجيل وقت
                    موافقتي في سجلات النظام.
                  </span>
                </label>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || (mode === "register" && !accepted)}
              >
                {loading
                  ? "جاري المعالجة..."
                  : mode === "register"
                  ? "إنشاء الحساب"
                  : "تسجيل الدخول"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              <span className="text-xs text-[var(--text-muted)]">أو</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            </div>

            {/* Social auth — Google */}
            {googleError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2.5 text-xs text-[var(--gold-bright)]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {googleError === "access_denied"
                    ? "تم إلغاء تسجيل الدخول عبر جوجل."
                    : googleError === "email_not_verified"
                      ? "لم يتم تأكيد بريدك الإلكتروني في جوجل."
                      : "تعذّر تسجيل الدخول عبر جوجل. حاول مرة أخرى."}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="mt-1 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-soft)] bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>
                {googleLoading
                  ? "جارٍ التحويل إلى جوجل..."
                  : mode === "register"
                    ? "التسجيل باستخدام جوجل"
                    : "تسجيل الدخول عبر جوجل"}
              </span>
            </button>
          </div>

          {/* Join Telegram Community */}
          <a
            href="https://t.me/+iXalBkHABfBkYWQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#229ED9]/30 bg-[#229ED9]/8 py-2.5 text-sm font-semibold text-[#229ED9] transition-smooth hover:bg-[#229ED9]/15"
          >
            <Send className="h-4 w-4" />
            Join Telegram Community
          </a>

          {/* Risk disclaimer */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--gold)]/15 bg-[var(--gold)]/5 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-bright)]" />
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Trading in Forex and financial markets carries high risk and may result in the loss of capital. Past performance does not guarantee future results. W Forex Bot is a technology platform and does not guarantee profits.
            </p>
          </div>
        </div>
      </Container>

      {/* Risk Modal — full disclosure */}
      {showRiskModal && (
        <RiskConsentModal
          accepted={accepted}
          onAccept={() => {
            setAccepted(true);
            setShowRiskModal(false);
          }}
          onClose={() => setShowRiskModal(false)}
        />
      )}
    </main>
  );
}

/* ---------- Reusable input field ---------- */
function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-3 pr-10 pl-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]"
      />
    </div>
  );
}

/* ---------- Risk Consent Modal ---------- */
function RiskConsentModal({
  accepted,
  onAccept,
  onClose,
}: {
  accepted: boolean;
  onAccept: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--danger)]/25 bg-[var(--bg-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--danger-dim)] px-6 py-4 backdrop-blur">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--danger)]/20 text-[var(--danger)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              إقرار المخاطر الكامل
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Full Risk Disclosure · Mandatory Consent
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              التداول في الأسواق المالية (الفوركس، العملات الرقمية، وعقود الفروقات
              CFDs) ينطوي على مخاطر عالية وقد يؤدي إلى فقدان جزء كبير أو كامل من
              رأس المال المستثمر. الأداء السابق للبوت أو المنصة ليس ضماناً
              للنتائج المستقبلية. جميع قرارات التداول هي مسؤولية المستخدم وحده،
              وتعمل المنصة فقط كأداة عرض ونسخ للصفقات ولا تقدم استشارات استثمارية
              مخصصة.
            </p>
          </div>

          <ul className="space-y-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-[12px] leading-relaxed text-[var(--text-muted)]">
            <li>• الرافعة المالية تضخّم الأرباح والخسائر على حدٍ سواء.</li>
            <li>• بين 70% إلى 90% من حسابات التجزئة تخسر أموالها عند تداول CFDs.</li>
            <li>• لا تستثمر أكثر مما يمكنك تحمل خسارته.</li>
            <li>
              • بموافقتك، يتم تسجيل وقت وقبول الإقرار (timestamp) في سجلات النظام
              (Audit Logs).
            </li>
          </ul>

          <div className="flex items-center gap-2 rounded-lg bg-[var(--accent-dim)] px-3 py-2.5 text-[12px] text-[var(--accent-bright)]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            موافقتك تُسجّل بشكل آمن للتدقيق والشفافية.
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
          >
            إغلاق
          </button>
          <button
            onClick={onAccept}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-smooth ${
              accepted
                ? "cursor-default bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                : "bg-[var(--accent)] text-[var(--bg-base)] hover:bg-[var(--accent-bright)]"
            }`}
          >
            {accepted ? "✓ تمت الموافقة" : "أوافق وأقبل المخاطر"}
          </button>
        </div>
      </div>
    </div>
  );
}
