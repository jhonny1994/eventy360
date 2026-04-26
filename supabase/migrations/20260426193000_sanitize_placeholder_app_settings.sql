UPDATE public.app_settings
SET account_number_rib = NULL
WHERE account_number_rib ILIKE '%XXXX%';
