"use client";

import {
  Bot,
  ShieldCheck,
  Gauge,
  LineChart,
  Bell,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { useI18n } from "@/lib/i18n/provider";

type Tone = "accent" | "gold";

/* icon registry: maps the string keys in the dictionary to actual components */
const ICONS: Record<string, LucideIcon> = {
  Bot,
  ShieldCheck,
  Gauge,
  LineChart,
  Bell,
  Wallet,
};

export function MarketingFeatures() {
  const { lang, t } = useI18n();
  const features = t.features.items[lang];

  return (
    <section id="features" className="relative py-28">
      <div
        className="pointer-events-none absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full blur-[120px]"
        style={{ background: "rgba(25,201,138,0.1)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="accent">{t.features.eyebrow[lang]}</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {t.features.title1[lang]}
            <GradientAccent> {t.features.titleAccent[lang]}</GradientAccent>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            {t.features.subtitle[lang]}
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <FeatureCard
                icon={ICONS[f.icon]}
                title={f.title}
                desc={f.desc}
                tone={f.tone as Tone}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  tone: Tone;
}) {
  const isAccent = tone === "accent";
  return (
    <div className="card group h-full p-7 transition-smooth hover:-translate-y-1">
      <span
        className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-smooth"
        style={{
          background: isAccent
            ? "linear-gradient(160deg,rgba(46,233,168,0.2),rgba(25,201,138,0.04))"
            : "linear-gradient(160deg,rgba(255,200,112,0.2),rgba(245,177,78,0.04))",
          color: isAccent ? "var(--accent-bright)" : "var(--gold-bright)",
        }}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <h3 className="relative text-lg font-bold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="relative mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {desc}
      </p>
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide"
      style={{
        borderColor:
          tone === "accent" ? "rgba(25,201,138,0.25)" : "rgba(245,177,78,0.25)",
        background:
          tone === "accent" ? "var(--accent-dim)" : "rgba(245,177,78,0.1)",
        color: tone === "accent" ? "var(--accent-bright)" : "var(--gold-bright)",
      }}
    >
      {children}
    </span>
  );
}

export function GradientAccent({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(120deg,#2ee9a8,#19c98a 60%,#6ee7b7)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function GradientGold({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(120deg,#ffc870,#f5b14e 60%,#fcd34d)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
