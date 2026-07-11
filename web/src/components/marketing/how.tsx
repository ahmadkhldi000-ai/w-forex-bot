"use client";

import {
  UserPlus,
  Settings2,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientAccent } from "./features";
import { useI18n } from "@/lib/i18n/provider";

const ICONS: Record<string, LucideIcon> = {
  UserPlus,
  Settings2,
  Rocket,
  TrendingUp,
};

export function MarketingHow() {
  const { lang, t } = useI18n();
  const steps = t.how.steps[lang];

  return (
    <section id="how" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="accent">{t.how.eyebrow[lang]}</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {t.how.title1[lang]}
            <GradientAccent> {t.how.titleAccent[lang]}</GradientAccent>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            {t.how.subtitle[lang]}
          </p>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />

          {steps.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <Reveal key={s.step} delay={i * 100} className="relative">
                <div className="card group h-full p-7 text-center transition-smooth hover:-translate-y-1.5">
                  <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)] shadow-[0_10px_30px_-8px_rgba(25,201,138,0.6)]">
                    {Icon && <Icon className="h-7 w-7 text-[#04130d]" strokeWidth={2} />}
                  </div>
                  <span className="font-mono-nums absolute right-5 top-5 text-3xl font-bold text-white/5 transition-colors group-hover:text-[var(--accent)]/20">
                    {s.step}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
