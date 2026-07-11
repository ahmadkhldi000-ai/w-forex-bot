"use client";

import { useState } from "react";
import { Send, MessageCircle, Bell, TrendingUp, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { useI18n } from "@/lib/i18n/provider";

const TELEGRAM_CHANNEL_URL = "https://t.me/+iXalBkHABfBkYWQ0";

const ICONS: Record<string, LucideIcon> = {
  Bell,
  TrendingUp,
  MessageCircle,
};

export function TelegramCTA() {
  const { lang, t } = useI18n();
  const perks = t.telegramCta.perks[lang];
  const [clicked, setClicked] = useState(false);

  const handleJoin = () => {
    setClicked(true);
    if (typeof window !== "undefined") {
      window.open(TELEGRAM_CHANNEL_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--accent-dim)] via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[140px]"
        style={{ background: "radial-gradient(circle, #229ED9, transparent 70%)" }}
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-medium text-[var(--accent-bright)]">
            <Send className="h-3.5 w-3.5" />
            {t.telegramCta.badge[lang]}
          </div>

          <h2 className="text-balance text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            {t.telegramCta.title[lang]}{" "}
            <span className="bg-gradient-to-r from-[var(--accent-bright)] to-[var(--gold-bright)] bg-clip-text text-transparent">
              {t.telegramCta.titleAccent[lang]}
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--text-secondary)]">
            {t.telegramCta.subtitle[lang]}
          </p>
        </Reveal>

        {/* Perks grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {perks.map((p, i) => {
            const Icon = ICONS[p.icon];
            return (
              <Reveal key={i} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-smooth hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-bright)]">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-[var(--text-primary)]">
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* CTA */}
        <Reveal className="mt-12 text-center" delay={120}>
          <button
            onClick={handleJoin}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#1c8bc3] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_-8px_rgba(34,158,217,0.6)] transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(34,158,217,0.8)] hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Send className="relative h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="relative">
              {clicked
                ? t.telegramCta.ctaLoading[lang]
                : t.telegramCta.cta[lang]}
            </span>
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            {t.telegramCta.note[lang]}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
