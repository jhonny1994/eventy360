-- Migration to fix duplicate payment notification emails issue
-- This migration modifies the handle_payment_verification function
-- to follow the Single Responsibility Principle

BEGIN;

-- Modify handle_payment_verification function to remove notification logic
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
  -- Only proceed if status changed to verified
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

-- Update the handle_payment_notification function to check for existing notifications
CREATE OR REPLACE FUNCTION public.handle_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
  template_key TEXT;
  recent_notification_exists BOOLEAN;
  subscription_rec RECORD;
BEGIN
  -- Proceed if status changed
  IF OLD.status != NEW.status THEN
    -- For verified payments - queue notification email
    IF NEW.status = 'verified' THEN
      template_key := 'payment_verified_notification';
      
      -- Check if a notification with the same template was recently created
      SELECT EXISTS (
        SELECT 1 
        FROM notification_queue 
        WHERE template_key = template_key
          AND recipient_profile_id = NEW.user_id
          AND created_at > NOW() - INTERVAL '30 seconds'
      ) INTO recent_notification_exists;
      
      -- Only create notification if one doesn't already exist
      IF NOT recent_notification_exists THEN
        -- Try to get subscription details from the database
        BEGIN
          SELECT 
            tier.name AS subscription_tier_name,
            sub.start_date,
            sub.end_date
          INTO subscription_rec
          FROM subscriptions sub
          JOIN subscription_tiers tier ON sub.tier_id = tier.id
          WHERE sub.user_id = NEW.user_id
          ORDER BY sub.created_at DESC
          LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
          -- If not found, use default values
          subscription_rec := ROW('Standard', CURRENT_DATE, (CURRENT_DATE + INTERVAL '1 year')::date);
        END;
      
        -- Queue the payment verified notification
        INSERT INTO notification_queue (
          template_key,
          recipient_profile_id,
          status,
          attempts,
          payload_data,
          notification_type
        ) VALUES (
          template_key,
          NEW.user_id,
          'pending',
          0,
          jsonb_build_object(
            'payment_id', NEW.id,
            'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT),
            'amount', NEW.amount,
            'payment_method', NEW.payment_method_reported,
            'billing_period', NEW.billing_period,
            'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
            'verified_date', to_char(NEW.verified_at, 'YYYY-MM-DD'),
            'subscription_tier', subscription_rec.subscription_tier_name,
            'start_date', to_char(subscription_rec.start_date, 'YYYY-MM-DD'),
            'end_date', to_char(subscription_rec.end_date, 'YYYY-MM-DD')
          ),
          'immediate'
        );
      END IF;
    ELSIF NEW.status = 'rejected' THEN
      template_key := 'payment_rejected_notification';
      
      -- Check if a notification with the same template was recently created
      SELECT EXISTS (
        SELECT 1 
        FROM notification_queue 
        WHERE template_key = template_key
          AND recipient_profile_id = NEW.user_id
          AND created_at > NOW() - INTERVAL '30 seconds'
      ) INTO recent_notification_exists;
      
      -- Only create notification if one doesn't already exist
      IF NOT recent_notification_exists THEN
        -- Queue the payment rejected notification
        INSERT INTO notification_queue (
          template_key,
          recipient_profile_id,
          status,
          attempts,
          payload_data,
          notification_type
        ) VALUES (
          template_key,
          NEW.user_id,
          'pending',
          0,
          jsonb_build_object(
            'payment_id', NEW.id,
            'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT),
            'amount', NEW.amount,
            'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
            'rejection_reason', COALESCE(NEW.rejection_reason, 'The payment could not be verified.')
          ),
          'immediate'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update comments to clarify the purpose of each function
COMMENT ON FUNCTION public.handle_payment_verification() IS 'Updates subscription status when a payment is verified. DOES NOT send notifications - this is handled by handle_payment_notification().';
COMMENT ON FUNCTION public.handle_payment_notification() IS 'Handles payment notification emails. Queues messages for verified and rejected payments. Checks for existing notifications to prevent duplicates.';

COMMIT; 