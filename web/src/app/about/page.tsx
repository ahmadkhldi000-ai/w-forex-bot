"use client";

import { LegalShell, LegalSection, LegalP } from "@/components/legal/shell";
import { useI18n } from "@/lib/i18n/provider";
import { dictionary } from "@/lib/i18n/dictionary";
import { ShieldCheck, Cpu, Globe, TrendingUp } from "lucide-react";

const d = dictionary.legal.about;

export default function AboutPage() {
  const { lang } = useI18n();

  const isAr = lang === "ar";

  const values = [
    {
      icon: Cpu,
      title: isAr ? "تقنية متقدمة" : "Advanced Technology",
      desc: isAr
        ? "محرك تحليل يعمل بالذكاء الاصطناعي يدرس السوق على مدار الساعة."
        : "An AI-powered analysis engine studying the market around the clock.",
    },
    {
      icon: ShieldCheck,
      title: isAr ? "إدارة مخاطر صارمة" : "Strict Risk Management",
      desc: isAr
        ? "حماية رأس المال أولوية قصوى، بآليات وقف خسائر تلقائية."
        : "Capital protection is paramount, with automatic stop-loss mechanisms.",
    },
    {
      icon: TrendingUp,
      title: isAr ? "أداء شفّاف" : "Transparent Performance",
      desc: isAr
        ? "نتائج حقيقية مباشرة من حساب MT5، بلا أرقام وهمية."
        : "Real-time results from the MT5 account — no fabricated numbers.",
    },
    {
      icon: Globe,
      title: isAr ? "ثنائية اللغة" : "Bilingual by Design",
      desc: isAr
        ? "منصة مُصمّمة للمتداولين العرب والعالميين على حدّ سواء."
        : "A platform built for both Arab and global traders alike.",
    },
  ];

  return (
    <LegalShell
      title={d.title}
      intro={d.intro}
      updated="July 12, 2026"
    >
      {/* Mission */}
      <LegalSection title={isAr ? "رسالتنا" : "Our Mission"}>
        <LegalP>
          {isAr
            ? "WForexBot هي منصة تداول ذكية تعمل بالذكاء الاصطناعي، صُمّمت لتمكين المتداولين من تحقيق نتائج ثابتة في سوق الفوركس. نمتلك إيماناً راسخاً بأن الت disciplinـنظيم والبيانات الموضوعية — لا العواطف — هي مفتاح النجاح طويل الأمد في الأسواق المالية."
            : "WForexBot is an AI-powered smart trading platform designed to help traders achieve consistent results in the forex market. We firmly believe that discipline and objective data — not emotions — are the key to long-term success in financial markets."}
        </LegalP>
      </LegalSection>

      {/* Values grid */}
      <section className="pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-smooth hover:border-[var(--accent)]/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-bright)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                  {v.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <LegalSection title={isAr ? "كيف نعمل" : "How We Work"}>
        <LegalP>
          {isAr
            ? "نربط منصتنا بحساب MetaTrader 5 الرئيسي، فتتدفّق البيانات الحقيقية مباشرةً إلى لوحة التحكم: الأسعار، الصفقات المفتوحة، الرصيد، والأداء. لا نستخدم بيانات وهمية أو عشوائية — كل رقم تراه مصدره السوق الفعلي."
            : "We connect the platform to a master MetaTrader 5 account, so real data flows directly into the dashboard: prices, open trades, balance, and performance. We use no mock or random data — every number you see originates from the actual market."}
        </LegalP>
      </LegalSection>

      <LegalSection title={isAr ? "التزامنا تجاهك" : "Our Commitment to You"}>
        <LegalP>
          {isAr
            ? "نلتزم بالشفافية الكاملة حول المخاطر. التداول في الفوركس ينطوي على مخاطر حقيقية، ولا نَعِد بأرباح مضمونة. أداتنا تساعدك على اتخاذ قرارات أكثر استنارة، لكن القرار النهائي والمسؤولية يبقيان لك وحدك."
            : "We are committed to full transparency about risk. Forex trading carries real risk, and we make no promise of guaranteed profits. Our tool helps you make more informed decisions, but the final decision and responsibility remain yours alone."}
        </LegalP>
      </LegalSection>
    </LegalShell>
  );
}
