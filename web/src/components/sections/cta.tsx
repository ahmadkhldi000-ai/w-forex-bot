"use client";

import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

const perks = ["بدون بطاقة ائتمان", "إلغاء في أي وقت", "دعم 24/7"];

export function CTA() {
  return (
    <section className="relative py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border-strong bg-gradient-to-br from-surface-2 via-bg-elev to-bg p-10 text-center sm:p-16">
            {/* Decorative */}
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-emerald/25 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 right-0 h-[300px] w-[300px] rounded-full bg-gold/15 blur-[110px]" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl">
                جاهز لتتداول
                <span className="text-gradient-emerald"> بذكاء</span>؟
              </h2>
              <p className="mt-5 text-lg text-fg-muted text-pretty">
                انضم اليوم لأكثر من 2,400 متداول يحقّقون عوائد ثابتة مع W Forex
                Bot. ابدأ مجاناً، بدون مخاطرة.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto">
                  أنشئ حسابك المجاني
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </Button>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  تحدّث مع المبيعات
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {perks.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1.5 text-sm text-fg-muted"
                  >
                    <Check className="h-4 w-4 text-emerald-bright" />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
