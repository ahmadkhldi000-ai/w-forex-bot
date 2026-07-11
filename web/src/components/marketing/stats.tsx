"use client";

import { Reveal } from "@/components/ui/reveal";
import { useI18n } from "@/lib/i18n/provider";

export function MarketingStats() {
  const { lang, t } = useI18n();
  const stats = t.stats[lang];

  return (
    <section className="relative border-y border-[var(--border-subtle)] py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="text-center">
              <p
                className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                style={
                  s.gold
                    ? {
                        background:
                          "linear-gradient(120deg,#ffc870,#f5b14e 60%,#fcd34d)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : undefined
                }
              >
                {s.value}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
