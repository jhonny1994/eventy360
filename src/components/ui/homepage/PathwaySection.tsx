"use client";

import useTranslations from "@/hooks/useTranslations";
import RoleCard from "./RoleCard";
import { User, Building } from "lucide-react";
import useLocale from "@/hooks/useLocale";

/**
 * PathwaySection - Section displaying different user pathways
 * Uses a solid background in light mode and transparent in dark mode
 */
const PathwaySection = () => {
  const t = useTranslations("Homepage");
  const locale = useLocale();

  return (
    <section 
      id="pathway" 
      className="py-24 bg-[--neutral-light] dark:bg-transparent"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-12 text-3xl font-bold md:text-4xl">{t("Pathway.headline")}</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <RoleCard
            icon={<User size={32} />}
            title={t("Pathway.researcher.title")}
            description={t("Pathway.researcher.description")}
            link={`/${locale}/register?role=researcher`}
            cta={t("Pathway.researcher.cta")}
          />
          <RoleCard
            icon={<Building size={32} />}
            title={t("Pathway.organizer.title")}
            description={t("Pathway.organizer.description")}
            link={`/${locale}/register?role=organizer`}
            cta={t("Pathway.organizer.cta")}
          />
        </div>
      </div>
    </section>
  );
};

export default PathwaySection; 