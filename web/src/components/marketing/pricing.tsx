"use client";

import {
  Check,
  Sparkles,
  Crown,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientAccent } from "./features";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

type Variant = "primary" | "secondary" | "gold";

const ICONS: Record<string, LucideIcon> = { Rocket, Sparkles, Crown };

export function MarketingPricing() {
  const { lang, t } = useI18n();
  const plans = t.pricing.plans[lang];

  return (
    <section id="pricing" className="relative py-28">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "rgba(25,201,138,0.1)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="accent">{t.pricing.eyebrow[lang]}</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {t.pricing.title1[lang]} <GradientAccent>{t.pricing.titleAccent[lang]}</GradientAccent>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            {t.pricing.subtitle[lang]}
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => {
            const Icon = ICONS[p.icon];
            return (
              <Reveal key={p.name} delay={i * 110} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl p-8 transition-smooth",
                    p.featured
                      ? "border-2 border-[var(--accent)]/40 bg-gradient-to-b from-[var(--accent-dim)] to-transparent shadow-[0_30px_80px_-40px_rgba(25,201,138,0.6)]"
                      : "border border-[var(--border-subtle)] bg-white/[0.02] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
                  )}
                >
                  {p.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Eyebrow tone="accent">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t.pricing.mostPopular[lang]}
                      </Eyebrow>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={
                        p.featured
                          ? {
                              background: "linear-gradient(160deg,#2ee9a8,#19c98a)",
                              color: "#04130d",
                            }
                          : {
                              background: "rgba(255,255,255,0.05)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-mono-nums text-4xl font-bold text-[var(--text-primary)]">
                      {p.price}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {p.period}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {p.desc}
                  </p>

                  <div className="my-7 h-px bg-[var(--border-subtle)]" />

                  <ul className="flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                      >
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                          style={
                            p.featured
                              ? {
                                  background: "var(--accent-dim)",
                                  color: "var(--accent-bright)",
                                }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "var(--text-secondary)",
                                }
                          }
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <PricingCta variant={p.variant as Variant} featured={p.featured}>
                    {p.cta}
                  </PricingCta>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingCta({
  variant,
  featured,
  children,
}: {
  variant: Variant;
  featured?: boolean;
  children: React.ReactNode;
}) {
  const base =
    "mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-smooth hover:-translate-y-0.5";

  if (variant === "primary" || featured) {
    return (
      <a
        href="/auth"
        className={cn(
          base,
          "shine relative overflow-hidden bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] text-[#04130d] shadow-[0_10px_30px_-8px_rgba(25,201,138,0.6)]",
        )}
      >
        {children}
      </a>
    );
  }
  if (variant === "gold") {
    return (
      <a
        href="#"
        className={cn(
          base,
          "bg-gradient-to-b from-[var(--gold-bright)] to-[var(--gold)] text-[#1a1003] shadow-[0_10px_30px_-8px_rgba(245,177,78,0.55)]",
        )}
      >
        {children}
      </a>
    );
  }
  return (
    <a
      href="/auth"
      className={cn(
        base,
        "border border-[var(--border-soft)] bg-white/[0.02] text-[var(--text-primary)] hover:bg-white/5",
      )}
    >
      {children}
    </a>
  );
}
