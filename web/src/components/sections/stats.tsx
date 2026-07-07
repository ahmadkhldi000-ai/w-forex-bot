import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: "$12.4M+", label: "حجم التداول الشهري", tone: "emerald" },
  { value: "87.3%", label: "نسبة الصفقات الرابحة", tone: "gold" },
  { value: "<40ms", label: "سرعة التنفيذ", tone: "emerald" },
  { value: "24/7", label: "تداول بلا توقف", tone: "gold" },
] as const;

export function Stats() {
  return (
    <section className="relative py-16 border-y border-border bg-bg-elev/40">
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border/60 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="bg-surface px-6 py-10 text-center lg:py-12"
            >
              <p
                className={`text-4xl font-bold tracking-tight tabular lg:text-5xl ${
                  s.tone === "emerald" ? "text-gradient-emerald" : "text-gradient-gold"
                }`}
              >
                {s.value}
              </p>
              <p className="mt-2 text-sm text-fg-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
