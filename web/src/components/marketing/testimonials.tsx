"use client";

import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientGold } from "./features";
import { useI18n } from "@/lib/i18n/provider";

export function MarketingTestimonials() {
  const { lang, t } = useI18n();
  const testimonials = t.testimonials.items[lang];

  return (
    <section id="testimonials" className="relative py-28">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "rgba(245,177,78,0.08)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="gold">{t.testimonials.eyebrow[lang]}</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {t.testimonials.title1[lang]}
            <GradientGold> {t.testimonials.titleAccent[lang]}</GradientGold>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            {t.testimonials.subtitle[lang]}
          </p>
        </Reveal>

        <div className="mt-16 columns-1 gap-5 md:columns-2 lg:columns-3 [column-fill:_balance]">
          {testimonials.map((item, i) => (
            <Reveal
              key={i}
              delay={(i % 3) * 90}
              className="mb-5 break-inside-avoid"
            >
              <figure className="card group p-6 transition-smooth hover:bg-[var(--bg-hover)]">
                <Quote
                  className="h-8 w-8 opacity-10"
                  style={{
                    color: item.gold ? "var(--gold-bright)" : "var(--accent-bright)",
                  }}
                />
                <blockquote className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.text}
                </blockquote>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]"
                    />
                  ))}
                </div>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={
                      item.gold
                        ? {
                            background: "rgba(245,177,78,0.15)",
                            color: "var(--gold-bright)",
                          }
                        : {
                            background: "var(--accent-dim)",
                            color: "var(--accent-bright)",
                          }
                    }
                  >
                    {item.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
