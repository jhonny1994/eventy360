-- Migration: Consolidate payment verification logic and fix duplicate notifications.
-- Description: Replaces three redundant triggers with a single, robust architecture.

BEGIN;

-- Step 1: Clean up the old, redundant triggers and functions.
DROP TRIGGER IF EXISTS payment_notification_trigger ON public.payments;
DROP TRIGGER IF EXISTS on_payment_verified_update_subscription ON public.payments;
DROP TRIGGER IF EXISTS payment_verification_trigger ON public.payments;
DROP TRIGGER IF EXISTS payment_reported_trigger ON public.payments;
DROP TRIGGER IF EXISTS on_payment_verified ON public.payments;

-- Use CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.handle_payment_notification() CASCADE;
DROP FUNCTION IF EXISTS public.handle_payment_verification() CASCADE;
DROP FUNCTION IF EXISTS public.handle_payment_reported() CASCADE;


-- Step 2: Create a single, consolidated function for all payment STATUS CHANGES.
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_id UUID;
  v_user_current_subscription RECORD;
  v_new_end_date TIMESTAMPTZ;
  v_calculated_interval INTERVAL;
  v_user_type public.user_type_enum;
  v_new_tier public.subscription_tier_enum;
  v_subscription_details_for_email RECORD;
BEGIN
  -- Handle VERIFIED payments
  IF NEW.status = 'verified' THEN
    
    -- === Subscription Logic ===
    SELECT P.user_type INTO v_user_type FROM public.profiles P WHERE P.id = NEW.user_id;
    IF v_user_type = 'researcher' THEN v_new_tier := 'paid_researcher';
    ELSIF v_user_type = 'organizer' THEN v_new_tier := 'paid_organizer';
    ELSE v_new_tier := 'free';
    END IF;

    -- FIX: Use the billing_period_to_interval helper to respect what the user paid for.
    v_calculated_interval := public.billing_period_to_interval(NEW.billing_period);
    SELECT * INTO v_user_current_subscription FROM public.subscriptions WHERE user_id = NEW.user_id;

    IF v_user_current_subscription IS NULL THEN
      v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
      INSERT INTO public.subscriptions (user_id, tier, status, start_date, end_date)
      VALUES (NEW.user_id, v_new_tier, 'active', COALESCE(NEW.verified_at, timezone('utc'::text, now())), v_new_end_date)
      RETURNING id INTO v_subscription_id;
    ELSE
      v_subscription_id := v_user_current_subscription.id;
      IF v_user_current_subscription.status IN ('trial', 'expired') THEN
        v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
        UPDATE public.subscriptions SET tier = v_new_tier, status = 'active', start_date = COALESCE(NEW.verified_at, timezone('utc'::text, now())), end_date = v_new_end_date, trial_ends_at = NULL WHERE id = v_subscription_id;
      ELSIF v_user_current_subscription.status = 'active' THEN
        v_new_end_date := v_user_current_subscription.end_date + v_calculated_interval;
        UPDATE public.subscriptions SET tier = v_new_tier, end_date = v_new_end_date WHERE id = v_subscription_id;
      END IF;
    END IF;
    
    UPDATE public.payments SET subscription_id = v_subscription_id WHERE id = NEW.id;
    SELECT tier, start_date, end_date INTO v_subscription_details_for_email FROM public.subscriptions WHERE id = v_subscription_id;

    -- === Notification & Logging Logic ===
    INSERT INTO public.notification_queue (template_key, recipient_profile_id, payload_data, notification_type)
    VALUES ('payment_verified_notification', NEW.user_id, jsonb_build_object(
      'payment_id', NEW.id, 'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), 'amount', NEW.amount,
      'billing_period', NEW.billing_period, 'verified_date', to_char(NEW.verified_at, 'YYYY-MM-DD'),
      'subscription_tier', v_subscription_details_for_email.tier, 'start_date', to_char(v_subscription_details_for_email.start_date, 'YYYY-MM-DD'),
      'end_date', to_char(v_subscription_details_for_email.end_date, 'YYYY-MM-DD')), 'immediate');
    
    INSERT INTO public.admin_actions_log (action_type, admin_user_id, target_user_id, target_entity_id, target_entity_type)
    VALUES ('updated_payment_status', NEW.admin_verifier_id, NEW.user_id, NEW.id, 'payment');

  -- Handle REJECTED payments
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notification_queue (template_key, recipient_profile_id, payload_data, notification_type)
    VALUES ('payment_rejected_notification', NEW.user_id, jsonb_build_object(
      'payment_id', NEW.id, 'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), 'amount', NEW.amount,
      'rejection_reason', COALESCE(NEW.admin_notes, 'The payment could not be verified.')), 'immediate');

    INSERT INTO public.admin_actions_log (action_type, admin_user_id, target_user_id, target_entity_id, target_entity_type)
    VALUES ('updated_payment_status', NEW.admin_verifier_id, NEW.user_id, NEW.id, 'payment');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 3: Create a single trigger for payment status UPDATES.
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_payment_status_change();


-- Step 4: Create a function and trigger for NEW payment INSERTS.
CREATE OR REPLACE FUNCTION public.handle_new_payment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_queue (template_key, recipient_profile_id, payload_data, notification_type)
  VALUES ('payment_received_pending_verification', NEW.user_id, jsonb_build_object(
    'payment_id', NEW.id, 'amount', NEW.amount, 'reported_at', NEW.reported_at), 'immediate');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_payment();


-- Step 5: Ensure the verify_payment RPC uses the correct schema
-- (This is just a validation step; the RPC's logic of just updating is correct).
CREATE OR REPLACE FUNCTION public.verify_payment(
  payment_id UUID, 
  verify_status public.payment_status_enum, 
  p_admin_notes TEXT DEFAULT NULL, 
  rejection_reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is an admin
  SELECT (user_type = 'admin') INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Update payment. The `on_payment_status_change` trigger will handle all business logic.
  UPDATE public.payments
  SET 
    status = verify_status,
    admin_verifier_id = auth.uid(),
    admin_notes = COALESCE(p_admin_notes, rejection_reason),
    verified_at = CASE WHEN verify_status = 'verified' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = payment_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Final comments reflecting the new, correct architecture.
COMMENT ON FUNCTION public.handle_payment_status_change() IS 'The single source of truth for handling side effects of a payment status change. Manages subscriptions and notifications.';
COMMENT ON TRIGGER on_payment_status_change ON public.payments IS 'Fires the consolidated handler function when a payment''s status is updated.';
COMMENT ON FUNCTION public.handle_new_payment() IS 'Handles notifications for newly reported payments.';
COMMENT ON TRIGGER on_new_payment ON public.payments IS 'Fires the handler for new payments upon insert.';

COMMIT; 