import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientGold } from "./features";

const testimonials = [
  {
    name: "أحمد المالكي",
    role: "متداول全职 · دبي",
    avatar: "أ",
    gold: false,
    text: "بعد سنوات من التداول اليدوي المتعب، أصبح W Forex Bot يدير محفظتي بالكامل. النتائج فاقت توقعاتي — عائد ثابت شهر بعد شهر.",
  },
  {
    name: "Sarah Lindqvist",
    role: "مديرة محفظة · ستوكهولم",
    avatar: "S",
    gold: true,
    text: "إدارة المخاطر فيه ممتازة. التراجع منخفض جداً مقارنة بأي بوت آخر جرّبته. لوحة التحكم احترافية والتنبيهات فورية.",
  },
  {
    name: "خالد العتيبي",
    role: "متداول part-time · الرياض",
    avatar: "خ",
    gold: false,
    text: "أعمل وظيفة كاملة ولا أملك وقتاً للمتابعة. البوت يتداول لي ليلاً ونهاراً وأستيقظ على أرباح ثابتة. لا أصدق الفرق.",
  },
  {
    name: "Marcus Chen",
    role: "مستثمر · سنغافورة",
    avatar: "M",
    gold: true,
    text: "الربط مع MT5 كان سلساً والدعم الفني محترف جداً. أعدت ضبط الاستراتيجية على مخاطرة 1% وحققت نتائج رائعة.",
  },
  {
    name: "نورة القحطاني",
    role: "مبتدئة · جدة",
    avatar: "ن",
    gold: false,
    text: "كنت خائفة من الفوركس، لكن النسخة التجريبية علّمتني كثيراً. الآن أتداول بثقة على حساب حقيقي وأرى أرباحاً حقيقية.",
  },
  {
    name: "Diego Fernández",
    role: "Crypto + Forex · مدريد",
    avatar: "D",
    gold: true,
    text: "أحسن بوت جرّبته على الإطلاق. يغطي الفوركس والذهب وحتى الكريبتو بذكاء. تقارير الأداء اليومية مفصّلة وواضحة.",
  },
];

export function MarketingTestimonials() {
  return (
    <section id="testimonials" className="relative py-28">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "rgba(245,177,78,0.08)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="gold">آراء العملاء</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            يثق بنا أكثر من
            <GradientGold> 2,400 متداول</GradientGold>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            انضم لمجتمع المتداولين الذكيين الذين يحقّقون نتائج ثابتة يومياً.
          </p>
        </Reveal>

        <div className="mt-16 columns-1 gap-5 md:columns-2 lg:columns-3 [column-fill:_balance]">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={(i % 3) * 90}
              className="mb-5 break-inside-avoid"
            >
              <figure className="card group p-6 transition-smooth hover:bg-[var(--bg-hover)]">
                <Quote
                  className="h-8 w-8 opacity-10"
                  style={{
                    color: t.gold ? "var(--gold-bright)" : "var(--accent-bright)",
                  }}
                />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={
                      t.gold
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
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
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
