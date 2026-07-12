"use client";

import { ArrowLeft, Play, ShieldCheck, Zap, Star, Sparkles } from "lucide-react";
import { LiveDot } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";

export function MarketingHero() {
  const { lang, t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-base)]/40 to-[var(--bg-base)]" />
      {/* Glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "rgba(25,201,138,0.18)" }}
      />
      <div
        className="pointer-events-none absolute top-40 -right-40 h-[420px] w-[420px] rounded-full blur-[130px]"
        style={{ background: "rgba(245,177,78,0.1)" }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        {/* Copy */}
        <div className="text-center lg:text-right">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-medium text-[var(--accent-bright)]">
            <LiveDot active />
              {t.hero.badge[lang]}
          </div>

          <h1
            className="animate-fade-up mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            {t.hero.title1[lang]}
            <br />
            {t.hero.title2[lang]}{" "}
            <span
              style={{
                background:
                  "linear-gradient(120deg,#2ee9a8 0%,#19c98a 50%,#6ee7b7 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.hero.titleAccent[lang]}
            </span>{" "}
            {t.hero.titleSuffix[lang]}
          </h1>

          <p
            className="animate-fade-up mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] lg:mr-0"
            style={{ animationDelay: "140ms" }}
          >
            {t.hero.subtitle[lang]}
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            style={{ animationDelay: "220ms" }}
          >
            <a
              href="/auth"
              className="shine relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-8 text-base font-semibold text-[#04130d] shadow-[0_14px_40px_-10px_rgba(25,201,138,0.7)] transition-smooth hover:-translate-y-0.5 sm:w-auto"
            >
              {t.hero.ctaPrimary[lang]}
              <ArrowLeft className="h-5 w-5" />
            </a>
            <a
              href="#how"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-white/[0.02] px-8 text-base font-medium text-[var(--text-primary)] backdrop-blur-sm transition-smooth hover:bg-white/5 hover:-translate-y-0.5 sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" />
              {t.hero.ctaSecondary[lang]}
            </a>
          </div>

          {/* Trust row */}
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
            style={{ animationDelay: "300ms" }}
          >
            <TrustItem icon={<ShieldCheck className="h-4 w-4" />}>
              {t.hero.trustSecured[lang]}
            </TrustItem>
            <TrustItem icon={<Zap className="h-4 w-4" />}>{t.hero.trustInstant[lang]}</TrustItem>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["A", "M", "S", "K", "R"].map((c, i) => (
                  <span
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-base)] bg-[var(--bg-elevated)] text-[10px] font-bold text-[var(--text-secondary)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                <strong className="text-[var(--text-primary)]">4.9</strong> ·
                2,400+ {t.hero.trustRating[lang]}
              </span>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div
          className="animate-fade-up relative mx-auto w-full max-w-lg"
          style={{ animationDelay: "200ms" }}
        >
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-dim)] text-[var(--accent-bright)]">
        {icon}
      </span>
      {children}
    </div>
  );
}

/* ---- Floating preview that teases the dashboard ---- */
function HeroPreview() {
  const { lang, t } = useI18n();
  return (
    <div className="relative">
      {/* floating gold chip */}
      <div className="absolute -left-6 top-16 z-20 hidden animate-[floatGlow_7s_ease-in-out_infinite] rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]/90 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold-bright)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {t.hero.previewMonthlyProfit[lang]}
            </p>
            <p className="font-mono-nums text-sm font-bold text-[var(--gold-bright)]">
              +18.4%
            </p>
          </div>
        </div>
      </div>

      {/* floating winrate chip */}
      <div
        className="absolute -right-4 bottom-24 z-20 hidden animate-[floatGlow_7s_ease-in-out_infinite] rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]/90 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:block"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-bright)]">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {t.hero.previewWinrate[lang]}
            </p>
            <p className="font-mono-nums text-sm font-bold text-[var(--accent-bright)]">
              87.3%
            </p>
          </div>
        </div>
      </div>

      {/* main mini-terminal */}
      <a
        href="/auth"
        className="card group block cursor-pointer p-5 transition-smooth hover:-translate-y-1"
        style={{
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.9)",
        }}
      >
        {/* header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)]">
              <span className="font-mono-nums text-lg font-bold text-[#04130d]">
                W
              </span>
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Trading Terminal
              </p>
              <p className="flex items-center gap-1.5 text-xs text-[var(--accent-bright)]">
                <LiveDot active />
                LIVE · Engine v2.4.1
              </p>
            </div>
          </div>
        </div>

        {/* balance + mini chart */}
        <div className="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/60 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t.hero.previewBalance[lang]}</p>
              <p className="font-mono-nums mt-1 text-3xl font-bold text-[var(--text-primary)]">
                $48,920.55
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">{t.hero.previewDailyProfit[lang]}</p>
              <p className="font-mono-nums mt-1 text-lg font-bold text-[var(--accent-bright)]">
                +$1,284
              </p>
            </div>
          </div>

          <MiniEquity />
        </div>

        {/* open positions peek */}
        <div className="space-y-1.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t.hero.previewOpenPositions[lang]}
          </p>
          {[
            { p: "EUR/USD", s: "BUY", v: "+142.5", up: true },
            { p: "XAU/USD", s: "BUY", v: "+386.2", up: true },
            { p: "USD/JPY", s: "SELL", v: "+58.9", up: true },
            { p: "GBP/USD", s: "SELL", v: "-22.4", up: false },
          ].map((t) => (
            <div
              key={t.p}
              className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5 transition-smooth hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold " +
                    (t.s === "BUY"
                      ? "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                      : "bg-[var(--danger-dim)] text-[var(--danger)]")
                  }
                >
                  {t.s}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {t.p}
                </span>
              </div>
              <span
                className={
                  "font-mono-nums text-sm font-bold " +
                  (t.up
                    ? "text-[var(--accent-bright)]"
                    : "text-[var(--danger)]")
                }
              >
                {t.up ? "+" : ""}
                {t.v}
              </span>
            </div>
          ))}
        </div>

        {/* hover hint */}
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border-soft)] py-2.5 text-xs font-medium text-[var(--text-muted)] transition-smooth group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent-bright)]">
          {t.hero.previewOpenFull[lang]}
          <ArrowLeft className="h-3.5 w-3.5" />
        </div>
      </a>
    </div>
  );
}

function MiniEquity() {
  const data = [
    100, 104, 101, 108, 112, 109, 118, 122, 119, 128, 134, 131, 142, 148, 145,
    156,
  ];
  const w = 440;
  const h = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map(
    (d, i) =>
      [i * step, h - ((d - min) / range) * (h - 12) - 6] as [number, number],
  );
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 h-20 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mkt-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ee9a8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#2ee9a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mkt-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2ee9a8" />
          <stop offset="100%" stopColor="#ffc870" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mkt-area)" />
      <path
        d={line}
        fill="none"
        stroke="url(#mkt-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#ffc870" />
      <circle cx={last[0]} cy={last[1]} r="8" fill="#ffc870" fillOpacity="0.25">
        <animate
          attributeName="r"
          values="6;12;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          values="0.35;0;0.35"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
