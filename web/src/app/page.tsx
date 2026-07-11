import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingTicker } from "@/components/marketing/ticker";
import { MarketingStats } from "@/components/marketing/stats";
import { MarketingFeatures } from "@/components/marketing/features";
import { MarketingStrategy } from "@/components/marketing/strategy";
import { MarketingHow } from "@/components/marketing/how";
import { MarketingPricing } from "@/components/marketing/pricing";
import { MarketingTestimonials } from "@/components/marketing/testimonials";
import { TelegramCTA } from "@/components/marketing/telegram-cta";
import { MarketingCta } from "@/components/marketing/cta";
import { RiskDisclaimer } from "@/components/marketing/risk-disclaimer";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <>
      <MarketingNav />
      <main className="relative overflow-hidden">
        <MarketingHero />
        <MarketingTicker />
        <MarketingStats />
        <MarketingFeatures />
        <MarketingStrategy />
        <MarketingHow />
        <MarketingPricing />
        <MarketingTestimonials />
        <TelegramCTA />
        <MarketingCta />
        <RiskDisclaimer />
      </main>
      <MarketingFooter />
    </>
  );
}
