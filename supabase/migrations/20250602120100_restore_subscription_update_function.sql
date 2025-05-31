-- Restore the original subscription update function
-- The function was overwritten by the notification function with the same name

-- First, check if the billing_period_to_interval function exists, if not, create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'billing_period_to_interval') THEN
    CREATE OR REPLACE FUNCTION billing_period_to_interval(period billing_period_enum)
    RETURNS INTERVAL AS $$
    BEGIN
      RETURN CASE period
        WHEN 'monthly' THEN INTERVAL '1 month'
        WHEN 'quarterly' THEN INTERVAL '3 months'
        WHEN 'biannual' THEN INTERVAL '6 months'
        WHEN 'annual' THEN INTERVAL '1 year'
        ELSE INTERVAL '0 days'
      END;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  END IF;
END $$;

-- Now recreate the original handle_payment_verification function for subscription updates
CREATE OR REPLACE FUNCTION public.handle_payment_verification()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_id UUID;
  v_user_current_subscription RECORD;
  v_new_end_date TIMESTAMPTZ;
  v_calculated_interval INTERVAL;
  v_user_type public.user_type_enum;
  v_new_tier public.subscription_tier_enum;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'verified' AND NEW.status = 'verified' THEN
    RAISE NOTICE 'Payment verified for user %: Processing subscription update', NEW.user_id;
    
    -- Get the user type to determine subscription tier
    SELECT P.user_type INTO v_user_type FROM public.profiles P WHERE P.id = NEW.user_id;

    IF v_user_type IS NULL THEN
      RAISE WARNING 'No profile found for user_id: %', NEW.user_id;
      RETURN NEW;
    END IF;

    -- Set the appropriate tier based on user type
    IF v_user_type = 'researcher' THEN
      v_new_tier := 'paid_researcher';
    ELSIF v_user_type = 'organizer' THEN
      v_new_tier := 'paid_organizer';
    ELSE
      v_new_tier := 'free';
    END IF;
    
    -- Calculate subscription period
    v_calculated_interval := billing_period_to_interval(NEW.billing_period);
    RAISE NOTICE 'Calculated interval for % is %', NEW.billing_period, v_calculated_interval;

    -- Get current subscription if exists
    SELECT * INTO v_user_current_subscription
    FROM public.subscriptions
    WHERE user_id = NEW.user_id;

    -- Handle subscription creation or update
    IF v_user_current_subscription IS NULL THEN
      -- No existing subscription, create new one
      v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
      INSERT INTO public.subscriptions (user_id, tier, status, start_date, end_date, trial_ends_at)
      VALUES (NEW.user_id, v_new_tier, 'active', COALESCE(NEW.verified_at, timezone('utc'::text, now())), v_new_end_date, NULL)
      RETURNING id INTO v_subscription_id;
      
      RAISE NOTICE 'Created new subscription % for user %', v_subscription_id, NEW.user_id;
    ELSE
      -- Existing subscription found
      v_subscription_id := v_user_current_subscription.id;
      RAISE NOTICE 'Found existing subscription % for user % with status %', 
        v_subscription_id, NEW.user_id, v_user_current_subscription.status;
      
      IF v_user_current_subscription.status = 'trial' OR v_user_current_subscription.status = 'expired' THEN
        -- Update from trial/expired to active
        v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
        UPDATE public.subscriptions
        SET
          tier = v_new_tier,
          status = 'active',
          start_date = COALESCE(NEW.verified_at, timezone('utc'::text, now())),
          end_date = v_new_end_date,
          trial_ends_at = NULL,
          updated_at = timezone('utc'::text, now())
        WHERE id = v_subscription_id;
        
        RAISE NOTICE 'Updated subscription from %: new end date is %', 
          v_user_current_subscription.status, v_new_end_date;
      ELSIF v_user_current_subscription.status = 'active' THEN
        -- Extend active subscription
        v_new_end_date := v_user_current_subscription.end_date + v_calculated_interval;
        UPDATE public.subscriptions
        SET
          tier = v_new_tier,
          end_date = v_new_end_date,
          updated_at = timezone('utc'::text, now())
        WHERE id = v_subscription_id;
        
        RAISE NOTICE 'Extended active subscription to %', v_new_end_date;
      ELSE
        RAISE WARNING 'Payment verified for user % with unhandled subscription status: %', 
          NEW.user_id, v_user_current_subscription.status;
        RETURN NEW;
      END IF;
    END IF;

    -- Link payment to subscription
    UPDATE public.payments
    SET subscription_id = v_subscription_id
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Linked payment % to subscription %', NEW.id, v_subscription_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the comment is correct
COMMENT ON FUNCTION public.handle_payment_verification() IS 'Updates subscription status when a payment is verified. Called by on_payment_verified_update_subscription trigger.';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_payment_verified_update_subscription ON public.payments;
CREATE TRIGGER on_payment_verified_update_subscription
AFTER UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_verification(); 