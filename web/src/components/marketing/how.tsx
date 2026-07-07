import { UserPlus, Settings2, Rocket, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, GradientAccent } from "./features";

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

export function MarketingHow() {
  return (
    <section id="how" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="accent">كيف يعمل</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            جاهز للانطلاق في
            <GradientAccent> 4 خطوات</GradientAccent>
          </h2>
          <p className="mt-5 text-lg text-[var(--text-secondary)]">
            من التسجيل إلى أول صفقة آلية في أقل من 5 دقائق. بدون خبرة برمجية.
          </p>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent lg:block" />

          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 100} className="relative">
              <div className="card group h-full p-7 text-center transition-smooth hover:-translate-y-1.5">
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bright)] to-[var(--accent)] shadow-[0_10px_30px_-8px_rgba(25,201,138,0.6)]">
                  <s.icon className="h-7 w-7 text-[#04130d]" strokeWidth={2} />
                </div>
                <span className="font-mono-nums absolute right-5 top-5 text-3xl font-bold text-white/5 transition-colors group-hover:text-[var(--accent)]/20">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
