-- Fix conflict between two functions with the same name but different purposes
-- First function handles payment notifications, second handles subscription updates

-- Rename the notification function to a more specific name
DROP FUNCTION IF EXISTS handle_payment_notification();
CREATE OR REPLACE FUNCTION handle_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Proceed if status changed
  IF OLD.status != NEW.status THEN
    -- For verified payments - queue notification email
    IF NEW.status = 'verified' THEN
      -- Queue only the payment verified notification (removed subscription_activated notification)
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data,
        notification_type
      ) VALUES (
        'payment_verified_notification',
        NEW.user_id,
        'pending',
        0,
        jsonb_build_object(
          'payment_id', NEW.id,
          'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), -- Fix: Cast UUID to TEXT
          'amount', NEW.amount,
          'payment_method', NEW.payment_method_reported,
          'billing_period', NEW.billing_period,
          'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
          'verified_date', to_char(NEW.verified_at, 'YYYY-MM-DD'),
          -- Will be populated in following trigger
          'subscription_tier', 'pending',
          'start_date', 'pending',
          'end_date', 'pending'
        ),
        'immediate'
      );
    ELSIF NEW.status = 'rejected' THEN
      -- Queue the payment rejected notification
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data,
        notification_type
      ) VALUES (
        'payment_rejected_notification',
        NEW.user_id,
        'pending',
        0,
        jsonb_build_object(
          'payment_id', NEW.id,
          'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), -- Fix: Cast UUID to TEXT
          'amount', NEW.amount,
          'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
          'rejection_reason', COALESCE(NEW.rejection_reason, 'The payment could not be verified.'),
          'support_email', 'support@eventy360.dz'
        ),
        'immediate'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification trigger with the new function name
DROP TRIGGER IF EXISTS payment_notification_trigger ON payments;
CREATE TRIGGER payment_notification_trigger
AFTER UPDATE OF status ON payments
FOR EACH ROW
EXECUTE FUNCTION handle_payment_notification();

-- Add comments to explain the purpose of each function
COMMENT ON FUNCTION handle_payment_notification() IS 'Handles payment notification emails. Queues messages for verified and rejected payments.';
COMMENT ON FUNCTION handle_payment_verification() IS 'Updates subscription status when a payment is verified. Called by on_payment_verified_update_subscription trigger.';

-- Verify that the subscription update trigger exists
DROP TRIGGER IF EXISTS on_payment_verified_update_subscription ON public.payments;
CREATE TRIGGER on_payment_verified_update_subscription
AFTER UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_verification(); 