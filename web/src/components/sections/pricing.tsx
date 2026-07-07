"use client";

import { Check, Sparkles, Crown, Rocket } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    icon: Rocket,
    price: "$0",
    period: "مجاناً",
    desc: "للتجربة والتعلّم على حساب تجريبي.",
    cta: "ابدأ مجاناً",
    variant: "secondary" as const,
    featured: false,
    features: [
      "حساب تجريبي غير محدود",
      "زوجان من العملات",
      "إعدادات مخاطرة أساسية",
      "تنبيهات تيليجرام",
      "دعم عبر المجتمع",
    ],
  },
  {
    name: "Pro",
    icon: Sparkles,
    price: "$49",
    period: "/ شهرياً",
    desc: "للمتداولين الجادّين الباحثين عن عوائد.",
    cta: "اشترك الآن",
    variant: "primary" as const,
    featured: true,
    features: [
      "حساب حقيقي حتى $50k",
      "كل أزواج الفوركس + الذهب",
      "استراتيجيات AI متقدمة",
      "إدارة مخاطر ديناميكية",
      "لوحة تحليلات كاملة",
      "دعم أولوية 24/7",
    ],
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "حسب الطلب",
    period: "",
    desc: "للصناديق والمتداولين بكابات كبيرة.",
    cta: "تواصل معنا",
    variant: "gold" as const,
    featured: false,
    features: [
      "رصيد غير محدود",
      "استراتيجيات مخصّصة",
      "API كامل + Webhooks",
      "مدير حساب مخصّص",
      "تقارير بيانية متقدمة",
      "SLA وضمانات تشغيل",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[140px]" />
      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge tone="emerald" className="mb-5">
            الأسعار
          </Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            أسعار شفّافة، <span className="text-gradient-emerald">قيمة حقيقية</span>
          </h2>
          <p className="mt-5 text-lg text-fg-muted text-pretty">
            ابدأ مجاناً وارتقِ عندما تكون جاهزاً. بدون عقود، إلغاء في أي وقت.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 110} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl p-8 transition-all duration-300",
                  p.featured
                    ? "glass-strong ring-2 ring-emerald/40 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.5)] lg:-translate-y-3"
                    : "glass hover:-translate-y-1 hover:border-border-strong",
                )}
              >
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge tone="emerald" className="px-4 py-1.5 shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      الأكثر شيوعاً
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      p.featured
                        ? "bg-gradient-to-br from-emerald-bright to-emerald-deep text-[#04130d]"
                        : "bg-white/5 text-fg-muted",
                    )}
                  >
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-fg">{p.name}</h3>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-fg tabular">{p.price}</span>
                  <span className="text-sm text-fg-muted">{p.period}</span>
                </div>
                <p className="mt-2 text-sm text-fg-muted">{p.desc}</p>

                <div className="my-7 h-px bg-border" />

                <ul className="flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-fg-muted">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          p.featured ? "bg-emerald/15 text-emerald-bright" : "bg-white/5 text-fg-muted",
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant={p.variant} className="mt-8 w-full" size="lg">
                  {p.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
