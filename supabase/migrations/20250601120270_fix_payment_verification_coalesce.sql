-- Fix type casting issue in handle_payment_verification function
-- The issue is that COALESCE types text and uuid cannot be matched

-- Update the function to fix the type casting issue
CREATE OR REPLACE FUNCTION handle_payment_verification()
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

-- Add comment to function
COMMENT ON FUNCTION handle_payment_verification() IS 'Handles payment verification notifications. Fixed type mismatch in COALESCE by casting UUID to TEXT.'; 