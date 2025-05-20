-- Create function to get subscription pricing based on user type and billing period
CREATE OR REPLACE FUNCTION public.get_subscription_pricing(
  user_type user_type_enum,
  billing_period billing_period_enum
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_base_price NUMERIC;
  v_discount_percentage NUMERIC := 0;
  v_final_price NUMERIC;
  v_settings RECORD;
BEGIN
  -- Get pricing settings from app_settings
  SELECT * INTO v_settings FROM app_settings LIMIT 1;
  
  IF v_settings IS NULL THEN
    RAISE EXCEPTION 'App settings not configured';
  END IF;
  
  -- Get base price based on user type
  CASE user_type
    WHEN 'researcher' THEN
      v_base_price := COALESCE(v_settings.base_price_researcher_monthly, 2000); -- Default 2000 DZD if not set
    WHEN 'organizer' THEN
      v_base_price := COALESCE(v_settings.base_price_organizer_monthly, 3000); -- Default 3000 DZD if not set
    ELSE
      RAISE EXCEPTION 'Invalid user type for subscription pricing: %', user_type;
  END CASE;
  
  -- Get discount based on billing period
  CASE billing_period
    WHEN 'monthly' THEN
      v_discount_percentage := 0; -- No discount for monthly
    WHEN 'quarterly' THEN
      v_discount_percentage := COALESCE(v_settings.discount_quarterly, 5); -- Default 5% if not set
    WHEN 'biannual' THEN
      v_discount_percentage := COALESCE(v_settings.discount_biannual, 10); -- Default 10% if not set
    WHEN 'annual' THEN
      v_discount_percentage := COALESCE(v_settings.discount_annual, 15); -- Default 15% if not set
    ELSE
      RAISE EXCEPTION 'Invalid billing period: %', billing_period;
  END CASE;
  
  -- Calculate final price
  -- For periods other than monthly, multiply by number of months
  CASE billing_period
    WHEN 'monthly' THEN
      v_final_price := v_base_price;
    WHEN 'quarterly' THEN
      v_final_price := v_base_price * 3 * (1 - (v_discount_percentage / 100));
    WHEN 'biannual' THEN
      v_final_price := v_base_price * 6 * (1 - (v_discount_percentage / 100));
    WHEN 'annual' THEN
      v_final_price := v_base_price * 12 * (1 - (v_discount_percentage / 100));
  END CASE;
  
  -- Round to nearest whole number
  v_final_price := ROUND(v_final_price);
  
  -- Return pricing information
  RETURN json_build_object(
    'base_price_monthly', v_base_price,
    'billing_period', billing_period,
    'discount_percentage', v_discount_percentage,
    'number_of_months', CASE
      WHEN billing_period = 'monthly' THEN 1
      WHEN billing_period = 'quarterly' THEN 3
      WHEN billing_period = 'biannual' THEN 6
      WHEN billing_period = 'annual' THEN 12
    END,
    'price_before_discount', CASE
      WHEN billing_period = 'monthly' THEN v_base_price
      WHEN billing_period = 'quarterly' THEN v_base_price * 3
      WHEN billing_period = 'biannual' THEN v_base_price * 6
      WHEN billing_period = 'annual' THEN v_base_price * 12
    END,
    'discount_amount', CASE
      WHEN billing_period = 'monthly' THEN 0
      WHEN billing_period = 'quarterly' THEN (v_base_price * 3 * v_discount_percentage / 100)
      WHEN billing_period = 'biannual' THEN (v_base_price * 6 * v_discount_percentage / 100)
      WHEN billing_period = 'annual' THEN (v_base_price * 12 * v_discount_percentage / 100)
    END,
    'final_price', v_final_price,
    'currency', 'DZD',
    'user_type', user_type
  );
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION public.get_subscription_pricing(user_type_enum, billing_period_enum) IS 'Calculates subscription pricing based on user type and billing period, applying appropriate discounts from app_settings.'; 