"use client";

import useTranslations from "@/hooks/useTranslations";
import { useTheme } from "next-themes";
import { usePricingCalculator } from "@/hooks/usePricingCalculator";
import BillingCycleToggle from "./BillingCycleToggle";
import PricingCard from "./PricingCard";
import type { AppSettings } from "@/lib/appConfig";

interface PricingSectionProps {
  settings: AppSettings | null;
}

/**
 * PricingSection - Section displaying pricing information
 * Uses a solid background in light mode and transparent in dark mode
 */
const PricingSection = ({ settings }: PricingSectionProps) => {
  const t = useTranslations("Homepage.Pricing");
  const { resolvedTheme } = useTheme();
  const { billingPeriod, setBillingPeriod, calculatedPrices } = usePricingCalculator(settings);

  const isDark = resolvedTheme === "dark";

  // The `t` function from `next-intl` doesn't support returning arrays.
  // We use `t.raw` to get the object/array and then cast it.
  const researcherFeatures = t.raw("researcher.features") as string[];
  const organizerFeatures = t.raw("organizer.features") as string[];

  if (!settings) {
    return (
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl text-red-500">Unable to load pricing information.</h2>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="pricing" 
      style={{ backgroundColor: isDark ? 'transparent' : 'var(--neutral-light)' }}
      className="py-24"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("headline")}</h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-foreground/80">{t("subHeadline")}</p>

        <BillingCycleToggle billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod} />

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
          <PricingCard
            planName={t("researcher.title")}
            price={calculatedPrices.researcher.finalPrice}
            monthlyPrice={calculatedPrices.researcher.monthlyPrice}
            periodLabel={t(`periods.${billingPeriod}`)}
            features={researcherFeatures}
            savings={calculatedPrices.researcher.savings}
            isFeatured={false}
          />
          <PricingCard
            planName={t("organizer.title")}
            price={calculatedPrices.organizer.finalPrice}
            monthlyPrice={calculatedPrices.organizer.monthlyPrice}
            periodLabel={t(`periods.${billingPeriod}`)}
            features={organizerFeatures}
            savings={calculatedPrices.organizer.savings}
            isFeatured={true}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 