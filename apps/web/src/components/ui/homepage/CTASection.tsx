"use client";

import useTranslations from "@/hooks/useTranslations";
import CTAGroup from "./CTAGroup";

/**
 * CTASection - Call-to-action section
 * Uses gradient background as the fifth section in the alternating pattern
 */
const CTASection = () => {
  const t = useTranslations("Homepage");

  return (
    <section
      id="cta"
      className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:bg-transparent py-24"
    >
      <div className="container relative mx-auto px-4 text-center">
        <h2 className="mb-8 text-3xl font-bold md:text-4xl">{t("CTA.headline")}</h2>
        <CTAGroup />
      </div>
    </section>
  );
};

export default CTASection; 