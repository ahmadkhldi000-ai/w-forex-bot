"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  CreditCard,
  Mail,
  KeyRound,
  Check,
  Save,
  Server,
  Percent,
  Webhook,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type Tab = "general" | "features" | "notifications" | "api";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "عام", icon: Settings },
  { id: "features", label: "الميزات", icon: ShieldCheck },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "api", label: "API & ويبهوك", icon: Webhook },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="إعدادات النظام" />
        <main className="p-8">
          <div className="mx-auto max-w-3xl">
            {/* tab nav */}
            <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-smooth ${
                      tab === t.id
                        ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {tab === "general" && <GeneralTab />}
            {tab === "features" && <FeaturesTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "api" && <ApiTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  desc,
  icon: Icon,
  children,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60">
          <Icon className="h-5 w-5 text-[var(--emerald)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

function Input({ id, defaultValue, placeholder, type = "text" }: { id: string; defaultValue?: string; placeholder?: string; type?: string }) {
  return (
    <input
      id={id}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/20"
    />
  );
}

function Select({ id, options, defaultOpt }: { id: string; options: string[]; defaultOpt: string }) {
  return (
    <select
      id={id}
      defaultValue={defaultOpt}
      className="w-full appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-smooth focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/20"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[var(--surface-2)]">
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-smooth ${on ? "bg-[var(--emerald)]" : "bg-[var(--bg-elevated)]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-smooth ${on && "translate-x-5"}`} />
    </button>
  );
}

function SaveBar() {
  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <button className="rounded-xl border border-[var(--border-subtle)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-smooth hover:bg-[var(--bg-hover)]">
        إلغاء
      </button>
      <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]">
        <Save className="h-4 w-4" />
        حفظ التغييرات
      </button>
    </div>
  );
}

/* ---------- General ---------- */
function GeneralTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="معلومات المنصة" desc="الإعدادات العامة للمنصة" icon={Globe}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="اسم المنصة" htmlFor="platform-name">
            <Input id="platform-name" defaultValue="W Forex Bot" />
          </Field>
          <Field label="البريد الرسمي" htmlFor="platform-email">
            <Input id="platform-email" type="email" defaultValue="support@wforexbot.com" />
          </Field>
          <Field label="العملة الأساسية" htmlFor="currency">
            <Select id="currency" options={["USD", "EUR", "GBP", "AED"]} defaultOpt="USD" />
          </Field>
          <Field label="المنطقة الزمنية" htmlFor="tz">
            <Select id="tz" options={["UTC", "GMT+3 (Asia/Amman)", "GMT+4 (Dubai)", "GMT+0 (London)"]} defaultOpt="GMT+3 (Asia/Amman)" />
          </Field>
        </div>
        <SaveBar />
      </SectionCard>

      <SectionCard title="إعدادات التسجيل" desc="تحكم في تسجيل المستخدمين الجدد" icon={KeyRound}>
        <div className="space-y-3">
          <ToggleRow title="السماح بالتسجيل الجديد" desc="تمكين تسجيل حسابات جديدة" defaultOn />
          <ToggleRow title="التحقق من البريد الإلكتروني" desc="إرسال رابط تأكيد بعد التسجيل" defaultOn />
          <ToggleRow title="الموافقة اليدوية" desc="مراجعة كل حساب جديد قبل التفعيل" />
          <ToggleRow title="قفل التسجيل" desc="منع إنشاء حسابات جديدة مؤقتاً" />
        </div>
      </SectionCard>
    </div>
  );
}

