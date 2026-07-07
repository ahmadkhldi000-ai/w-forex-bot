import { ArrowLeft, Check } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { GradientAccent } from "./features";

const perks = ["بدون بطاقة ائتمان", "إلغاء في أي وقت", "دعم 24/7"];

export function MarketingCta() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-strong)] p-10 text-center sm:p-16"
            style={{
              background:
                "linear-gradient(160deg, var(--bg-elevated), var(--bg-base))",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full blur-[120px]"
              style={{ background: "rgba(25,201,138,0.22)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 right-0 h-[300px] w-[300px] rounded-full blur-[110px]"
              style={{ background: "rgba(245,177,78,0.14)" }}
            />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                جاهز لتتداول
                <GradientAccent> بذكاء</GradientAccent>؟
              </h2>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                انضم اليوم لأكثر من 2,400 متداول يحقّقون عوائد ثابتة مع W Forex
                Bot. ابدأ مجاناً، بدون مخاطرة.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="/dashboard"
                  className="shine relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-[var(--accent-bright)] to-[var(--accent)] px-8 text-base font-semibold text-[#04130d] shadow-[0_14px_40px_-10px_rgba(25,201,138,0.7)] transition-smooth hover:-translate-y-0.5 sm:w-auto"
                >
                  افتح لوحة التحكم الآن
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {perks.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="h-4 w-4 text-[var(--accent-bright)]" />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
