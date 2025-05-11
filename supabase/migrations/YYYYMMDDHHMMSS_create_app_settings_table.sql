-- supabase/migrations/YYYYMMDDHHMMSS_create_app_settings_table.sql

CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Or could be a specific known ID like 'current_settings'
  bank_name TEXT,
  account_holder TEXT,
  account_number_rib TEXT,
  payment_email TEXT,
  cash_payment_office_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to settings (as they are for display)
CREATE POLICY "Allow public read-only access"
ON public.app_settings
FOR SELECT
USING (true);

-- Allow admin users to manage settings (insert, update, delete)
-- You'll need a way to identify admin users, e.g., a custom claim or a role in your users table.
-- For now, let's assume an 'admin' role in a 'user_roles' table or similar.
-- This policy is a placeholder and needs to be adapted to your actual admin role setup.
CREATE POLICY "Allow admins to manage settings"
ON public.app_settings
FOR ALL
USING (auth.uid() IN (SELECT user_id FROM admin_users_view)) -- Replace with your admin check
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users_view)); -- Replace with your admin check


-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Optional: Insert initial default settings (or do this via Supabase Studio)
-- Make sure to replace YYYYMMDDHHMMSS with the actual timestamp for the filename.
-- Example of inserting one row of settings.
-- You might want to use a fixed ID if you always intend to query for that specific row.
-- For example, using a specific UUID: '00000000-0000-0000-0000-000000000001'
-- Or a text primary key like 'current_active_settings'

-- INSERT INTO public.app_settings (
--   id,
--   bank_name,
--   account_holder,
--   account_number_rib,
--   payment_email,
--   cash_payment_office_address
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001', -- A fixed UUID for easy querying
--   'البنك الوطني الجزائري (BNA)',
--   'Eventy360 SARL',
--   '00100 XXXXXXXXXXXXXXXX XXX',
--   'payments@eventy360.dz',
--   '123 Main Street, Algiers' -- Example address
-- );

COMMENT ON TABLE public.app_settings IS 'Stores application-wide configurations and settings.';
COMMENT ON COLUMN public.app_settings.payment_email IS 'Contact email for payment verifications.'; 