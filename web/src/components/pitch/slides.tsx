"use client";

import type { ReactNode } from "react";
import {
  CandlestickChart,
  TrendingDown,
  TrendingUp,
  Clock,
  EyeOff,
  BarChart3,
  Bot,
  Radio,
  LayoutDashboard,
  Brain,
  Link2,
  Users,
  Lock,
  Server,
  Database,
  Globe,
  ShieldCheck,
  Send,
  CreditCard,
  Zap,
  Plug,
  Languages,
  Activity,
  Gauge,
  Wallet,
  Target,
  ShieldAlert,
  KeyRound,
  Landmark,
  Smartphone,
  Shield,
  Monitor,
  FileText,
  Scan,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Check,
  X,
  Ban,
  Copy,
  Building2,
  User,
  Rocket,
  Sparkles,
  Cpu,
  LineChart,
  Wifi,
  Bell,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { SlideShell, SlideEyebrow } from "./slide-shell";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import {
  PITCH,
  COVER,
  OVERVIEW,
  PROBLEM,
  SOLUTION,
  DATAFLOW,
  COMPONENTS,
  FEATURES,
  SCREENS,
  DASHBOARD,
  LIVE,
  AI,
  PRICING,
  SECURITY,
  ROADMAP,
  BUSINESS,
  TARGET,
  COMPETITIVE,
  VISION,
  DISCLAIMER,
  CLOSING,
} from "@/lib/pitch/content";

const TOTAL = 20;

/** Icon registry so content files stay serialisable (icon as string key). */
const ICONS: Record<string, LucideIcon> = {
  "candlestick-chart": CandlestickChart,
  "trending-down": TrendingDown,
  "trending-up": TrendingUp,
  clock: Clock,
  "eye-off": EyeOff,
  "bar-chart-3": BarChart3,
  bot: Bot,
  radio: Radio,
  "layout-dashboard": LayoutDashboard,
  brain: Brain,
  link: Link2,
  users: Users,
  lock: Lock,
  server: Server,
  database: Database,
  globe: Globe,
  "shield-check": ShieldCheck,
  send: Send,
  "credit-card": CreditCard,
  zap: Zap,
  plug: Plug,
  languages: Languages,
  activity: Activity,
  gauge: Gauge,
  wallet: Wallet,
  target: Target,
  "shield-alert": ShieldAlert,
  "key-round": KeyRound,
  landmark: Landmark,
  smartphone: Smartphone,
  shield: Shield,
  monitor: Monitor,
  "file-text": FileText,
  scan: Scan,
  "user-check": UserCheck,
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
  "arrow-right": ArrowRight,
  check: Check,
  x: X,
  barrier: Ban,
  copy: Copy,
  "building-2": Building2,
  user: User,
  rocket: Rocket,
  sparkles: Sparkles,
  cpu: Cpu,
  "line-chart": LineChart,
  wifi: Wifi,
  bell: Bell,
};

function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const C = ICONS[name] ?? Sparkles;
  return <C className={className} />;
}

const TONE: Record<string, { fg: string; bg: string; ring: string; glow: string }> = {
  emerald: {
    fg: "text-[var(--emerald-bright)]",
    bg: "bg-[var(--emerald)]/10",
    ring: "ring-[var(--emerald)]/25",
    glow: "shadow-[0_0_30px_-10px_var(--emerald)]",
  },
  gold: {
    fg: "text-[var(--gold-bright)]",
    bg: "bg-[var(--gold)]/10",
    ring: "ring-[var(--gold)]/25",
    glow: "shadow-[0_0_30px_-10px_var(--gold)]",
  },
  danger: {
    fg: "text-[var(--danger)]",
    bg: "bg-[var(--danger)]/10",
    ring: "ring-[var(--danger)]/25",
    glow: "shadow-[0_0_30px_-10px_var(--danger)]",
  },
  info: {
    fg: "text-[var(--info)]",
    bg: "bg-[var(--info)]/10",
    ring: "ring-[var(--info)]/25",
    glow: "shadow-[0_0_30px_-10px_var(--info)]",
  },
};

function tone(t: string) {
  return TONE[t] ?? TONE.emerald;
}

/** Glowing aura blob — decorative only. */
function Aura({ className, color = "var(--gold)" }: { className?: string; color?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute rounded-full blur-[120px]", className)}
      style={{ background: color, opacity: 0.22 }}
      aria-hidden
    />
  );
}

