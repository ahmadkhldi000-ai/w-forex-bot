import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: "$12.4M+", label: "حجم التداول الشهري", gold: false },
  { value: "87.3%", label: "نسبة الصفقات الرابحة", gold: true },
  { value: "<40ms", label: "سرعة التنفيذ", gold: false },
  { value: "24/7", label: "تداول بلا توقف", gold: true },
];

export function MarketingStats() {
  return (
    <section
      className="border-y border-[var(--border-subtle)] py-16"
      style={{ background: "rgba(13,19,22,0.4)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-[var(--border-subtle)] lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="px-6 py-10 text-center lg:py-12"
              style={{ background: "var(--bg-surface)" }}
            >
              <p
                className="font-mono-nums text-4xl font-bold tracking-tight lg:text-5xl"
                style={{
                  background: s.gold
                    ? "linear-gradient(120deg,#ffc870,#f5b14e 60%,#fcd34d)"
                    : "linear-gradient(120deg,#2ee9a8,#19c98a 60%,#6ee7b7)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
