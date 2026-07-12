"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock: simulate step transition
    setTimeout(() => {
      setLoading(false);
      if (step === 1) setStep(2);
      else router.push("/admin");
    }, 800);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-12">
      {/* Gold-tinted background to differentiate from user auth */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full opacity-[0.10] blur-[140px]"
          style={{ background: "var(--gold)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: "var(--accent)" }}
        />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للموقع
          </Link>

          {/* Logo — gold accent for admin */}
          <div className="mb-8 flex items-center gap-2.5">
            <Logo height={44} priority />
            <span className="ml-1 rounded-md bg-[var(--gold-dim)] bg-[var(--gold)]/15 px-1.5 py-0.5 text-xs font-bold text-[var(--gold-bright)]">
              ADMIN
            </span>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 1
                  ? "bg-[var(--gold)] text-[var(--bg-base)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              }`}
            >
              1
            </div>
            <div
              className={`h-px flex-1 ${
                step >= 2 ? "bg-[var(--gold)]" : "bg-[var(--border-subtle)]"
              }`}
            />
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= 2
                  ? "bg-[var(--gold)] text-[var(--bg-base)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              }`}
            >
              2
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--bg-surface)]/90 p-8 backdrop-blur-xl">
            <h1 className="mb-1 text-2xl font-bold text-[var(--text-primary)]">
              {step === 1 ? "لوحة الإدارة" : "التحقق الثنائي (2FA)"}
            </h1>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              {step === 1
                ? "منطقة محمية — للمصرّح لهم فقط"
                : "أدخل الرمز من تطبيق المصادقة"}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {step === 1 && (
                <>
                  <Field
                    icon={Mail}
                    type="email"
                    placeholder="البريد الإلكتروني للإدارة"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gold)]/10">
                      <KeyRound className="h-8 w-8 text-[var(--gold)]" />
                    </div>
                  </div>
                  <Field
                    icon={KeyRound}
                    type="text"
                    placeholder="000000"
                    value={totp}
                    onChange={setTotp}
                    required
                    maxLength={6}
                  />
                  <p className="text-center text-xs text-[var(--text-muted)]">
                    أدخل الرمز المكوّن من 6 أرقام من Google Authenticator
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-bright)] py-3 text-sm font-semibold text-[var(--bg-base)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(245,177,78,0.6)] disabled:opacity-50"
              >
                {loading ? (
                  "جاري التحقق..."
                ) : step === 1 ? (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    متابعة
                  </>
                ) : (
                  "دخول لوحة الإدارة"
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[11px] text-[var(--text-muted)]">
            🔒 جميع محاولات الدخول مسجّلة. يُسمح بـ 5 محاولات فقط قبل القفل
            لمدة 30 دقيقة.
          </p>
        </div>
      </Container>
    </main>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  maxLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-3 pr-10 pl-3 text-center tracking-[0.3em] text-sm text-[var(--text-primary)] placeholder:tracking-normal placeholder:text-[var(--text-muted)] transition-smooth focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20"
      />
    </div>
  );
}
