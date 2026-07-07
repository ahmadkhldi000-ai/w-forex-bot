"use client";

import { Check, Cpu, BarChart3, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    icon: Cpu,
    title: "محرك القرار",
    points: [
      "تحليل 9 أطر زمنية متزامنة",
      "كشف أنماط الشموع اليابانية بالـ AI",
      "فلتر أخبار اقتصادية لحظي",
      "تأكيد الإشارة قبل التنفيذ",
    ],
  },
  {
    icon: BarChart3,
    title: "نموذج الأداء",
    points: [
      "متوسط ربح شهري 12–18%",
      "عامل ربح 2.4× (Profit Factor)",
      "أقصى تراجع تاريخي 8.3%",
      "Sharpe Ratio 1.92",
    ],
  },
  {
    icon: Lock,
    title: "طبقات الحماية",
    points: [
      "وقف خسائر ديناميكي ATR",
      "تحجيم الصفقة حسب المخاطرة 1%",
      "إيقاف تلقائي عند 3 خسائر متتالية",
      "هيدج تلقائي عند التقلّب العالي",
    ],
  },
];

export function Strategy() {
  return (
    <section id="strategy" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute top-20 right-0 h-[420px] w-[420px] rounded-full bg-gold/8 blur-[130px]" />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left: copy */}
          <Reveal>
            <Badge tone="gold" className="mb-5">
              الاستراتيجية
            </Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
              استراتيجية مدعومة بالبيانات،
              <br />
              <span className="text-gradient-gold">لا بالحدس</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fg-muted text-pretty">
              مبنيّة على أكثر من 8 سنوات من بيانات الفوركس التاريخية، تجمع
              استراتيجيتنا بين ثلاثة أعمدة رئيسية لتحقيق عوائد ثابتة مع حماية
              رأس المال في كل صفقة.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Backtested 8yrs", "Low Drawdown", "MT5 Native", "Risk 1%"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </Reveal>

          {/* Right: pillar cards */}
          <div className="grid gap-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="group flex gap-5 rounded-2xl glass p-6 transition-all duration-300 hover:border-border-strong hover:bg-surface-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-bright/20 to-gold-deep/5 text-gold-bright transition-all duration-300 group-hover:shadow-[0_0_28px_-6px_rgba(245,185,66,0.5)]">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-fg">{p.title}</h3>
                    <ul className="mt-3 grid gap-2">
                      {p.points.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-start gap-2 text-sm text-fg-muted"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-bright" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
