-- supabase/migrations/20250510140000_add_pricing_to_app_settings.sql

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS base_price_researcher_monthly NUMERIC DEFAULT 500 NOT NULL,
ADD COLUMN IF NOT EXISTS base_price_organizer_monthly NUMERIC DEFAULT 10000 NOT NULL,
ADD COLUMN IF NOT EXISTS discount_quarterly NUMERIC DEFAULT 0.05 NOT NULL 
    CONSTRAINT discount_quarterly_check CHECK (discount_quarterly >= 0 AND discount_quarterly <= 1),
ADD COLUMN IF NOT EXISTS discount_biannual NUMERIC DEFAULT 0.10 NOT NULL
    CONSTRAINT discount_biannual_check CHECK (discount_biannual >= 0 AND discount_biannual <= 1),
ADD COLUMN IF NOT EXISTS discount_annual NUMERIC DEFAULT 0.15 NOT NULL
    CONSTRAINT discount_annual_check CHECK (discount_annual >= 0 AND discount_annual <= 1);

COMMENT ON COLUMN public.app_settings.base_price_researcher_monthly IS 'Base monthly price for the researcher tier in DZD.';
COMMENT ON COLUMN public.app_settings.base_price_organizer_monthly IS 'Base monthly price for the organizer tier in DZD.';
COMMENT ON COLUMN public.app_settings.discount_quarterly IS 'Percentage discount for quarterly subscriptions (e.g., 0.05 for 5%).';
COMMENT ON COLUMN public.app_settings.discount_biannual IS 'Percentage discount for biannual (6 months) subscriptions (e.g., 0.10 for 10%).';
COMMENT ON COLUMN public.app_settings.discount_annual IS 'Percentage discount for annual subscriptions (e.g., 0.15 for 15%).';

-- Ensure the existing row (if any) gets these default values if it was created before this migration.
-- This assumes you have one primary settings row. If you used a specific ID, target that.
-- If the table is empty, this won't do anything, and new inserts should use the defaults or specify values.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.app_settings LIMIT 1) THEN
        UPDATE public.app_settings
        SET 
            base_price_researcher_monthly = COALESCE(base_price_researcher_monthly, 500),
            base_price_organizer_monthly = COALESCE(base_price_organizer_monthly, 10000),
            discount_quarterly = COALESCE(discount_quarterly, 0.05),
            discount_biannual = COALESCE(discount_biannual, 0.10),
            discount_annual = COALESCE(discount_annual, 0.15)
        WHERE (SELECT COUNT(*) FROM public.app_settings) = 1; -- Apply only if one row exists, simple safeguard
    END IF;
END $$; 