/* ---------- Features ---------- */
function FeaturesTab() {
  return (
    <SectionCard title="ميزات المنصة" desc="تفعيل أو تعطيل ميزات المنصة" icon={ShieldCheck}>
      <div className="space-y-3">
        <ToggleRow title="التداول الآلي" desc="السماح بتشغيل بوتات التداول" defaultOn icon={Server} />
        <ToggleRow title="نسخ الصفقات (Copy Trading)" desc="متابعة حسابات المتداولين المحترفين" defaultOn icon={Percent} />
        <ToggleRow title="إشارات الذكاء الاصطناعي" desc="توصيات التداول المدعومة بالذكاء الاصطناعي" defaultOn icon={ShieldCheck} />
        <ToggleRow title="وضع الصيانة" desc="إيقاف المنصة مؤقتاً للصيانة" icon={Settings} />
        <ToggleRow title="الوضع التجريبي فقط" desc="تقييد كل المستخدمين على الحسابات التجريبية" icon={Globe} />
      </div>
    </SectionCard>
  );
}

/* ---------- Notifications ---------- */
function NotificationsTab() {
  return (
    <SectionCard title="إشعارات النظام" desc="إعدادات الإشعارات للمشرفين" icon={Bell}>
      <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <span>الإشعار</span>
          <span className="w-14 text-center">بريد</span>
          <span className="w-14 text-center">دفع</span>
        </div>
        {[
          { id: "new-user", label: "مستخدم جديد", desc: "عند تسجيل حساب جديد", def: true },
          { id: "payment", label: "دفعة جديدة", desc: "عند نجاح عملية دفع", def: true },
          { id: "sub-cancel", label: "إلغاء اشتراك", desc: "عند إلغاء عضوية", def: true },
          { id: "bot-error", label: "خطأ في البوت", desc: "عند توقف بوت بسبب خطأ", def: true },
          { id: "high-load", label: "حمل عالٍ", desc: "عند تجاوز استخدام الخادم 80%", def: false },
          { id: "security", label: "تنبيه أمني", desc: "محاولات دخول مشبوهة", def: true },
        ].map((n, i, arr) => (
          <div key={n.id} className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-3.5 ${i !== arr.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{n.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{n.desc}</p>
            </div>
            <div className="flex w-14 justify-center"><Toggle defaultOn={n.def} /></div>
            <div className="flex w-14 justify-center"><Toggle defaultOn={n.def} /></div>
          </div>
        ))}
      </div>
      <SaveBar />
    </SectionCard>
  );
}

/* ---------- API ---------- */
function ApiTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="مفاتيح API" desc="مفاتيح الوصول البرمجي للمنصة" icon={KeyRound}>
        <div className="space-y-3">
          <ApiKeyRow label="مفتاح عام (Public Key)" value="pk_live_••••••••••••••••4291" />
          <ApiKeyRow label="مفتاح سري (Secret Key)" value="sk_live_••••••••••••••••8a2f" />
        </div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-smooth hover:bg-[var(--bg-hover)]">
          <KeyRound className="h-4 w-4" />
          توليد مفتاح جديد
        </button>
      </SectionCard>

      <SectionCard title="ويبهوك (Webhook)" desc="استقبل إشعارات الأحداث على خادمك" icon={Webhook}>
        <div className="space-y-4">
          <Field label="رابط الويبهوك" htmlFor="webhook-url" hint="سيتم إرسال طلب POST لكل حدث">
            <Input id="webhook-url" type="url" placeholder="https://your-server.com/webhook" />
          </Field>
          <div className="space-y-3">
            <ToggleRow title="أحداث الدفع" desc="payment.succeeded, payment.failed" defaultOn icon={CreditCard} />
            <ToggleRow title="أحداث الاشتراك" desc="subscription.created, subscription.canceled" defaultOn icon={Percent} />
            <ToggleRow title="أحداث المستخدمين" desc="user.created, user.suspended" icon={Mail} />
          </div>
        </div>
        <SaveBar />
      </SectionCard>
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  defaultOn,
  icon: Icon,
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]">
            <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
          <p className="text-xs text-[var(--text-muted)]">{desc}</p>
        </div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function ApiKeyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 font-mono-nums text-xs text-[var(--text-muted)]">{value}</p>
      </div>
      <button className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
        نسخ
      </button>
    </div>
  );
}
