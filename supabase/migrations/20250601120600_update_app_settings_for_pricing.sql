-- Add pricing fields to app_settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS base_price_researcher_monthly NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS base_price_organizer_monthly NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS discount_quarterly NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS discount_biannual NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS discount_annual NUMERIC(5, 2);

-- Add comments to the new columns
COMMENT ON COLUMN public.app_settings.base_price_researcher_monthly IS 'Base monthly price for researcher subscriptions in DZD';
COMMENT ON COLUMN public.app_settings.base_price_organizer_monthly IS 'Base monthly price for organizer subscriptions in DZD';
COMMENT ON COLUMN public.app_settings.discount_quarterly IS 'Percentage discount for quarterly (3-month) subscriptions';
COMMENT ON COLUMN public.app_settings.discount_biannual IS 'Percentage discount for biannual (6-month) subscriptions';
COMMENT ON COLUMN public.app_settings.discount_annual IS 'Percentage discount for annual (12-month) subscriptions';

-- Insert default settings if no settings exist
INSERT INTO public.app_settings (
  id,
  bank_name,
  account_holder,
  account_number_rib,
  payment_email,
  cash_payment_office_address,
  base_price_researcher_monthly,
  base_price_organizer_monthly,
  discount_quarterly,
  discount_biannual,
  discount_annual
)
SELECT
  gen_random_uuid(),
  'البنك الوطني الجزائري (BNA)',     -- Default bank name
  'Eventy360 SARL',                   -- Default account holder
  'XXXX XXXX XXXX XXXX XXXX',        -- Placeholder account number - MUST BE UPDATED
  'payments@eventy360.dz',            -- Default payment email
  'المقر الرئيسي ، الجزائر العاصمة', -- Default office address
  2000.00,                            -- Default researcher monthly price: 2000 DZD
  3000.00,                            -- Default organizer monthly price: 3000 DZD
  5.00,                               -- Default quarterly discount: 5%
  10.00,                              -- Default biannual discount: 10%
  15.00                               -- Default annual discount: 15%
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings LIMIT 1); 