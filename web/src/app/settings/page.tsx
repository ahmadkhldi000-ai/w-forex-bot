"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  User,
  ShieldCheck,
  Bell,
  Globe,
  Camera,
  Check,
  Smartphone,
  Mail,
  Monitor,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  Fingerprint,
  Moon,
  Sun,
  Languages,
  Trash2,
  Download,
  ChevronRight,
} from "lucide-react";

type Tab = "profile" | "security" | "notifications" | "preferences";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Globe },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen bg-[var(--bg)] lg:pr-[252px]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* ---- Header ---- */}
            <header>
              <div className="mb-1.5 inline-flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--emerald)]" />
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Account Settings
                </h1>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">
                Manage your profile, security, and platform preferences.
              </p>
            </header>

            {/* ---- Tab nav ---- */}
            <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-smooth",
                      tab === t.id
                        ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
                        : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {/* ---- Tab content ---- */}
            {tab === "profile" && <ProfileTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "preferences" && <PreferencesTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================================================================== */
/* SHARED FORM PRIMITIVES                                              */
/* ================================================================== */
function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--fg-muted)]">{hint}</p>}
    </div>
  );
}

function Input({
  id,
  defaultValue,
  placeholder,
  type = "text",
}: {
  id: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 px-3.5 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] outline-none transition-smooth focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/20"
    />
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
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5 lg:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/60">
          <Icon className="h-5 w-5 text-[var(--emerald)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--fg)]">{title}</h2>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SaveBar({ onSave }: { onSave?: () => void }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <button className="rounded-xl border border-[var(--border-strong)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)]">
        Cancel
      </button>
      <button
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-[#06241a] transition-smooth hover:bg-[var(--emerald-bright)]"
      >
        <Check className="h-4 w-4" />
        Save Changes
      </button>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-smooth",
        on ? "bg-[var(--emerald)]" : "bg-[var(--bg-elevated)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-smooth",
          on && "translate-x-5"
        )}
      />
    </button>
  );
}

/* ================================================================== */
/* PROFILE TAB                                                         */
/* ================================================================== */
function ProfileTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Profile Photo" desc="Personalize your account with an avatar" icon={Camera}>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--emerald-deep)] to-[var(--emerald-bright)] text-2xl font-bold text-[#06241a]">
              AK
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--surface-2)] text-[var(--fg-muted)] transition-smooth hover:text-[var(--emerald-bright)]">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 px-4 py-2 text-sm font-medium text-[var(--fg)] transition-smooth hover:bg-[var(--bg-hover)]">
              Upload New
            </button>
            <button className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/10">
              Remove
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Information" desc="Update your personal details" icon={User}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="full-name">
            <Input id="full-name" defaultValue="Ahmad Khaldi" />
          </Field>
          <Field label="Username" htmlFor="username">
            <Input id="username" defaultValue="ahmadk" />
          </Field>
          <Field label="Email Address" htmlFor="email">
            <Input id="email" type="email" defaultValue="ahmad@example.com" />
          </Field>
          <Field label="Phone Number" htmlFor="phone">
            <Input id="phone" type="tel" defaultValue="+962 7 9123 4567" />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" defaultValue="Jordan" />
          </Field>
          <Field label="Time Zone" htmlFor="timezone">
            <Input id="timezone" defaultValue="GMT+3 (Asia/Amman)" />
          </Field>
        </div>
        <SaveBar />
      </SectionCard>

      <SectionCard title="Trading Profile" desc="Tell us about your trading experience" icon={Globe}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Experience Level" htmlFor="exp">
            <Select id="exp" options={["Beginner", "Intermediate", "Advanced", "Professional"]} defaultOpt="Advanced" />
          </Field>
          <Field label="Risk Tolerance" htmlFor="risk">
            <Select id="risk" options={["Conservative", "Moderate", "Aggressive"]} defaultOpt="Moderate" />
          </Field>
        </div>
        <SaveBar />
      </SectionCard>
    </div>
  );
}

function Select({
  id,
  options,
  defaultOpt,
}: {
  id: string;
  options: string[];
  defaultOpt: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        defaultValue={defaultOpt}
        className="w-full appearance-none rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 px-3.5 py-2.5 pr-10 text-sm text-[var(--fg)] outline-none transition-smooth focus:border-[var(--emerald)] focus:ring-2 focus:ring-[var(--emerald)]/20"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[var(--surface-2)]">
            {o}
          </option>
        ))}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[var(--fg-muted)]" />
    </div>
  );
}