/** A serial number badge with monospace styling. */
function NumBadge({ n, className }: { n: string; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono-nums inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 text-xs font-bold text-[var(--fg)]",
        className,
      )}
    >
      {n}
    </span>
  );
}

// ====================================================================
//  01 · COVER
// ====================================================================
export function Slide01() {
  return (
    <SlideShell index={1} total={TOTAL} className="items-center justify-center text-center">
      <Aura className="left-1/2 top-[-8%] h-[420px] w-[620px] -translate-x-1/2" color="var(--emerald)" />
      <Aura className="bottom-[-10%] right-[-5%] h-[360px] w-[420px]" color="var(--gold)" />
      <div className="relative z-10 flex flex-col items-center px-[6%]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--emerald)]/30 bg-[var(--emerald)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--emerald-bright)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald-bright)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" />
            </span>
            {COVER.kicker}
          </span>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-[var(--fg)] md:text-7xl">
            {COVER.title.split(" ").map((w, i) => (
              <span key={i} className={i === 1 ? "text-gradient-emerald" : ""}>
                {w}{" "}
              </span>
            ))}
          </h1>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-5 max-w-2xl text-base text-[var(--fg-muted)] md:text-lg">
            {COVER.subtitle}
          </p>
        </Reveal>
        <Reveal delay={320}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {COVER.pillars.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/70 px-4 py-2 text-xs font-medium text-[var(--fg-muted)] backdrop-blur-sm transition-smooth hover:border-[var(--emerald)]/40 hover:text-[var(--fg)]"
              >
                <Icon name={p.icon} className="h-3.5 w-3.5 text-[var(--emerald-bright)]" />
                {p.label}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={440}>
          <div className="mt-10 flex items-center gap-3 text-[var(--fg-dim)]">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--gold)]/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold-bright)]">
              {COVER.centerline}
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--gold)]/60" />
          </div>
        </Reveal>
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  02 · PROJECT OVERVIEW
// ====================================================================
export function Slide02() {
  return (
    <SlideShell index={2} total={TOTAL}>
      <Aura className="right-[-6%] top-[-6%] h-[320px] w-[320px]" color="var(--emerald)" />
      <SlideEyebrow num="01" title="Project Overview" />
      <div className="relative z-10 mt-5 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.6rem]">
              {OVERVIEW.question}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)] md:text-base">
              {OVERVIEW.intro}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-6 max-w-lg rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/[0.06] p-5">
              <span className="font-mono-nums text-2xl text-[var(--gold)]">"</span>
              <p className="-mt-2 text-sm font-medium italic leading-relaxed text-[var(--fg)] md:text-base">
                {OVERVIEW.quote}
              </p>
            </div>
          </Reveal>
        </div>
        <div className="flex flex-col gap-3">
          {OVERVIEW.chips.map((c, i) => (
            <Reveal key={c.label} delay={260 + i * 90}>
              <div className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:border-[var(--emerald)]/40 hover:bg-[var(--surface-2)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald-bright)] ring-1 ring-[var(--emerald)]/25 transition-smooth group-hover:scale-110">
                  <Icon name={c.icon} className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-[var(--fg)]">{c.label}</span>
                <Check className="ml-auto h-4 w-4 text-[var(--emerald)]/60" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  03 · MARKET ANALYSIS / THE PROBLEM
// ====================================================================
export function Slide03() {
  return (
    <SlideShell index={3} total={TOTAL}>
      <Aura className="left-[-4%] top-[-8%] h-[300px] w-[300px]" color="var(--danger)" />
      <SlideEyebrow num="02" title="Market Analysis" />
      <Reveal>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-[var(--fg)] md:text-[2rem]">
          {PROBLEM.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-2 max-w-2xl text-xs text-[var(--fg-muted)] md:text-sm">{PROBLEM.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEM.challenges.map((c, i) => {
          const t = tone(c.tone);
          return (
            <Reveal key={c.title} delay={160 + i * 90}>
              <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-1 hover:border-[var(--border-strong)]">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-smooth group-hover:scale-110", t.bg, t.fg, t.ring)}>
                  <Icon name={c.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-xs font-bold text-[var(--fg)]">{c.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-muted)]">{c.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={560}>
        <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--fg-dim)]">
                {PROBLEM.resultLabel}
              </span>
              <p className="mt-1 text-base font-bold text-[var(--fg)]">{PROBLEM.resultTitle}</p>
            </div>
            <div className="flex items-center gap-6">
              {PROBLEM.resultStats.map((s) => (
                <div key={s.label}>
                  <p className="font-mono-nums text-2xl font-black text-gradient-emerald">{s.value}</p>
                  <p className="mt-0.5 max-w-[170px] text-[10px] leading-snug text-[var(--fg-muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </SlideShell>
  );
}

// ====================================================================
//  04 · SOLUTION OVERVIEW
// ====================================================================
export function Slide04() {
  return (
    <SlideShell index={4} total={TOTAL}>
      <Aura className="right-[-5%] bottom-[-8%] h-[340px] w-[340px]" color="var(--emerald)" />
      <SlideEyebrow num="03" title="Solution Overview" />
      <Reveal>
        <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-[var(--fg)] md:text-[2rem]">
          {SOLUTION.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-2 max-w-2xl text-xs text-[var(--fg-muted)] md:text-sm">{SOLUTION.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTION.features.map((f, i) => (
          <Reveal key={f.title} delay={160 + i * 80}>
            <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-1 hover:border-[var(--emerald)]/35">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald-bright)] ring-1 ring-[var(--emerald)]/25 transition-smooth group-hover:scale-110">
                  <Icon name={f.icon} className="h-5 w-5" />
                </div>
                <NumBadge n={f.num} className="text-[var(--fg-dim)]" />
              </div>
              <h3 className="mt-3 text-xs font-bold text-[var(--fg)]">{f.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-muted)]">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  05 · HOW THE PLATFORM WORKS (data flow)
// ====================================================================
export function Slide05() {
  return (
    <SlideShell index={5} total={TOTAL}>
      <Aura className="left-1/2 top-[-10%] h-[300px] w-[500px] -translate-x-1/2" color="var(--info)" />
      <SlideEyebrow num="04" title="How the Platform Works" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {DATAFLOW.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{DATAFLOW.intro}</p>
      </Reveal>
      {/* Flow */}
      <Reveal delay={160}>
        <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
          {DATAFLOW.nodes.map((n, i) => (
            <div key={n.label} className="flex items-center gap-3">
              <div className="group flex flex-col items-center gap-2.5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)]/80 text-[var(--emerald-bright)] backdrop-blur-sm transition-smooth hover:-translate-y-1 hover:border-[var(--emerald)]/45 hover:shadow-[0_0_30px_-8px_var(--emerald)]">
                  <Icon name={n.icon} className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-medium text-[var(--fg-muted)]">{n.label}</span>
              </div>
              {i < DATAFLOW.nodes.length - 1 && (
                <div className="relative mb-6 flex h-px w-10 items-center bg-gradient-to-r from-[var(--emerald)]/50 to-[var(--emerald)]/20 sm:w-14">
                  <span className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--emerald-bright)] shadow-[0_0_8px_var(--emerald-bright)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
      {/* Guarantees */}
      <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-3">
        {DATAFLOW.guarantees.map((g, i) => (
          <Reveal key={g.label} delay={320 + i * 100}>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/70 px-4 py-2 backdrop-blur-sm">
              <Icon name={g.icon} className="h-4 w-4 text-[var(--info)]" />
              <span className="text-xs font-medium text-[var(--fg)]">{g.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  06 · SYSTEM COMPONENTS (8-card grid)
// ====================================================================
export function Slide06() {
  return (
    <SlideShell index={6} total={TOTAL}>
      <Aura className="right-[-6%] top-[-6%] h-[300px] w-[300px]" color="var(--gold)" />
      <SlideEyebrow num="05" title="System Components" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {COMPONENTS.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{COMPONENTS.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {COMPONENTS.items.map((c, i) => (
          <Reveal key={c.title} delay={140 + i * 60}>
            <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-1 hover:border-[var(--gold)]/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold-bright)] ring-1 ring-[var(--gold)]/20 transition-smooth group-hover:scale-110">
                <Icon name={c.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--fg)]">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">{c.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  07 · KEY FEATURES
// ====================================================================
export function Slide07() {
  return (
    <SlideShell index={7} total={TOTAL}>
      <Aura className="left-[-5%] bottom-[-8%] h-[340px] w-[340px]" color="var(--emerald)" />
      <SlideEyebrow num="06" title="Key Features" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {FEATURES.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{FEATURES.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 flex flex-col gap-2.5">
        {FEATURES.items.map((f, i) => (
          <Reveal key={f.title} delay={140 + i * 70}>
            <div className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3.5 transition-smooth hover:border-[var(--emerald)]/30 hover:bg-[var(--surface-2)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald-bright)] ring-1 ring-[var(--emerald)]/25 transition-smooth group-hover:scale-110">
                <Icon name={f.icon} className="h-5 w-5" />
              </div>
              <h3 className="w-44 shrink-0 text-sm font-bold text-[var(--fg)]">{f.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  08 · PLATFORM SCREENSHOTS
// ====================================================================
export function Slide08() {
  return (
    <SlideShell index={8} total={TOTAL}>
      <Aura className="right-1/2 top-[-8%] h-[300px] w-[460px] translate-x-1/2" color="var(--info)" />
      <SlideEyebrow num="07" title="Platform Screenshots" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {SCREENS.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{SCREENS.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SCREENS.items.map((s, i) => (
          <Reveal key={s.title} delay={160 + i * 90}>
            <div className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 transition-smooth hover:-translate-y-1.5 hover:border-[var(--emerald)]/35">
              {/* Mock screenshot frame */}
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--danger)]/60" />
                  <span className="h-2 w-2 rounded-full bg-[var(--gold)]/60" />
                  <span className="h-2 w-2 rounded-full bg-[var(--emerald)]/60" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-[var(--emerald)]/30 transition-smooth group-hover:text-[var(--emerald)]/60">
                  <Icon name={s.icon} className="h-10 w-10" />
                </div>
                {/* fake content bars */}
                <div className="absolute inset-x-4 bottom-4 space-y-1.5">
                  <div className="h-1.5 w-2/3 rounded-full bg-[var(--surface-2)]" />
                  <div className="h-1.5 w-1/2 rounded-full bg-[var(--surface-2)]/60" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[var(--fg)]">{s.title}</h3>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  09 · DASHBOARD VIEW
// ====================================================================
export function Slide09() {
  return (
    <SlideShell index={9} total={TOTAL}>
      <Aura className="left-[-5%] top-[-6%] h-[320px] w-[320px]" color="var(--emerald)" />
      <SlideEyebrow num="08" title="Dashboard View" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {DASHBOARD.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{DASHBOARD.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD.metrics.map((m, i) => {
          const t = tone(m.tone);
          return (
            <Reveal key={m.title} delay={160 + i * 90}>
              <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-5 transition-smooth hover:-translate-y-1 hover:border-[var(--border-strong)]">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-smooth group-hover:scale-110", t.bg, t.fg, t.ring, t.glow)}>
                  <Icon name={m.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-[var(--fg)]">{m.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{m.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
      {/* Mock dashboard strip */}
      <Reveal delay={560}>
        <div className="relative z-10 mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="flex items-end gap-1.5">
            {SPARK.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[var(--emerald)]/30 to-[var(--emerald)]/70"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </SlideShell>
  );
}

// Deterministic sparkline heights
const SPARK = [28, 42, 34, 52, 46, 64, 58, 72, 66, 84, 76, 92];

// ====================================================================
//  10 · TRADING INTERFACE
// ====================================================================
export function Slide10() {
  return (
    <SlideShell index={10} total={TOTAL}>
      <Aura className="right-[-5%] bottom-[-8%] h-[340px] w-[340px]" color="var(--gold)" />
      <SlideEyebrow num="09" title="Trading Interface" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {LIVE.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{LIVE.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Chart mock */}
        <Reveal delay={160}>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono-nums text-sm font-bold text-[var(--fg)]">{LIVE.chartTitle}</span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--emerald-bright)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald-bright)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--emerald-bright)]" />
                </span>
                LIVE
              </span>
            </div>
            {/* SVG candlestick chart */}
            <svg viewBox="0 0 400 180" className="w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 130 L40 118 L80 96 L120 104 L160 74 L200 86 L240 54 L280 66 L320 40 L360 50 L400 28 L400 180 L0 180 Z"
                fill="url(#areaFill)"
              />
              <path
                d="M0 130 L40 118 L80 96 L120 104 L160 74 L200 86 L240 54 L280 66 L320 40 L360 50 L400 28"
                fill="none"
                stroke="var(--emerald-bright)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {CANDLES.map((c, i) => {
                const x = 18 + i * 34;
                const color = c.up ? "var(--emerald)" : "var(--danger)";
                const y = 90 - c.h / 2;
                return (
                  <g key={i} opacity={0.5}>
                    <line x1={x + 7} x2={x + 7} y1={y - 10} y2={y + c.h + 10} stroke={color} strokeWidth="1.2" />
                    <rect x={x} y={y} width="14" height={c.h} rx="2" fill={color} fillOpacity="0.55" />
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>
        {/* Order panel */}
        <div className="flex flex-col gap-3">
          {LIVE.side.map((s, i) => {
            const t = tone(s.tone);
            return (
              <Reveal key={s.label} delay={260 + i * 90}>
                <div className={cn("group flex items-center gap-4 rounded-2xl border bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-0.5", s.tone === "emerald" ? "border-[var(--emerald)]/25 hover:border-[var(--emerald)]/50" : "border-[var(--border)] hover:border-[var(--border-strong)]")}>
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-smooth group-hover:scale-110", t.bg, t.fg, t.ring)}>
                    <Icon name={s.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--fg)]">{s.label}</p>
                    <p className="font-mono-nums text-xs text-[var(--fg-muted)]">
                      {s.tone === "emerald" ? "1.0874" : s.tone === "danger" ? "1.0852" : "+45 pips"}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}

const CANDLES = [
  { up: true, h: 26 },
  { up: false, h: 18 },
  { up: true, h: 34 },
  { up: true, h: 22 },
  { up: false, h: 16 },
  { up: true, h: 40 },
  { up: true, h: 28 },
  { up: false, h: 20 },
  { up: true, h: 36 },
  { up: true, h: 30 },
];

// ====================================================================
//  11 · ARTIFICIAL INTELLIGENCE
// ====================================================================
export function Slide11() {
  return (
    <SlideShell index={11} total={TOTAL}>
      <Aura className="left-1/2 top-[-8%] h-[320px] w-[460px] -translate-x-1/2" color="var(--info)" />
      <Aura className="right-[-5%] bottom-[-6%] h-[260px] w-[260px]" color="var(--emerald)" />
      <SlideEyebrow num="10" title="Artificial Intelligence" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {AI.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{AI.intro}</p>
      </Reveal>
      {/* Neural core */}
      <Reveal delay={160}>
        <div className="relative z-10 mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--info)]/25 bg-gradient-to-r from-[var(--info)]/[0.08] to-transparent p-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--info)]/15 text-[var(--info)] ring-1 ring-[var(--info)]/30">
            <Cpu className="h-7 w-7 animate-pulse" />
            <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--fg)]">{AI.neuralTitle}</h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">{AI.neuralText}</p>
          </div>
        </div>
      </Reveal>
      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AI.points.map((p, i) => (
          <Reveal key={p.title} delay={280 + i * 80}>
            <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-1 hover:border-[var(--info)]/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--info)]/10 text-[var(--info)] ring-1 ring-[var(--info)]/20 transition-smooth group-hover:scale-110">
                <Icon name={p.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--fg)]">{p.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  12 · SUBSCRIPTION MODEL
// ====================================================================
export function Slide12() {
  return (
    <SlideShell index={12} total={TOTAL}>
      <Aura className="right-[-5%] top-[-6%] h-[320px] w-[320px]" color="var(--gold)" />
      <SlideEyebrow num="11" title="Subscription Model" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {PRICING.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{PRICING.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PRICING.tiers.map((tier, i) => (
          <Reveal key={tier.tier} delay={160 + i * 110}>
            <div
              className={cn(
                "relative h-full overflow-hidden rounded-2xl border p-5 transition-smooth hover:-translate-y-1.5",
                tier.featured
                  ? "border-[var(--gold)]/45 bg-gradient-to-b from-[var(--gold)]/[0.08] to-[var(--surface)]/70 shadow-[0_0_40px_-12px_var(--gold)]"
                  : "border-[var(--border)] bg-[var(--surface)]/70 hover:border-[var(--border-strong)]",
              )}
            >
              {tier.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-bright)] ring-1 ring-[var(--gold)]/30">
                  Most Popular
                </span>
              )}
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--fg-muted)]">{tier.tier}</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-mono-nums text-4xl font-black text-[var(--fg)]">{tier.price}</span>
                <span className="mb-1 text-xs text-[var(--fg-muted)]">{tier.period}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--fg-muted)]">{tier.tagline}</p>
              <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                {PRICING.featureRows.map((feat) => {
                  const ok = tier.features[feat];
                  return (
                    <div key={feat} className="flex items-center gap-2.5">
                      {ok ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--emerald)]/15 text-[var(--emerald-bright)]">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--fg-dim)]">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                      <span className={cn("text-xs", ok ? "text-[var(--fg)]" : "text-[var(--fg-dim)] line-through")}>
                        {feat}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  13 · SECURITY
// ====================================================================
export function Slide13() {
  return (
    <SlideShell index={13} total={TOTAL}>
      <Aura className="left-[-5%] top-[-6%] h-[320px] w-[320px]" color="var(--emerald)" />
      <SlideEyebrow num="12" title="Security" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {SECURITY.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{SECURITY.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SECURITY.layers.map((l, i) => (
          <Reveal key={l.title} delay={160 + i * 80}>
            <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:-translate-y-1 hover:border-[var(--emerald)]/30">
              <div className="flex items-center gap-2">
                <span className="font-mono-nums text-xs font-bold text-[var(--emerald-bright)]">0{i + 1}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald-bright)] ring-1 ring-[var(--emerald)]/25 transition-smooth group-hover:scale-110">
                  <Icon name={l.icon} className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--fg)]">{l.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-muted)]">{l.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  14 · ROADMAP
// ====================================================================
export function Slide14() {
  return (
    <SlideShell index={14} total={TOTAL}>
      <Aura className="right-1/2 top-[-8%] h-[300px] w-[500px] translate-x-1/2" color="var(--gold)" />
      <SlideEyebrow num="13" title="Roadmap" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {ROADMAP.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{ROADMAP.intro}</p>
      </Reveal>
      {/* Timeline */}
      <div className="relative z-10 mt-8">
        <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-[var(--emerald)] via-[var(--gold)]/40 to-transparent" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ROADMAP.phases.map((p, i) => (
            <Reveal key={p.phase} delay={160 + i * 100}>
              <div className="group relative">
                <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--emerald)] bg-[var(--bg)] text-[var(--emerald-bright)] shadow-[0_0_16px_-4px_var(--emerald)] transition-smooth group-hover:scale-110">
                  {p.status === "done" ? <Check className="h-4 w-4" /> : <span className="font-mono-nums text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth group-hover:border-[var(--gold)]/30">
                  <span className="font-mono-nums text-[11px] font-bold text-[var(--gold-bright)]">{p.timeline}</span>
                  <h3 className="mt-1 text-sm font-bold text-[var(--fg)]">{p.label}</h3>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">{p.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  15 · BUSINESS MODEL
// ====================================================================
export function Slide15() {
  const total = BUSINESS.streams.reduce((a, s) => a + s.pct, 0);
  let acc = 0;
  return (
    <SlideShell index={15} total={TOTAL}>
      <Aura className="left-[-5%] bottom-[-8%] h-[320px] w-[320px]" color="var(--emerald)" />
      <SlideEyebrow num="14" title="Business Model" />
      <Reveal>
        <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-tight text-[var(--fg)] md:text-[2rem]">
          {BUSINESS.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-2 max-w-2xl text-xs text-[var(--fg-muted)] md:text-sm">{BUSINESS.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-4 grid grid-cols-1 items-center gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Donut */}
        <Reveal delay={160}>
          <div className="flex justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {BUSINESS.streams.map((s, i) => {
                  const dash = (s.pct / total) * 251.2;
                  const seg = (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="12"
                      strokeDasharray={`${dash} 251.2`}
                      strokeDashoffset={-acc}
                      strokeLinecap="round"
                    />
                  );
                  acc += dash;
                  return seg;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono-nums text-2xl font-black text-[var(--fg)]">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--fg-dim)]">Revenue mix</span>
              </div>
            </div>
          </div>
        </Reveal>
        {/* Legend / streams */}
        <div className="flex flex-col gap-1.5">
          {BUSINESS.streams.map((s, i) => (
            <Reveal key={s.label} delay={260 + i * 90}>
              <div className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-2.5 transition-smooth hover:border-[var(--border-strong)]">
                <span className="h-7 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[var(--fg)]">{s.label}</h3>
                    <span className="font-mono-nums text-base font-black" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">{s.note}</p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full transition-smooth group-hover:brightness-125" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal delay={640}>
        <div className="relative z-10 mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/[0.07] px-4 py-1.5">
          <Target className="h-4 w-4 text-[var(--gold-bright)]" />
          <span className="text-sm font-bold text-[var(--gold-bright)]">{BUSINESS.target}</span>
        </div>
      </Reveal>
    </SlideShell>
  );
}

// ====================================================================
//  16 · TARGET MARKET
// ====================================================================
export function Slide16() {
  return (
    <SlideShell index={16} total={TOTAL}>
      <Aura className="right-[-5%] top-[-6%] h-[340px] w-[340px]" color="var(--info)" />
      <SlideEyebrow num="15" title="Target Market" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {TARGET.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{TARGET.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Market size hero */}
        <Reveal delay={160}>
          <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--info)]/25 bg-gradient-to-br from-[var(--info)]/[0.08] to-[var(--surface)]/60 p-6">
            <Globe className="absolute -right-6 -top-6 h-32 w-32 text-[var(--info)]/10" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--fg-dim)]">Global Market Size</span>
            <p className="mt-3 font-mono-nums text-5xl font-black text-gradient-emerald">{TARGET.marketSize.value}</p>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">{TARGET.marketSize.label}</p>
          </div>
        </Reveal>
        {/* Stats grid + audiences */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {TARGET.stats.map((s, i) => (
              <Reveal key={s.label} delay={260 + i * 80}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 transition-smooth hover:border-[var(--info)]/30">
                  <p className="font-mono-nums text-2xl font-black text-[var(--fg)]">{s.value}</p>
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={600}>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--fg-dim)]">Target Audiences</span>
              {TARGET.audiences.map((a) => (
                <div key={a.title} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--info)]/10 text-[var(--info)] ring-1 ring-[var(--info)]/20">
                    <Icon name={a.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--fg)]">{a.title}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  17 · COMPETITIVE ADVANTAGE
// ====================================================================
export function Slide17() {
  return (
    <SlideShell index={17} total={TOTAL}>
      <Aura className="left-[-5%] top-[-6%] h-[320px] w-[320px]" color="var(--emerald)" />
      <SlideEyebrow num="16" title="Competitive Advantage" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {COMPETITIVE.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{COMPETITIVE.intro}</p>
      </Reveal>
      <Reveal delay={160}>
        <div className="relative z-10 mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
          {/* header */}
          <div className="grid grid-cols-[1.4fr_1fr_1.2fr] border-b border-[var(--border)] bg-[var(--surface-2)]/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-dim)]">
            <span>Metric</span>
            <span>Traditional Solutions</span>
            <span className="text-[var(--emerald-bright)]">W Forex Bot</span>
          </div>
          {/* rows */}
          <div className="divide-y divide-[var(--border)]">
            {COMPETITIVE.rows.map((r, i) => (
              <div
                key={r.metric}
                className="grid grid-cols-[1.4fr_1fr_1.2fr] items-center px-5 py-2.5 text-sm transition-smooth hover:bg-[var(--surface-2)]/50"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="font-medium text-[var(--fg)]">{r.metric}</span>
                <span className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                  <X className="h-3.5 w-3.5 text-[var(--danger)]/70" />
                  {r.them}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
                  <Check className="h-3.5 w-3.5 text-[var(--emerald-bright)]" />
                  {r.us}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </SlideShell>
  );
}

// ====================================================================
//  18 · VISION & EXPANSION
// ====================================================================
export function Slide18() {
  return (
    <SlideShell index={18} total={TOTAL}>
      <Aura className="right-1/2 top-[-8%] h-[320px] w-[500px] translate-x-1/2" color="var(--emerald)" />
      <SlideEyebrow num="17" title="Vision & Expansion" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {VISION.heading}
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-3 max-w-2xl text-sm text-[var(--fg-muted)] md:text-base">{VISION.intro}</p>
      </Reveal>
      <div className="relative z-10 mt-6 flex flex-col gap-2.5">
        {VISION.milestones.map((m, i) => (
          <Reveal key={m.year} delay={160 + i * 90}>
            <div className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4 transition-smooth hover:border-[var(--emerald)]/30 hover:bg-[var(--surface-2)]">
              <div className="flex shrink-0 flex-col items-center">
                <span className="font-mono-nums text-lg font-black text-gradient-emerald">{m.year}</span>
                {i < VISION.milestones.length - 1 && (
                  <span className="mt-1 h-6 w-px bg-gradient-to-b from-[var(--emerald)]/40 to-transparent" />
                )}
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--emerald)]/10 text-[var(--emerald-bright)] ring-1 ring-[var(--emerald)]/25 transition-smooth group-hover:scale-110">
                <Rocket className="h-5 w-5" />
              </div>
              <p className="text-sm text-[var(--fg)]">{m.label}</p>
              <ChevronRight className="ml-auto h-4 w-4 text-[var(--fg-dim)] transition-smooth group-hover:translate-x-1 group-hover:text-[var(--emerald-bright)]" />
            </div>
          </Reveal>
        ))}
      </div>
    </SlideShell>
  );
}

// ====================================================================
//  19 · RISK DISCLAIMER
// ====================================================================
export function Slide19() {
  return (
    <SlideShell index={19} total={TOTAL}>
      <Aura className="left-1/2 top-[-8%] h-[300px] w-[460px] -translate-x-1/2" color="var(--danger)" />
      <SlideEyebrow num="18" title="Risk Disclaimer" />
      <Reveal>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.4rem]">
          {DISCLAIMER.heading}
        </h2>
      </Reveal>
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {DISCLAIMER.items.map((d, i) => {
          const t = tone(d.tone);
          return (
            <Reveal key={d.title} delay={160 + i * 110}>
              <div className={cn("h-full rounded-2xl border bg-[var(--surface)]/70 p-5 transition-smooth hover:-translate-y-1", d.tone === "danger" ? "border-[var(--danger)]/25" : d.tone === "gold" ? "border-[var(--gold)]/25" : "border-[var(--border)]")}>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", t.bg, t.fg, t.ring)}>
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--fg)]">{d.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{d.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={520}>
        <div className="relative z-10 mt-5 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/[0.05] px-5 py-3">
          <p className="text-xs text-[var(--fg-muted)]">
            <span className="font-bold text-[var(--danger)]">Trade responsibly.</span> Capital preservation is our priority — always trade within your risk tolerance.
          </p>
        </div>
      </Reveal>
    </SlideShell>
  );
}

// ====================================================================
//  20 · THANK YOU / CLOSING
// ====================================================================
export function Slide20() {
  return (
    <SlideShell index={20} total={TOTAL} className="items-center justify-center text-center">
      <Aura className="left-1/2 top-[-10%] h-[440px] w-[620px] -translate-x-1/2" color="var(--emerald)" />
      <Aura className="bottom-[-10%] right-[5%] h-[320px] w-[360px]" color="var(--gold)" />
      <div className="relative z-10 flex flex-col items-center px-[6%]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--fg-muted)] backdrop-blur-sm">
            {CLOSING.note}
          </span>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-6 text-4xl font-black leading-tight text-[var(--fg)] md:text-6xl">
            {CLOSING.heading}
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-4 text-xl font-bold text-gradient-emerald md:text-3xl">{CLOSING.brand}</p>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-2 text-sm text-[var(--fg-muted)] md:text-base">{CLOSING.line}</p>
        </Reveal>
        <Reveal delay={400}>
          <a
            href={`https://${CLOSING.telegram}`}
            target="_blank"
            rel="noreferrer"
            className="shine group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--emerald)] px-6 py-3 text-sm font-bold text-[var(--bg)] transition-smooth hover:scale-[1.03] hover:shadow-[0_0_40px_-8px_var(--emerald)]"
          >
            <Send className="h-4 w-4" />
            {CLOSING.telegram}
            <ArrowRight className="h-4 w-4 transition-smooth group-hover:translate-x-0.5" />
          </a>
        </Reveal>
        <Reveal delay={520}>
          <p className="mt-8 text-[11px] text-[var(--fg-dim)]">{CLOSING.rights}</p>
        </Reveal>
      </div>
    </SlideShell>
  );
}

export const SLIDES = [
  Slide01, Slide02, Slide03, Slide04, Slide05, Slide06, Slide07, Slide08, Slide09, Slide10,
  Slide11, Slide12, Slide13, Slide14, Slide15, Slide16, Slide17, Slide18, Slide19, Slide20,
];
