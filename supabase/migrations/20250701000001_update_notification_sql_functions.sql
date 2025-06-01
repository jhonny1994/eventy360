-- Migration to update SQL functions that generate notification payloads
-- This is part of the notification system cleanup project to simplify email templates
-- by removing URLs, emails, and clickable elements, keeping only plain text placeholders.

-- Update the handle_verification_badge_change function to remove URL/email fields
CREATE OR REPLACE FUNCTION handle_verification_badge_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification status changed
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
    IF NEW.is_verified = true THEN
      -- User gained verification badge
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data
      ) VALUES (
        'user_verified_badge_awarded',
        NEW.id,
        'pending',
        0,
        jsonb_build_object(
          'user_id', NEW.id,
          'verified_date', to_char(now(), 'YYYY-MM-DD')
          -- Removed profile_page_link field completely
        )
      );
    ELSE
      -- User lost verification badge
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data
      ) VALUES (
        'user_verified_badge_removed',
        NEW.id,
        'pending',
        0,
        jsonb_build_object(
          'user_id', NEW.id
          -- Removed Profile Page Link and Support Email fields completely
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the create_payment_reported_notification function to remove URL/email fields
CREATE OR REPLACE FUNCTION create_payment_reported_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for newly reported payment
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'payment_received_pending_verification',
    NEW.user_id,
    'pending',
    0,
    jsonb_build_object(
      'payment_id', NEW.id,
      'reference_number', COALESCE(NEW.reference_number, NEW.id),
      'amount', NEW.amount || ' DZD',
      'date', to_char(NEW.reported_at, 'YYYY-MM-DD')
      -- Removed Finance Department Email field completely
    ),
    'immediate'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_payment_verification function to remove URL/email fields
CREATE OR REPLACE FUNCTION handle_payment_verification()
RETURNS TRIGGER AS $$
DECLARE
  subscription_rec RECORD;
BEGIN
  -- Proceed if status changed
  IF OLD.status != NEW.status THEN
    -- For verified payments - queue notification email
    IF NEW.status = 'verified' THEN
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
        'payment_verified_notification',
        NEW.user_id,
        'pending',
        0,
        jsonb_build_object(
          'payment_id', NEW.id,
          'reference_number', COALESCE(NEW.reference_number, NEW.id),
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
          'reference_number', COALESCE(NEW.reference_number, NEW.id),
          'amount', NEW.amount,
          'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
          'rejection_reason', COALESCE(NEW.rejection_reason, 'The payment could not be verified.')
          -- Removed support_email field completely
        ),
        'immediate'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the activate_subscription function to remove URL/email fields
CREATE OR REPLACE FUNCTION activate_subscription(subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_rec RECORD;
  user_id UUID;
BEGIN
  -- Get subscription details
  SELECT 
    s.id,
    s.user_id,
    s.start_date,
    s.end_date,
    t.name AS tier_name
  INTO sub_rec
  FROM subscriptions s
  JOIN subscription_tiers t ON s.tier_id = t.id
  WHERE s.id = subscription_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  user_id := sub_rec.user_id;
  
  -- Mark as active
  UPDATE subscriptions
  SET is_active = true
  WHERE id = subscription_id;
  
  -- Queue notification
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'subscription_activated',
    user_id,
    'pending',
    0,
    jsonb_build_object(
      'subscription_id', subscription_id,
      'package_type', sub_rec.tier_name,
      'start_date', to_char(sub_rec.start_date, 'YYYY-MM-DD'),
      'end_date', to_char(sub_rec.end_date, 'YYYY-MM-DD')
      -- Removed Subscription Management Page Link field completely
    ),
    'immediate'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update the create_trial_ending_notification function to remove URL/email fields
CREATE OR REPLACE FUNCTION create_trial_ending_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for trial ending soon
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data
  ) VALUES (
    'trial_ending_soon',
    NEW.user_id,
    'pending',
    0,
    jsonb_build_object(
      'subscription_id', NEW.id,
      'expiry_date', to_char(NEW.end_date, 'YYYY-MM-DD')
      -- Removed Upgrade/Payment Page Link and Support Email fields completely
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the create_trial_expired_notification function to remove URL/email fields
CREATE OR REPLACE FUNCTION create_trial_expired_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for trial expiry
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data
  ) VALUES (
    'trial_expired',
    NEW.user_id,
    'pending',
    0,
    jsonb_build_object(
      'subscription_id', NEW.id,
      'expiry_date', to_char(NEW.end_date, 'YYYY-MM-DD')
      -- Removed Upgrade/Payment Page Link and Support Email fields completely
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the create_admin_invitation function to remove URL/email fields
CREATE OR REPLACE FUNCTION create_admin_invitation(email TEXT, role_name TEXT DEFAULT 'admin')
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
  validity_hours INTEGER := 48;
BEGIN
  -- Create invitation record
  INSERT INTO admin_invitations (email, role, expires_at)
  VALUES (email, role_name, NOW() + (validity_hours * INTERVAL '1 hour'))
  RETURNING id INTO invitation_id;
  
  -- Create notification
  INSERT INTO notification_queue (
    template_key,
    recipient_email,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'admin_invitation',
    email,
    'pending',
    0,
    jsonb_build_object(
      'invitation_id', invitation_id,
      'validity_period', validity_hours || ' hours',
      'role', role_name
      -- Removed signin_link and platform_management_email fields completely
    ),
    'immediate'
  );
  
  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment to document this migration
COMMENT ON MIGRATION IS 'Update SQL functions that generate notification payloads to completely remove URL/email fields'; 