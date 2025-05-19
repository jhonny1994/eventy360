-- Migration to prevent duplicate verification notification emails
-- This fixes the issue where users receive multiple verification emails when an admin 
-- approves a verification request

-- Start transaction to ensure all changes apply as one unit
BEGIN;

-- Update the handle_profile_verification_change function to check for recent notifications
-- before creating a new one. This prevents duplicate emails.
CREATE OR REPLACE FUNCTION public.handle_profile_verification_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only proceed if is_verified status changed
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
    -- Log the admin action with proper enum casting
    INSERT INTO admin_actions_log (
      action_type,
      admin_user_id,
      target_user_id,
      details
    ) VALUES (
      CASE 
        WHEN NEW.is_verified = TRUE THEN 'awarded_badge'::admin_action_type
        ELSE 'removed_badge'::admin_action_type
      END,
      auth.uid(),
      NEW.id,
      jsonb_build_object(
        'previous_status', OLD.is_verified,
        'new_status', NEW.is_verified
      )
    );
    
    -- Check if a notification with the same template was recently created
    -- This prevents duplicate emails when triggered by verification_request status changes
    IF NOT EXISTS (
      SELECT 1 FROM notification_queue 
      WHERE recipient_profile_id = NEW.id 
      AND template_key = CASE 
          WHEN NEW.is_verified = TRUE THEN 'user_verified_badge_awarded'
          ELSE 'user_verified_badge_removed'
        END
      AND created_at > (NOW() - INTERVAL '30 seconds')
    ) THEN
      -- No recent notification found, safe to create a new one
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add a comment to document the function's purpose and the bug it fixes
COMMENT ON FUNCTION handle_profile_verification_change() IS 
  'Handles profile verification status changes and logs admin actions. Includes duplicate notification prevention logic to prevent multiple emails when verification requests are approved.';

-- Commit the changes
COMMIT; 