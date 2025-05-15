-- Create trigger function to handle profile verification status changes
CREATE OR REPLACE FUNCTION handle_profile_verification_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if is_verified status changed
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
    -- Log the admin action
    INSERT INTO admin_actions_log (
      action_type,
      admin_user_id,
      target_user_id,
      details
    ) VALUES (
      CASE 
        WHEN NEW.is_verified = TRUE THEN 'awarded_badge'
        ELSE 'removed_badge'
      END,
      auth.uid(),
      NEW.id,
      jsonb_build_object(
        'previous_status', OLD.is_verified,
        'new_status', NEW.is_verified
      )
    );
    
    -- Queue notification email
    INSERT INTO notification_queue (
      template_key,
      recipient_profile_id,
      status,
      attempts,
      payload_data
    ) VALUES (
      CASE 
        WHEN NEW.is_verified = TRUE THEN 'user_verified_badge_awarded'
        ELSE 'user_verified_badge_removed'
      END,
      NEW.id,
      'pending',
      0,
      jsonb_build_object(
        'profile_id', NEW.id,
        'verification_status', NEW.is_verified,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS profile_verification_trigger ON profiles;

CREATE TRIGGER profile_verification_trigger
AFTER UPDATE OF is_verified ON profiles
FOR EACH ROW
EXECUTE FUNCTION handle_profile_verification_change();

-- Create trigger for payment status changes
CREATE OR REPLACE FUNCTION handle_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'verified'
  IF OLD.status != 'verified' AND NEW.status = 'verified' THEN
    -- Queue notification email for successful payment verification
    INSERT INTO notification_queue (
      template_key,
      recipient_profile_id,
      status,
      attempts,
      payload_data
    ) VALUES (
      'subscription_activated',
      NEW.user_id,
      'pending',
      0,
      jsonb_build_object(
        'payment_id', NEW.id,
        'amount', NEW.amount,
        'verified_at', NEW.verified_at,
        'billing_period', NEW.billing_period
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on payments table
DROP TRIGGER IF EXISTS payment_verification_trigger ON payments;

CREATE TRIGGER payment_verification_trigger
AFTER UPDATE OF status ON payments
FOR EACH ROW
EXECUTE FUNCTION handle_payment_verification();

-- Create function to handle trial expiry notifications
CREATE OR REPLACE FUNCTION queue_trial_expiry_notification(
  profile_id UUID,
  days_remaining INTEGER,
  template_key TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    template_key,
    profile_id,
    'pending',
    0,
    jsonb_build_object(
      'profile_id', profile_id,
      'days_remaining', days_remaining,
      'timestamp', now()
    ),
    'scheduled'
  );
END;
$$ LANGUAGE plpgsql; 