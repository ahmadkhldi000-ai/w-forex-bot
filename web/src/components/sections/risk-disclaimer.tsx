"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, ChevronDown, Languages } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function RiskDisclaimer() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
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
                    {lang === "ar" ? "تحذير المخاطر" : "Risk Warning"}
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {lang === "ar"
                      ? "إقرار قانوني إلزامي — اقرأ بعناية"
                      : "Mandatory legal disclosure — please read carefully"}
                  </p>
                </div>
              </div>

              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                dir={lang === "ar" ? "ltr" : "rtl"}
              >
                <Languages className="h-3.5 w-3.5" />
                {lang === "ar" ? "English" : "العربية"}
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
                <p
                  className="text-[13px] leading-relaxed text-[var(--text-secondary)]"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {lang === "ar"
                    ? "التداول في الأسواق المالية (الفوركس، العملات الرقمية، وعقود الفروقات CFDs) ينطوي على مخاطر عالية وقد يؤدي إلى فقدان جزء كبير أو كامل من رأس المال المستثمر. الأداء السابق للبوت أو المنصة ليس ضماناً للنتائج المستقبلية. جميع قرارات التداول هي مسؤولية المستخدم وحده، وتعمل المنصة فقط كأداة عرض ونسخ للصفقات ولا تقدم استشارات استثمارية مخصصة."
                    : "Trading in financial markets (Forex, cryptocurrencies, and CFDs) involves high risk and may result in the loss of a substantial portion or all of your invested capital. Past performance of the bot or platform is not a guarantee of future results. All trading decisions are the sole responsibility of the user, and the platform acts only as a display and copy trading tool and does not provide personalized investment advice."}
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
                {lang === "ar"
                  ? expanded
                    ? "إخفاء التفاصيل"
                    : "قراءة التفاصيل الكاملة"
                  : expanded
                  ? "Hide full details"
                  : "Read full details"}
              </button>

              {expanded && (
                <div
                  className="mt-4 space-y-2.5 border-r-2 border-[var(--danger)]/30 pr-4 text-[12px] leading-relaxed text-[var(--text-muted)]"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  <p>
                    {lang === "ar"
                      ? "• الرافعة المالية تضخّم الأرباح والخسائر على حدٍ سواء، وقد تؤدي لخسارة كاملة للحساب في فترات قصيرة."
                      : "• Leverage amplifies both gains and losses, and may lead to a complete account wipeout in short timeframes."}
                  </p>
                  <p>
                    {lang === "ar"
                      ? "• ما بين 70% إلى 90% من حسابات التجزئة تخسر أموالها عند تداول عقود الفروقات."
                      : "• Between 70% and 90% of retail investor accounts lose money when trading CFDs."}
                  </p>
                  <p>
                    {lang === "ar"
                      ? "• لا ت invest أكثر مما يمكنك تحمل خسارته، واستشر مستشاراً مالياً مرخصاً عند الحاجة."
                      : "• Never invest more than you can afford to lose, and consult a licensed financial advisor when needed."}
                  </p>
                  <p>
                    {lang === "ar"
                      ? "• بإنشائك حساباً أو تفعيلك لخدمة نسخ الصفقات، فإنك تقرّ بموافقتك على هذا التحذير ويتم تسجيل وقت وقبول الإقرار في سجلات النظام."
                      : "• By creating an account or activating the copy trading service, you acknowledge this warning, and your consent timestamp is recorded in our audit logs."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
