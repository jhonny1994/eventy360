"use client";

import useTranslations from "@/hooks/useTranslations";
import Link from "next/link";
import useLocale from "@/hooks/useLocale";

type CTAGroupProps = {
  researcherCtaKey?: string;
  organizerCtaKey?: string;
};

const CTAGroup = ({ 
  researcherCtaKey = "Hero.ctaResearcher", 
  organizerCtaKey = "Hero.ctaOrganizer" 
}: CTAGroupProps) => {
  const t = useTranslations("Homepage");
  const locale = useLocale();

  return (
    <div className="mt-8 flex justify-center gap-x-4">
      <Link
        href={`/${locale}/register?role=researcher`}
        className="rounded-md bg-primary px-6 py-3 text-lg font-semibold text-white transition-transform hover:scale-105"
      >
        {t(researcherCtaKey)}
      </Link>
      <Link
        href={`/${locale}/register?role=organizer`}
        className="rounded-md bg-secondary px-6 py-3 text-lg font-semibold text-white transition-transform hover:scale-105"
      >
        {t(organizerCtaKey)}
      </Link>
    </div>
  );
};

export default CTAGroup; 