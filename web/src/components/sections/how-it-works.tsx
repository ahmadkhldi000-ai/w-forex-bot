"use client";

import { UserPlus, Settings2, Rocket, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "أنشئ حسابك",
    desc: "سجّل في دقيقة واحدة واربط حساب الوساطع لديك (MT4 / MT5 / cTrader) بأمان كامل.",
  },
  {
    icon: Settings2,
    step: "02",
    title: "اضبط استراتيجيتك",
    desc: "اختر مستوى المخاطرة، الأزواج المطلوبة، وأحجام الصفقات. أو استخدم الإعدادات الافتراضية المثلى.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "فعّل البوت",
    desc: "ابدأ التداول الآلي بضغطة زر. يراقب البوت السوق وينفّذ الصفقات على مدار الساعة.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "راقب أرباحك",
    desc: "تابع الأداء اللحظي عبر لوحة المعلومات، واستلم تقارير مفصّلة وتنبيهات فورية.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge tone="emerald" className="mb-5">
            كيف يعمل
          </Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            جاهز للانطلاق في
            <span className="text-gradient-emerald"> 4 خطوات</span>
          </h2>
          <p className="mt-5 text-lg text-fg-muted text-pretty">
            من التسجيل إلى أول صفقة آلية في أقل من 5 دقائق. بدون خبرة برمجية.
          </p>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block" />

          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 100} className="relative">
              <div className="group relative h-full rounded-2xl glass p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-border-strong">
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-bright to-emerald-deep shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]">
                  <s.icon className="h-7 w-7 text-[#04130d]" strokeWidth={2} />
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
                </div>
                <span className="absolute right-5 top-5 text-3xl font-bold text-white/5 transition-colors group-hover:text-emerald/20">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-fg">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
