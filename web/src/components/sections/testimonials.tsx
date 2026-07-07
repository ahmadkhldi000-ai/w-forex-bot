"use client";

import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "أحمد المالكي",
    role: "متداول全职 · دبي",
    avatar: "أ",
    tone: "emerald",
    rating: 5,
    text: "بعد سنوات من التداول اليدوي المتعب، أصبح W Forex Bot يدير محفظتي بالكامل. النتائج فاقت توقعاتي — عائد ثابت شهر بعد شهر.",
  },
  {
    name: "Sarah Lindqvist",
    role: "مديرة محفظة · ستوكهولم",
    avatar: "S",
    tone: "gold",
    rating: 5,
    text: "إدارة المخاطر فيه ممتازة. التراجع منخفض جداً مقارنة بأي بوت آخر جرّبته. لوحة التحكم احترافية والتنبيهات فورية.",
  },
  {
    name: "خالد العتيبي",
    role: "متداول part-time · الرياض",
    avatar: "خ",
    tone: "emerald",
    rating: 5,
    text: "أعمل وظيفة كاملة ولا أملك وقتاً للمتابعة. البوت يتداول لي ليلاً ونهاراً وأستيقظ على أرباح ثابتة. لا أصدق الفرق.",
  },
  {
    name: "Marcus Chen",
    role: "مستثمر · سنغافورة",
    avatar: "M",
    tone: "gold",
    rating: 5,
    text: "Integration مع MT5 كان سلساً والدعم الفني محترف جداً. أعدت ضبط الاستراتيجية على مخاطرة 1% وحققت نتائج رائعة.",
  },
  {
    name: "نورة القحطاني",
    role: "مبتدئة · جدة",
    avatar: "ن",
    tone: "emerald",
    rating: 5,
    text: "كنت خائفة من الفوركس، لكن النسخة التجريبية علّمتني كثيراً. الآن أتداول بثقة على حساب حقيقي وأرى أرباحاً حقيقية.",
  },
  {
    name: "Diego Fernández",
    role: "Crypto + Forex · مدريد",
    avatar: "D",
    tone: "gold",
    rating: 5,
    text: "أحسن بوت جرّبته على الإطلاق. يغطي الفوركس والذهب وحتى الكريبتو بذكاء. تقارير الأداء اليومية مفصّلة وواضحة.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gold/8 blur-[130px]" />
      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge tone="gold" className="mb-5">
            آراء العملاء
          </Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            يثق بنا أكثر من
            <span className="text-gradient-gold"> 2,400 متداول</span>
          </h2>
          <p className="mt-5 text-lg text-fg-muted text-pretty">
            انضم لمجتمع المتداولين الذكيين الذين يحقّقون نتائج ثابتة يومياً.
          </p>
        </Reveal>

        <div className="mt-16 columns-1 gap-5 md:columns-2 lg:columns-3 [column-fill:_balance]">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90} className="mb-5 break-inside-avoid">
              <figure className="group relative rounded-2xl glass p-6 transition-all duration-300 hover:border-border-strong hover:bg-surface-2">
                <Quote
                  className={`absolute left-6 top-6 h-8 w-8 opacity-10 ${
                    t.tone === "emerald" ? "text-emerald-bright" : "text-gold-bright"
                  }`}
                />
                <div className="relative flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="relative mt-4 text-sm leading-relaxed text-fg-muted">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      t.tone === "emerald"
                        ? "bg-emerald/15 text-emerald-bright"
                        : "bg-gold/15 text-gold-bright"
                    }`}
                  >
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-fg">{t.name}</p>
                    <p className="text-xs text-fg-dim">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
