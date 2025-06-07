"use client";

import { useState, useMemo } from 'react';
import type { AppSettings } from '@/types/pricing';

export type BillingPeriod = 'monthly' | 'quarterly' | 'biannual' | 'annual';

const periodMultipliers = {
  monthly: 1,
  quarterly: 3,
  biannual: 6,
  annual: 12,
};

export const usePricingCalculator = (settings: AppSettings | null) => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const calculatedPrices = useMemo(() => {
    if (!settings) {
      return {
        researcher: { finalPrice: 0, monthlyPrice: 0, savings: 0 },
        organizer: { finalPrice: 0, monthlyPrice: 0, savings: 0 },
      };
    }

    const baseResearcher = settings.base_price_researcher_monthly;
    const baseOrganizer = settings.base_price_organizer_monthly;

    const discounts = {
      monthly: 0,
      quarterly: settings.discount_quarterly,
      biannual: settings.discount_biannual,
      annual: settings.discount_annual,
    };

    const multiplier = periodMultipliers[billingPeriod];
    const discount = discounts[billingPeriod];

    const calculate = (basePrice: number) => {
      const totalBeforeDiscount = basePrice * multiplier;
      const finalPrice = totalBeforeDiscount * (1 - discount);
      const monthlyPrice = finalPrice / multiplier;
      const savings = discount > 0 ? Math.round(discount * 100) : 0;
      return { finalPrice, monthlyPrice, savings };
    };

    return {
      researcher: calculate(baseResearcher),
      organizer: calculate(baseOrganizer),
    };
  }, [settings, billingPeriod]);

  return {
    billingPeriod,
    setBillingPeriod,
    calculatedPrices,
  };
}; 