/* ================================================================== */
/* SECURITY TAB                                                        */
/* ================================================================== */
function SecurityTab() {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="space-y-5">
      <SectionCard title="Change Password" desc="Use a strong, unique password" icon={KeyRound}>
        <div className="space-y-4">
          <Field label="Current Password" htmlFor="cur-pwd">
            <div className="relative">
              <Input id="cur-pwd" type={showPwd ? "text" : "password"} placeholder="••••••••" />
              <button
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] transition-smooth hover:text-[var(--fg)]"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="New Password" htmlFor="new-pwd" hint="Min 8 chars, 1 number, 1 symbol">
              <Input id="new-pwd" type={showPwd ? "text" : "password"} placeholder="••••••••" />
            </Field>
            <Field label="Confirm Password" htmlFor="conf-pwd">
              <Input id="conf-pwd" type={showPwd ? "text" : "password"} placeholder="••••••••" />
            </Field>
          </div>
        </div>
        <SaveBar />
      </SectionCard>

      <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of security" icon={Fingerprint}>
        <div className="space-y-3">
          <TwoFactorRow
            icon={Smartphone}
            title="Authenticator App"
            desc="Google Authenticator, Authy, or 1Password"
            enabled
          />
          <TwoFactorRow
            icon={Mail}
            title="Email Verification"
            desc="Receive a code at ahmad@example.com"
            enabled
          />
          <TwoFactorRow
            icon={Fingerprint}
            title="Biometric Login"
            desc="Use fingerprint or face recognition on supported devices"
          />
        </div>
      </SectionCard>

      <SectionCard title="Active Sessions" desc="Devices currently logged into your account" icon={Monitor}>
        <div className="space-y-2.5">
          <SessionRow
            icon={Monitor}
            device="MacBook Pro · Chrome"
            location="Amman, Jordan"
            current
            time="Active now"
          />
          <SessionRow
            icon={Smartphone}
            device="iPhone 15 Pro · Safari"
            location="Amman, Jordan"
            time="2 hours ago"
          />
        </div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-2 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/15">
          <LogOut className="h-4 w-4" />
          Sign Out All Devices
        </button>
      </SectionCard>
    </div>
  );
}

