import { createServerSupabaseClient } from '@/lib/supabase/server';


// Define a more specific type for the data returned by the select query
interface AppSettingsData {
  bank_name: string | null;
  account_holder: string | null;
  account_number_rib: string | null;
  payment_email: string | null;
  base_price_researcher_monthly: number | null;
  base_price_organizer_monthly: number | null;
  discount_quarterly: number | null;
  discount_biannual: number | null;
  discount_annual: number | null;
}

function normalizeSettingValue(value: string | null): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.includes('XXXX')) {
    return null;
  }
  return trimmed;
}

export interface AppSettings extends AppSettingsData {
  calculated_prices: { // Made non-optional as it will always be populated if data exists
    researcher: {
      monthly: number;
      quarterly: number;
      biannual: number;
      annual: number;
    };
    organizer: {
      monthly: number;
      quarterly: number;
      biannual: number;
      annual: number;
    };
  };
}

export async function getAppSettings(): Promise<AppSettings | null> {


  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('app_settings')
    .select('bank_name, account_holder, account_number_rib, payment_email, base_price_researcher_monthly, base_price_organizer_monthly, discount_quarterly, discount_biannual, discount_annual')
    .limit(1)
    .maybeSingle<AppSettingsData>(); // Specify the type for maybeSingle

  if (error) {
    return null;
  }

  if (!data) {
    return null;
  }

  const {
    base_price_researcher_monthly,
    base_price_organizer_monthly,
    discount_quarterly,
    discount_biannual,
    discount_annual,
  } = data;

  // Initialize with default/zero values
  const calculated_prices: AppSettings['calculated_prices'] = {
    researcher: { monthly: 0, quarterly: 0, biannual: 0, annual: 0 },
    organizer: { monthly: 0, quarterly: 0, biannual: 0, annual: 0 },
  };

  // Helper to safely get number or return 0 if null
  const getNum = (val: number | null): number => val ?? 0;

  const brp_monthly = getNum(base_price_researcher_monthly);
  const bop_monthly = getNum(base_price_organizer_monthly);
  const dq = getNum(discount_quarterly);
  const db = getNum(discount_biannual);
  const da = getNum(discount_annual);

  calculated_prices.researcher.monthly = brp_monthly;
  calculated_prices.researcher.quarterly = Math.round(brp_monthly * 3 * (1 - dq));
  calculated_prices.researcher.biannual = Math.round(brp_monthly * 6 * (1 - db));
  calculated_prices.researcher.annual = Math.round(brp_monthly * 12 * (1 - da));

  calculated_prices.organizer.monthly = bop_monthly;
  calculated_prices.organizer.quarterly = Math.round(bop_monthly * 3 * (1 - dq));
  calculated_prices.organizer.biannual = Math.round(bop_monthly * 6 * (1 - db));
  calculated_prices.organizer.annual = Math.round(bop_monthly * 12 * (1 - da));

  return {
    ...data,
    bank_name: normalizeSettingValue(data.bank_name),
    account_holder: normalizeSettingValue(data.account_holder),
    account_number_rib: normalizeSettingValue(data.account_number_rib),
    payment_email: normalizeSettingValue(data.payment_email),
    calculated_prices, // Adds the calculated prices
  };
} 
