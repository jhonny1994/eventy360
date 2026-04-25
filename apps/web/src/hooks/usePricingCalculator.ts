"use client";

import { useState, useMemo } from 'react';
import type { AppSettings } from '@/lib/appConfig';

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

    const baseResearcher = settings.base_price_researcher_monthly ?? 0;
    const baseOrganizer = settings.base_price_organizer_monthly ?? 0;

    const discounts = {
      monthly: 0,
      quarterly: settings.discount_quarterly ?? 0,
      biannual: settings.discount_biannual ?? 0,
      annual: settings.discount_annual ?? 0,
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