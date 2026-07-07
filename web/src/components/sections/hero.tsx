"use client";

import { ArrowRight, Play, ShieldCheck, Zap, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingCard } from "./trading-card";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
      {/* Backgrounds */}
      <div className="pointer-events-none absolute inset-0 bg-grid animate-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/30 to-bg" />
      {/* Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-40 -right-40 h-[420px] w-[420px] rounded-full bg-gold/10 blur-[130px]" />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="text-center lg:text-right">
            <div className="animate-rise inline-flex">
              <Badge tone="emerald" className="mb-6 px-4 py-1.5">
                <span className="relative mr-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-bright" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-bright" />
                </span>
                متصل الآن · يتداول على 12 زوجًا
              </Badge>
            </div>

            <h1
              className="animate-rise text-balance text-5xl font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "60ms" }}
            >
              تداول الفوركس
              <br />
              بذكاء <span className="text-gradient-emerald">آلي</span> متقدم
            </h1>

            <p
              className="animate-rise mx-auto lg:mr-0 mt-7 max-w-xl text-lg leading-relaxed text-fg-muted text-pretty"
              style={{ animationDelay: "140ms" }}
            >
              روبوت تداول مؤتمت بالكامل يحلل السوق على مدار الساعة، ينفّذ صفقات
              بدقّة عالية، ويحمي رأس مالك بإدارة مخاطر صارمة. بدون عواطف، فقط
              نتائج.
            </p>

            <div
              className="animate-rise mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: "220ms" }}
            >
              <Button size="lg" className="w-full sm:w-auto">
                ابدأ التداول الآن
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Play className="h-4 w-4 fill-current" />
                شاهد العرض
              </Button>
            </div>

            {/* Trust row */}
            <div
              className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
              style={{ animationDelay: "300ms" }}
            >
              <TrustItem icon={<ShieldCheck className="h-4 w-4" />}>
                أموالك مؤمّنة
              </TrustItem>
              <TrustItem icon={<Zap className="h-4 w-4" />}>
                تنفيذ فوري
              </TrustItem>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-gradient-to-br from-surface-2 to-surface text-[10px] font-bold text-fg-muted"
                    >
                      {["A", "M", "S", "K", "R"][i]}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-sm text-fg-muted">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <strong className="text-fg">4.9</strong> · 2,400+ متداول
                </span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div
            className="animate-rise relative mx-auto w-full max-w-lg"
            style={{ animationDelay: "200ms" }}
          >
            <TradingCard />
          </div>
        </div>
      </Container>
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
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald/10 text-emerald-bright">
        {icon}
      </span>
      {children}
    </div>
  );
}


