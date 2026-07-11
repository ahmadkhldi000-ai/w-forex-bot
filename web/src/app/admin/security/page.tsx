"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
  Loader2,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { TwoFactorCard } from "@/components/admin/two-factor-card";
import { useMt5Store } from "@/lib/admin/use-mt5-store";

export default function AdminSecurityPage() {
  const store = useMt5Store();
  const [twoFA, setTwoFA] = useState(false);

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFA(enabled);
    store.log2FA(enabled);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="الأمان" />
        <main className="p-8">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--emerald)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                أمان حساب الإدارة
              </h2>
              <span
                className={
                  twoFA
                    ? "inline-flex items-center gap-1 rounded-full border border-[var(--emerald)]/20 bg-[var(--emerald)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--emerald-bright)]"
                    : "inline-flex items-center gap-1 rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--danger)]"
                }
              >
                <ShieldCheck className="h-3 w-3" /> {twoFA ? "محمي" : "معرّض"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              إعدادات حماية حساب الإدارة والوصول الحسّاس
            </p>

            <div className="mt-6 space-y-4">
              {/* 2FA */}
              <TwoFactorCard enabled={twoFA} onToggle={handleToggle2FA} />

              {/* Password */}
              <PasswordCard />

              {/* Active sessions */}
              <SessionsCard onLogoutAll={() => store.logLogout()} />

              {/* Login history */}
              <LoginHistoryCard />

              {/* Security alerts */}
              <AlertsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Password Change ---------- */
function PasswordCard() {
  const [show, setShow] = useState(false);
  const [old, setOld] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const strength = scorePassword(next);

  const submit = async () => {
    setMsg(null);
    if (next.length < 8) {
      setMsg({ type: "err", text: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      return;
    }
    if (next !== confirm) {
      setMsg({ type: "err", text: "كلمتا المرور غير متطابقتين" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setMsg({ type: "ok", text: "تم تغيير كلمة المرور بنجاح" });
    setOld(""); setNext(""); setConfirm("");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <Section icon={<Lock className="h-4 w-4" />} title="تغيير كلمة المرور">
      <div className="space-y-3">
        <div>
          <Label text="كلمة المرور الحالية" />
          <PasswordInput value={old} onChange={setOld} show={show} setShow={setShow} placeholder="••••••••" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label text="كلمة المرور الجديدة" />
            <PasswordInput value={next} onChange={setNext} show={show} setShow={setShow} placeholder="••••••••" />
            {next.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-smooth ${
                        i < strength.score
                          ? strength.score <= 1
                            ? "bg-[var(--danger)]"
                            : strength.score <= 2
                            ? "bg-[var(--gold)]"
                            : "bg-[var(--emerald)]"
                          : "bg-[var(--surface-2)]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">{strength.label}</span>
              </div>
            )}
          </div>
          <div>
            <Label text="تأكيد كلمة المرور" />
            <PasswordInput value={confirm} onChange={setConfirm} show={show} setShow={setShow} placeholder="••••••••" />
          </div>
        </div>

        {msg && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              msg.type === "ok"
                ? "bg-[var(--emerald)]/10 text-[var(--emerald-bright)]"
                : "bg-[var(--danger)]/10 text-[var(--danger)]"
            }`}
          >
            {msg.type === "ok" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={saving || !old || !next || !confirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)] disabled:opacity-40"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            تحديث كلمة المرور
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Sessions ---------- */
function SessionsCard({ onLogoutAll }: { onLogoutAll: () => void }) {
  const sessions = [
    {
      device: "macOS · Chrome",
      icon: Monitor,
      location: "Amman, Jordan",
      ip: "188.71.224.xx",
      current: true,
      lastActive: "الآن",
    },
    {
      device: "iOS · Safari",
      icon: Smartphone,
      location: "Amman, Jordan",
      ip: "188.71.224.xx",
      current: false,
      lastActive: "قبل ساعتين",
    },
    {
      device: "Windows · Edge",
      icon: Monitor,
      location: "Dubai, UAE",
      ip: "94.205.33.xx",
      current: false,
      lastActive: "قبل 3 أيام",
    },
  ];

  return (
    <Section icon={<Globe className="h-4 w-4" />} title="الجلسات النشطة">
      <div className="space-y-2.5">
        {sessions.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)]/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]">
                  <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{s.device}</p>
                    {s.current && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald)]/12 px-1.5 py-0.5 text-[10px] font-bold text-[var(--emerald-bright)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" />
                        الحالي
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono-nums text-[11px] text-[var(--text-muted)]">
                    <Globe className="h-3 w-3" /> {s.location} · {s.ip} · {s.lastActive}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button className="rounded-lg border border-[var(--border-subtle)] p-2 text-[var(--text-muted)] transition-smooth hover:border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={onLogoutAll}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-2 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/15"
      >
        <LogOut className="h-4 w-4" />
        تسجيل خروج من جميع الأجهزة
      </button>
    </Section>
  );
}

/* ---------- Login History ---------- */
function LoginHistoryCard() {
  const events = [
    { time: "قبل دقيقة", action: "تسجيل دخول ناجح", ip: "188.71.224.xx", ok: true, device: "macOS · Chrome" },
    { time: "قبل ساعتين", action: "تسجيل خروج", ip: "188.71.224.xx", ok: true, device: "iOS · Safari" },
    { time: "قبل 5 ساعات", action: "محاولة دخول فاشلة", ip: "45.146.165.xx", ok: false, device: "Unknown · Tor" },
    { time: "قبل يوم", action: "تسجيل دخول ناجح (2FA)", ip: "188.71.224.xx", ok: true, device: "macOS · Chrome" },
    { time: "قبل 3 أيام", action: "تسجيل دخول ناجح", ip: "94.205.33.xx", ok: true, device: "Windows · Edge" },
  ];

  return (
    <Section icon={<Clock className="h-4 w-4" />} title="سجل تسجيل الدخول">
      <div className="space-y-1">
        {events.map((e, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg px-3 py-2 transition-smooth hover:bg-[var(--surface-2)]/40"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  e.ok ? "bg-[var(--emerald)]/12 text-[var(--emerald-bright)]" : "bg-[var(--danger)]/12 text-[var(--danger)]"
                }`}
              >
                {e.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-sm text-[var(--text-primary)]">{e.action}</p>
                <p className="font-mono-nums text-[10px] text-[var(--text-muted)]">
                  {e.ip} · {e.device}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">{e.time}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Alerts ---------- */
function AlertsCard() {
  const [alerts, setAlerts] = useState({
    newDevice: true,
    failedAttempts: true,
    weeklySummary: false,
  });

  return (
    <Section icon={<AlertTriangle className="h-4 w-4" />} title="تنبيهات الأمان">
      <div className="space-y-2">
        <ToggleRow
          icon={<Smartphone className="h-3.5 w-3.5" />}
          label="بريد إلكتروني عند تسجيل دخول من جهاز جديد"
          on={alerts.newDevice}
          onToggle={() => setAlerts((a) => ({ ...a, newDevice: !a.newDevice }))}
        />
        <ToggleRow
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="تنبيه فوري عند محاولة دخول فاشلة"
          on={alerts.failedAttempts}
          onToggle={() => setAlerts((a) => ({ ...a, failedAttempts: !a.failedAttempts }))}
        />
        <ToggleRow
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          label="إشعار أسبوعي بملخّص النشاط"
          on={alerts.weeklySummary}
          onToggle={() => setAlerts((a) => ({ ...a, weeklySummary: !a.weeklySummary }))}
        />
      </div>
    </Section>
  );
}

/* ---------- Shared ---------- */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-secondary)]">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Label({ text }: { text: string }) {
  return <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">{text}</label>;
}

function PasswordInput({
  value,
  onChange,
  show,
  setShow,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-base)]/60 px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)]"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-smooth hover:text-[var(--text-primary)]"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  on,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-right transition-smooth hover:bg-[var(--surface-2)]/40"
    >
      <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        {icon}
        {label}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-smooth ${
          on ? "bg-[var(--emerald)]" : "bg-[var(--surface-2)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-smooth ${
            on ? "left-0.5" : "right-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ---------- Password strength ---------- */
function scorePassword(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const labels = ["ضعيفة جداً", "ضعيفة", "متوسطة", "جيدة", "قوية"];
  return { score, label: labels[score] };
}
