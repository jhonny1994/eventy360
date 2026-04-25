export type AppSettings = {
  id: string;
  bank_name: string | null;
  account_holder: string | null;
  account_number_rib: string | null;
  payment_email: string | null;
  created_at: string;
  updated_at: string;
  base_price_researcher_monthly: number;
  base_price_organizer_monthly: number;
  discount_quarterly: number;
  discount_biannual: number;
  discount_annual: number;
}; 