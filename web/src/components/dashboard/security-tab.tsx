"use client";

import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  Monitor,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { TwoFactorCard } from "@/components/admin/two-factor-card";
import { cn } from "@/lib/utils";

interface Props {
  twoFAEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
  lastLogin?: string;
}

export function SecurityTab({ twoFAEnabled, onToggle2FA, lastLogin }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">الأمان</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          حماية حساب المدير والتحكم في الوصول
        </p>
      </div>

      {/* Security score banner */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-2xl border p-5",
          twoFAEnabled
            ? "border-[var(--accent)]/25 bg-[var(--accent-dim)]"
            : "border-[var(--danger)]/25 bg-[var(--danger-dim)]",
        )}
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            twoFAEnabled
              ? "bg-[var(--accent)]/20 text-[var(--accent-bright)]"
              : "bg-[var(--danger)]/20 text-[var(--danger)]",
          )}
        >
          {twoFAEnabled ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </span>
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-bold",
              twoFAEnabled ? "text-[var(--accent-bright)]" : "text-[var(--danger)]",
            )}
          >
            {twoFAEnabled ? "مستوى الحماية: عالٍ" : "مستوى الحماية: منخفض"}
          </p>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {twoFAEnabled
              ? "المصادقة الثنائية مُفعّلة. حسابك محمي بطبقة إضافية."
              : "ننصح بشدّة بتفعيل المصادقة الثنائية لتأمين حساب المدير."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2FA card (takes 2 cols) */}
        <div className="lg:col-span-2">
          <TwoFactorCard enabled={twoFAEnabled} onToggle={onToggle2FA} />
        </div>

        {/* Security info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Monitor className="h-4 w-4 text-[var(--text-muted)]" />
              الجلسة الحالية
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <Row icon={KeyRound} label="المعرّف" value="admin@wforexbot.com" />
              <Row icon={Smartphone} label="الجهاز" value="macOS · Chrome" />
              <Row icon={ShieldCheck} label="2FA" value={twoFAEnabled ? "مُفعّل" : "معطّل"} />
              <Row icon={Clock} label="آخر دخول" value={lastLogin || "منذ قليل"} />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/[0.06] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--gold-bright)]">
              <Lock className="h-4 w-4" />
              نصائح الأمان
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              <li className="flex gap-2">
                <span className="text-[var(--gold-bright)]">•</span>
                استخدم كلمة مرور قوية وفريدة للمدير
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--gold-bright)]">•</span>
                فعّل المصادقة الثنائية على جهاز موثوق
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--gold-bright)]">•</span>
                راجع سجلّ النشاط دورياً للكشف عن أي دخول غير مصرّح
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--gold-bright)]">•</span>
                سجّل الخروج دائماً من الأجهزة العامة
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof KeyRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[var(--text-muted)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="truncate font-mono-nums text-xs font-medium text-[var(--text-secondary)]">
        {value}
      </span>
    </div>
  );
}
