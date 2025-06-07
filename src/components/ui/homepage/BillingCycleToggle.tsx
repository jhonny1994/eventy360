"use client";

import { motion } from 'framer-motion';
import useTranslations from '@/hooks/useTranslations';
import type { BillingPeriod } from '@/hooks/usePricingCalculator';

type BillingCycleToggleProps = {
  billingPeriod: BillingPeriod;
  setBillingPeriod: (period: BillingPeriod) => void;
};

const periods: BillingPeriod[] = ['monthly', 'quarterly', 'biannual', 'annual'];

const BillingCycleToggle = ({ billingPeriod, setBillingPeriod }: BillingCycleToggleProps) => {
  const t = useTranslations('Homepage.Pricing');

  return (
    <div className="flex justify-center">
      <div className="relative flex items-center rounded-full bg-neutral-dark/5 p-1 dark:bg-neutral-dark/20">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setBillingPeriod(period)}
            className="relative z-10 w-28 rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors duration-300 hover:text-foreground dark:text-foreground/60 dark:hover:text-foreground"
          >
            <span className="relative z-10">{t(`periods.${period}`)}</span>
            {billingPeriod === period && (
              <motion.div
                layoutId="billing-cycle-active"
                className="absolute inset-0 rounded-full bg-background shadow-md dark:bg-neutral-mid"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BillingCycleToggle; 