"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import useLocale from "@/hooks/useLocale";
import { Check } from "lucide-react";
import useTranslations from "@/hooks/useTranslations";
import useReducedMotion from "@/hooks/useReducedMotion";

type PricingCardProps = {
  planName: string;
  price: number;
  monthlyPrice: number;
  periodLabel: string;
  features: string[];
  savings: number;
  isFeatured: boolean;
};

const formatCurrency = (amount: number, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PricingCard = ({
  planName,
  price,
  monthlyPrice,
  periodLabel,
  features,
  savings,
  isFeatured,
}: PricingCardProps) => {
  const locale = useLocale();
  const t = useTranslations("Homepage.Pricing.card");
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -5 }}
      transition={{ duration: 0.2 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${
        isFeatured
          ? "border-secondary/50 bg-neutral-light/20 dark:border-secondary/30 dark:bg-neutral-dark/10"
          : "border-neutral-mid/50 bg-background/50 dark:border-neutral-mid/20 dark:bg-neutral-dark/5"
      } p-8 shadow-lg backdrop-blur-sm`}
    >
      {savings > 0 && (
        <div className="absolute top-8 -rotate-45 transform bg-accent-success px-10 py-1 text-xs font-bold text-white shadow-md end-[-40px] rtl:rotate-45">
          {t("save_badge", { savings })}
        </div>
      )}
      <h3 className="mb-2 text-2xl font-bold">{planName}</h3>
      <div className="mb-6 flex items-baseline">
        <span className="text-4xl font-extrabold tracking-tight">
          {formatCurrency(price, locale)}
        </span>
        <span className="ms-2 text-lg font-medium text-foreground/60">
          /{periodLabel}
        </span>
      </div>
      <p className="mb-6 text-sm text-foreground/70">
        {t("billing_info", {
          monthlyPrice: formatCurrency(monthlyPrice, locale),
        })}
      </p>

      <ul className="grow mb-8 space-y-4 text-start">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="me-3 h-5 w-5 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        >
          <Link
            href={`/${locale}/profile/subscriptions`}
            className={`block w-full rounded-lg py-3 text-center text-lg font-semibold transition-all duration-300 ${
              isFeatured
                ? "bg-primary text-white shadow-primary/30 hover:bg-primary/90"
                : "bg-foreground/10 text-primary hover:bg-foreground/20 dark:bg-foreground/20 dark:hover:bg-foreground/30"
            }`}
          >
            {t("cta_button")}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PricingCard;
 