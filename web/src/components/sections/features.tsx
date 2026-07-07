"use client";

import {
  Bot,
  ShieldCheck,
  Gauge,
  LineChart,
  Bell,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

type Tone = "emerald" | "gold";

const features: {
  icon: typeof Bot;
  title: string;
  desc: string;
  tone: Tone;
}[] = [
  {
    icon: Bot,
    title: "ذكاء اصطناعي تنبؤي",
    desc: "نماذج تعلّم آلي تحلّل آلاف الأنماط والشموع اليابانية لحظياً لتحديد نقاط الدخول والخروج المثلى.",
    tone: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "إدارة مخاطر صارمة",
    desc: "وقف خسائر تلقائي، تحديد حجم الصفقة حسب رأس المال، وحماية كاملة من تقلّبات السوق المفاجئة.",
    tone: "gold",
  },
  {
    icon: Gauge,
    title: "تنفيذ بسرعة البرق",
    desc: "محرك تنفيذ يقل عن 40 مللي ثانية مع ربط مباشر بالسيولة لضمان أفضل الأسعار وأقل انزلاق.",
    tone: "emerald",
  },
  {
    icon: LineChart,
    title: "تحليل متعدد الأطر الزمنية",
    desc: "يفحص البوت 9 أطر زمنية في وقت واحد من دقيقة واحدة إلى يومي لتأكيد الاتجاه قبل التنفيذ.",
    tone: "gold",
  },
  {
    icon: Bell,
    title: "تنبيهات فورية",
    desc: "إشعارات على تيليجرام والبريد لكل صفقة منفّذة، مع تقارير أداء يومية وأسبوعية مفصّلة.",
    tone: "emerald",
  },
  {
    icon: Wallet,
    title: "ربط وساطع متعدد",
    desc: "يعمل مع MT4 / MT5 / cTrader وأكثر من 40 وسيطاً، مع دعم حسابات تجريبية وحقيقية.",
    tone: "gold",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="pointer-events-none absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-emerald/10 blur-[120px]" />
      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge tone="emerald" className="mb-5">
            الميزات
          </Badge>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            كل ما تحتاجه لتتداول
            <span className="text-gradient-emerald"> كالمحترفين</span>
          </h2>
          <p className="mt-5 text-lg text-fg-muted text-pretty">
            منصّة متكاملة تجمع بين قوة الذكاء الاصطناعي ودقّة التحليل الفني
            وسرعة التنفيذ المؤتمت.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: typeof Bot;
  title: string;
  desc: string;
  tone: Tone;
}) {
  const accent =
    tone === "emerald"
      ? "from-emerald-bright/20 to-emerald-deep/5 text-emerald-bright group-hover:shadow-[0_0_30px_-6px_rgba(16,185,129,0.5)]"
      : "from-gold-bright/20 to-gold-deep/5 text-gold-bright group-hover:shadow-[0_0_30px_-6px_rgba(245,185,66,0.5)]";
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl glass p-7 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.02] transition-transform duration-500 group-hover:scale-150" />
      <span
        className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} transition-all duration-300`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <h3 className="relative text-lg font-bold text-fg">{title}</h3>
      <p className="relative mt-2.5 text-sm leading-relaxed text-fg-muted">
        {desc}
      </p>
    </div>
  );
}
