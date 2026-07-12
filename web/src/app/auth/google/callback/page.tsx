"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import {
  setToken,
  setStoredUser,
  decodeJwt,
  type AuthUser,
} from "@/lib/auth/config";

type Status = "processing" | "success" | "error";

function GoogleCallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<Status>("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (ranRef.current) return; // React strict-mode double-invoke guard
    ranRef.current = true;

    const token = params.get("token");
    const firstLogin = params.get("firstLogin") === "1";
    const err = params.get("google_error");

    if (err) {
      setErrorMsg("تعذّر إكمال تسجيل الدخول عبر جوجل.");
      setStatus("error");
      setTimeout(() => {
        router.replace("/auth?google_error=" + err);
      }, 1800);
      return;
    }

    if (!token) {
      setErrorMsg("لم يتم استلام رمز الدخول.");
      setStatus("error");
      setTimeout(() => router.replace("/auth"), 1800);
      return;
    }

    // Decode the JWT to populate the stored user object
    const decoded = decodeJwt<AuthUser & { sub: string }>(token);
    if (!decoded) {
      setErrorMsg("رمز الدخول غير صالح.");
      setStatus("error");
      setTimeout(() => router.replace("/auth"), 1800);
      return;
    }

    setToken(token);
    setStoredUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      riskAccepted: decoded.riskAccepted,
    });

    setStatus("success");

    // Redirect to dashboard (or onboarding for brand-new users)
    const dest = firstLogin ? "/dashboard?welcome=1" : "/dashboard";
    setTimeout(() => router.replace(dest), 900);
  }, [params, router]);

  return <CallbackUI status={status} errorMsg={errorMsg} />;
}

function CallbackUI({
  status,
  errorMsg,
}: {
  status: Status;
  errorMsg: string;
}) {
  return (
    <>
      {status === "processing" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)]">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              جارٍ تسجيل الدخول...
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              نتحقق من حساب جوجل الخاص بك
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/15">
            <CheckCircle2 className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              تم تسجيل الدخول بنجاح!
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              جارٍ تحويلك إلى لوحة التحكم...
            </p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)]/15">
            <XCircle className="h-8 w-8 text-[var(--danger)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              فشل تسجيل الدخول
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{errorMsg}</p>
          </div>
        </>
      )}
    </>
  );
}

export default function GoogleCallbackPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg-base)] px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      </div>

      <Container className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <Logo height={40} priority />
        <Suspense fallback={<CallbackUI status="processing" errorMsg="" />}>
          <GoogleCallbackHandler />
        </Suspense>
      </Container>
    </main>
  );
}
