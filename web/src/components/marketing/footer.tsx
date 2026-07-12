"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { Logo } from "@/components/ui/logo";
import { SmartLogo } from "@/components/ui/smart-logo";

type IconProps = { className?: string };

/**
 * Maps a footer link label to a real internal route when one exists.
 * Returns null for links that still point to "#" (not yet built).
 */
function footerLinkFor(label: string, lang: "ar" | "en"): string | null {
  const legal: Record<string, Record<string, string | null>> = {
    ar: {
      "الشروط": "/terms",
      "الخصوصية": "/privacy",
      "إخلاء المسؤولية": "/disclaimer",
      "ملفات الارتباط": null,
      "من نحن": "/about",
    },
    en: {
      Terms: "/terms",
      Privacy: "/privacy",
      Disclaimer: "/disclaimer",
      Cookies: null,
      About: "/about",
    },
  };
  return legal[lang]?.[label] ?? null;
}

const TelegramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const GithubIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const TELEGRAM_CHANNEL_URL = "https://t.me/+iXalBkHABfBkYWQ0";

const socials: { icon: (p: IconProps) => React.ReactElement; label: string; href: string }[] = [
  { icon: TelegramIcon, label: "Telegram", href: TELEGRAM_CHANNEL_URL },
  { icon: XIcon, label: "Twitter / X", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
  { icon: GithubIcon, label: "GitHub", href: "#" },
];

export function MarketingFooter() {
  const { lang, t } = useI18n();
  const columns = t.footer.columns[lang];
  return (
    <footer
      className="relative border-t border-[var(--border-subtle)]"
      style={{ background: "rgba(13,19,22,0.4)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <SmartLogo height={34} priority />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              {t.footer.tagline[lang]}
            </p>
            {/* Join Telegram Community button */}
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white transition-smooth hover:-translate-y-0.5 hover:bg-[#2aabee]"
            >
              <Send className="h-4 w-4" />
              {t.footer.joinTelegram[lang]}
            </a>
            <div className="mt-3 flex gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-smooth hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:text-[var(--accent-bright)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => {
                  const href = footerLinkFor(l, lang);
                  return (
                    <li key={l}>
                      {href ? (
                        <Link
                          href={href}
                          className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                        >
                          {l}
                        </Link>
                      ) : (
                        <a
                          href="#"
                          className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                        >
                          {l}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-7 text-center sm:flex-row sm:text-right">
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 W Forex Bot. {t.footer.rights[lang]}
          </p>
          <p className="max-w-2xl text-xs leading-relaxed text-[var(--text-muted)]">
            {t.footer.riskNote[lang]}
          </p>
        </div>
      </div>
    </footer>
  );
}
