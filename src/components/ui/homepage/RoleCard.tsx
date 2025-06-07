"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useLocale from "@/hooks/useLocale";

type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  cta: string;
};

/**
 * RoleCard - Card component showing different user roles/pathways
 * 
 * Features:
 * - RTL aware direction icon (ChevronLeft/ChevronRight)
 * - Hover animation with translation effects
 * - Consistent styling with glass effect
 */
const RoleCard = ({ icon, title, description, link, cta }: RoleCardProps) => {
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  // Determine which direction icon to use based on locale
  const DirectionIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className="group rounded-lg border border-transparent bg-neutral-low/60 p-8 text-center transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1 dark:bg-neutral-low/20 dark:backdrop-blur-sm"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="mb-4 inline-block rounded-full bg-primary/10 p-4 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-2xl font-bold">{title}</h3>
      <p className="mb-6 text-foreground/80">{description}</p>
      <Link
        href={link}
        className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
      >
        {cta}
        <DirectionIcon className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </Link>
    </div>
  );
};

export default RoleCard; 