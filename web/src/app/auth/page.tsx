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
import { LangToggle } from "@/components/marketing/lang-toggle";
import { useI18n } from "@/lib/i18n/provider";
import {
  registerAccount,
  loginAccount,
  setSession,
} from "@/lib/auth/account-store";

type Mode = "login" | "register";

export default function AuthPage() {
  const { lang, dir, t } = useI18n();
  const router = useRouter();
  const a = t.auth;
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
      setError(a.errors.fillFields[lang]);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(a.errors.shortPassword[lang]);
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        if (!riskAccepted) {
          setError(a.errors.mustAcceptRisk[lang]);
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
          // Map backend error → localized message
          setError(
            result.error.includes("مسجّل") || result.error.includes("already")
              ? a.errors.emailRegistered[lang]
              : a.errors.unexpected[lang]
          );
          setLoading(false);
          return;
        }
        setSession(result.account);
      } else {
        const result = await loginAccount(email.trim(), password);
        if (!result.ok) {
          setError(a.errors.invalidCredentials[lang]);
          setLoading(false);
          return;
        }
        setSession(result.account);
      }
      // → straight to the dashboard
      router.push("/dashboard");
    } catch {
      setError(a.errors.unexpected[lang]);
      setLoading(false);
    }
  };

  return (
    <main
      dir={dir}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-12"
    >
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

      {/* Language toggle — top corner */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LangToggle variant="solid" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className={lang === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
            {a.backHome[lang]}
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
                {a.registerTab[lang]}
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
                {a.loginTab[lang]}
              </button>
            </div>

            <h1 className="mb-1 text-center text-2xl font-bold text-[var(--text-primary)]">
              {mode === "register" ? a.registerTitle[lang] : a.loginTitle[lang]}
            </h1>
            <p className="mb-6 text-center text-sm text-[var(--text-muted)]">
              {mode === "register"
                ? a.registerSubtitle[lang]
                : a.loginSubtitle[lang]}
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
                    {a.nameLabel[lang]}
                  </label>
                  <div className="relative">
                    <User
                      className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)] ${
                        dir === "rtl" ? "right-3" : "left-3"
                      }`}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={a.namePlaceholder[lang]}
                      className={`w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 ${
                        dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  {a.emailLabel[lang]}
                </label>
                <div className="relative">
                  <Mail
                    className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)] ${
                      dir === "rtl" ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={a.emailPlaceholder[lang]}
                    dir="ltr"
                    className={`w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 ${
                      dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  {a.passwordLabel[lang]}
                </label>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)] ${
                      dir === "rtl" ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]/60 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-dim)] outline-none transition-smooth focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 ${
                      dir === "rtl" ? "pr-10 pl-10" : "pl-10 pr-10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition-smooth hover:text-[var(--text-muted)] ${
                      dir === "rtl" ? "left-3" : "right-3"
                    }`}
                    aria-label={showPassword ? a.hidePassword[lang] : a.showPassword[lang]}
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
                    {a.passwordHint[lang]}
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
                    {a.riskAccept[lang]}
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
                    {a.processing[lang]}
                  </>
                ) : (
                  <>{mode === "register" ? a.registerBtn[lang] : a.loginBtn[lang]}</>
                )}
              </button>
            </form>

            {/* Switch mode link */}
            <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
              {mode === "register" ? (
                <>
                  {a.haveAccount[lang]}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    {a.switchLogin[lang]}
                  </button>
                </>
              ) : (
                <>
                  {a.noAccount[lang]}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    {a.switchRegister[lang]}
                  </button>
                </>
              )}
            </p>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--text-dim)]">
              {a.termsNote[lang]}
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
            {a.joinTelegram[lang]}
          </a>

          {/* Risk disclosure */}
          <div className="mt-6 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)]/40 p-4">
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              {a.riskDisclosure[lang]}
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
