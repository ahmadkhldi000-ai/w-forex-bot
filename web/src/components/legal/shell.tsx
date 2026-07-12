"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n/provider";

interface LegalShellProps {
  /** Localized { ar, en } title */
  title: { ar: string; en: string };
  /** Localized intro paragraph */
  intro: { ar: string; en: string };
  /** Last-updated date string */
  updated?: string;
  children: ReactNode;
}

/**
 * Shared layout for all legal / informational pages.
 * Provides the marketing navbar + footer, a hero header with the title,
 * and a prose-friendly content container. RTL-aware via <html dir>.
 */
export function LegalShell({ title, intro, updated, children }: LegalShellProps) {
  const { lang, t } = useI18n();
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <MarketingNav />
      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] py-16 lg:py-20">
          {/* subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(25,201,138,0.08) 0%, transparent 70%)",
            }}
          />
          <Container className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <BackIcon className="h-4 w-4" />
              {t.legal.backHome[lang]}
            </Link>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              {title[lang]}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
              {intro[lang]}
            </p>
            {updated && (
              <p className="mt-5 text-xs text-[var(--text-muted)]">
                {t.legal.lastUpdated[lang]}: {updated}
              </p>
            )}
          </Container>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-16">
          <Container className="max-w-3xl">
            <div className="legal-prose space-y-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {children}
            </div>
          </Container>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}

/* ---------- Reusable building blocks for legal content ---------- */

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ms-5 list-disc space-y-2 marker:text-[var(--accent)]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
