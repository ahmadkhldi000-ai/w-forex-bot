"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { useI18n } from "@/lib/i18n/provider";
import { LangToggle } from "./lang-toggle";

export function RiskDisclaimer() {
  const { lang, dir, t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="disclaimer" className="relative py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--danger-dim)] to-transparent" />
      <Container className="relative">
        <Reveal>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--danger)]/25 bg-[var(--bg-surface)]/80 backdrop-blur">
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--danger)]/20 bg-[var(--danger-dim)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--danger)]/20 text-[var(--danger)]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    {t.disclaimer.badge[lang]}
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {t.disclaimer.subtitle[lang]}
                  </p>
                </div>
              </div>
              <LangToggle variant="compact" />
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
                <p
                  className="text-[13px] leading-relaxed text-[var(--text-secondary)]"
                  dir={dir}
                >
                  {t.disclaimer.body[lang]}
                </p>
              </div>

              {/* Expandable details */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-bright)] transition-smooth hover:text-[var(--accent)]"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
                {expanded
                  ? t.disclaimer.readLess[lang]
                  : t.disclaimer.readMore[lang]}
              </button>

              {expanded && (
                <div
                  className="mt-4 space-y-2.5 border-r-2 border-[var(--danger)]/30 pr-4 text-[12px] leading-relaxed text-[var(--text-muted)]"
                  dir={dir}
                >
                  {t.disclaimer.details[lang].map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