function TwoFactorRow({
  icon: Icon,
  title,
  desc,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          <Icon className="h-4 w-4 text-[var(--fg-secondary)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--fg)]">{title}</p>
            {enabled && (
              <Badge className="bg-[var(--emerald)]/12 text-[var(--emerald-bright)]">
                <Check className="mr-1 h-3 w-3" /> On
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{desc}</p>
        </div>
      </div>
      <Toggle defaultOn={enabled} />
    </div>
  );
}

function SessionRow({
  icon: Icon,
  device,
  location,
  time,
  current,
}: {
  icon: React.ComponentType<{ className?: string }>;
  device: string;
  location: string;
  time: string;
  current?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          <Icon className="h-4 w-4 text-[var(--fg-secondary)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--fg)]">{device}</p>
            {current && (
              <Badge className="bg-[var(--emerald)]/12 text-[var(--emerald-bright)]">This device</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
            {location} · {time}
          </p>
        </div>
      </div>
      {!current && (
        <button className="rounded-lg p-2 text-[var(--fg-muted)] transition-smooth hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]">
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ================================================================== */
/* NOTIFICATIONS TAB                                                   */
/* ================================================================== */
function NotificationsTab() {
  const channels = [
    { id: "trade", label: "Trade Executions", desc: "When your bot opens or closes a position", icon: Check, def: true },
    { id: "pnl", label: "Daily P&L Summary", desc: "End-of-day profit & loss report", icon: Check, def: true },
    { id: "risk", label: "Risk Alerts", desc: "Drawdown limits, margin calls", icon: ShieldCheck, def: true },
    { id: "signal", label: "AI Signal Alerts", desc: "New high-confidence trading signals", icon: Bell },
    { id: "news", label: "Market News", desc: "Breaking economic news & events", icon: Globe },
    { id: "product", label: "Product Updates", desc: "New features & announcements", icon: Mail, def: true },
  ];
  return (
    <SectionCard title="Notification Preferences" desc="Choose what you want to be notified about" icon={Bell}>
      <div className="overflow-hidden rounded-xl border border-[var(--border)]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-[var(--border)] bg-[var(--bg-elevated)]/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
          <span>Notification</span>
          <span className="w-14 text-center">Email</span>
          <span className="w-14 text-center">Push</span>
        </div>
        {channels.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={cn(
                "grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-3.5",
                i !== channels.length - 1 && "border-b border-[var(--border)]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-[var(--fg-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--fg)]">{c.label}</p>
                  <p className="text-xs text-[var(--fg-muted)]">{c.desc}</p>
                </div>
              </div>
              <div className="flex w-14 justify-center">
                <Toggle defaultOn={c.def} />
              </div>
              <div className="flex w-14 justify-center">
                <Toggle defaultOn={c.def} />
              </div>
            </div>
          );
        })}
      </div>
      <SaveBar />
    </SectionCard>
  );
}

/* ================================================================== */
/* PREFERENCES TAB                                                     */
/* ================================================================== */
function PreferencesTab() {
  return (
    <div className="space-y-5">
      <SectionCard title="Appearance & Language" desc="Customize your workspace" icon={Globe}>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--fg)]">Theme</p>
            <div className="grid grid-cols-2 gap-3">
              <ThemeOption icon={Moon} label="Dark" desc="Default" active />
              <ThemeOption icon={Sun} label="Light" desc="Coming soon" disabled />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--fg)]">Language</p>
            <div className="grid grid-cols-2 gap-3">
              <LangOption code="EN" label="English" active />
              <LangOption code="AR" label="العربية" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Base Currency" htmlFor="currency">
              <Select id="currency" options={["USD", "EUR", "GBP", "JPY", "AED"]} defaultOpt="USD" />
            </Field>
            <Field label="Number Format" htmlFor="numfmt">
              <Select id="numfmt" options={["1,234.56 (US)", "1.234,56 (EU)"]} defaultOpt="1,234.56 (US)" />
            </Field>
          </div>
        </div>
        <SaveBar />
      </SectionCard>

      <SectionCard title="Trading Defaults" desc="Default values for new bots" icon={Globe}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default Lot Size" htmlFor="lot">
            <Input id="lot" defaultValue="0.10" />
          </Field>
          <Field label="Default Risk Per Trade (%)" htmlFor="riskpt">
            <Input id="riskpt" defaultValue="2" />
          </Field>
        </div>
        <SaveBar />
      </SectionCard>

      <SectionCard title="Data & Privacy" desc="Manage your data and account" icon={ShieldCheck}>
        <div className="space-y-2.5">
          <DataRow icon={Download} title="Export My Data" desc="Download a copy of your account data" action="Export" />
          <DataRow icon={KeyRound} title="API Keys" desc="Manage programmatic access tokens" action="Manage" />
          <div className="h-px w-full bg-[var(--border)]" />
          <DataRow
            icon={Trash2}
            title="Delete Account"
            desc="Permanently remove your account and all data"
            action="Delete"
            danger
          />
        </div>
      </SectionCard>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  desc,
  active,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-smooth",
        active
          ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/8"
          : disabled
          ? "cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)]/30 opacity-50"
          : "border-[var(--border)] bg-[var(--bg-elevated)]/40 hover:border-[var(--border-strong)]"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-[var(--emerald-bright)]" : "text-[var(--fg-muted)]")} />
      <div>
        <p className="text-sm font-medium text-[var(--fg)]">{label}</p>
        <p className="text-xs text-[var(--fg-muted)]">{desc}</p>
      </div>
      {active && <Check className="ml-auto h-4 w-4 text-[var(--emerald-bright)]" />}
    </button>
  );
}

function LangOption({ code, label, active }: { code: string; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-smooth",
        active
          ? "border-[var(--emerald)]/40 bg-[var(--emerald)]/8"
          : "border-[var(--border)] bg-[var(--bg-elevated)]/40 hover:border-[var(--border-strong)]"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
          active ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]" : "bg-[var(--surface-2)] text-[var(--fg-muted)]"
        )}
      >
        {code}
      </span>
      <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      {active && <Check className="ml-auto h-4 w-4 text-[var(--emerald-bright)]" />}
    </button>
  );
}

function DataRow({
  icon: Icon,
  title,
  desc,
  action,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  action: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border",
            danger
              ? "border-[var(--danger)]/25 bg-[var(--danger)]/8 text-[var(--danger)]"
              : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--fg-muted)]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--fg)]">{title}</p>
          <p className="text-xs text-[var(--fg-muted)]">{desc}</p>
        </div>
      </div>
      <button
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth",
          danger
            ? "bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20"
            : "border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-hover)]"
        )}
      >
        {action}
      </button>
    </div>
  );
}
