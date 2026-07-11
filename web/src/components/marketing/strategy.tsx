"use client";

import { Check, Cpu, BarChart3, Lock, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientGold } from "./features";
import { useI18n } from "@/lib/i18n/provider";

const ICONS: Record<string, LucideIcon> = { Cpu, BarChart3, Lock };

export function MarketingStrategy() {
  const { lang, t } = useI18n();
  const pillars = t.strategy.pillars[lang];

  return (
    <section id="strategy" className="relative py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="pointer-events-none absolute top-20 right-0 h-[420px] w-[420px] rounded-full blur-[130px]"
        style={{ background: "rgba(245,177,78,0.08)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <Eyebrow tone="gold">{t.strategy.eyebrow[lang]}</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              {t.strategy.title1[lang]}
              <br />
              <GradientGold>{t.strategy.titleAccent[lang]}</GradientGold>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
              {t.strategy.subtitle[lang]}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {t.strategy.badges[lang].map((badge) => (
                <span
                  key={badge}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4">
            {pillars.map((p, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="group flex gap-5 rounded-2xl border border-[var(--border-subtle)] bg-white/[0.02] p-6 transition-smooth hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-smooth"
                    style={{
                      background:
                        "linear-gradient(160deg,rgba(255,200,112,0.18),rgba(245,177,78,0.03))",
                      color: "var(--gold-bright)",
                    }}
                  >
                    {(() => {
                      const Icon = ICONS[p.icon];
                      return Icon ? <Icon className="h-6 w-6" /> : null;
                    })()}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {p.title}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {p.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-bright)]" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
