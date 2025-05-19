-- Migration to fix verification triggers and enum casting issues
-- This migration addresses the issue with multiple competing triggers and improper enum casting

-- Begin transaction to ensure all changes are applied as a single unit
BEGIN;

-- 1. First, drop the duplicate trigger that's causing conflicts
DROP TRIGGER IF EXISTS verification_request_processing_trigger ON verification_requests;

-- 2. Fix the handle_profile_verification_change function to properly cast enum values
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
$$;

-- 3. Fix the handle_verification_request_status_change function to properly cast enum values
CREATE OR REPLACE FUNCTION public.handle_verification_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  template_key TEXT;
  action_type admin_action_type;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set the processed_at and processed_by fields
    NEW.processed_at := NOW();
    NEW.processed_by := auth.uid();
    NEW.updated_at := NOW();
    
    -- Determine which template and action type to use based on the new status
    IF NEW.status = 'approved' THEN
      template_key := 'user_verified_badge_awarded';
      action_type := 'awarded_badge'::admin_action_type;
      
      -- Update the profile's is_verified status to true
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      template_key := 'user_verified_badge_removed';
      action_type := 'removed_badge'::admin_action_type;
    END IF;
    
    -- Add to notification queue if template was determined
    IF template_key IS NOT NULL THEN
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        notification_type,
        status,
        attempts,
        payload_data
      ) VALUES (
        template_key,
        NEW.user_id,
        'immediate',
        'pending',
        0,
        jsonb_build_object(
          'profile_id', NEW.user_id,
          'verification_request_id', NEW.id,
          'verification_status', (NEW.status = 'approved'),
          'timestamp', now(),
          'rejection_reason', COALESCE(NEW.rejection_reason, 'Your verification documents did not meet our requirements.')
        )
      );
      
      -- Log the admin action with more detailed context
      INSERT INTO admin_actions_log (
        action_type,
        admin_user_id,
        target_user_id,
        target_entity_id,
        target_entity_type,
        details
      ) VALUES (
        action_type,
        auth.uid(),
        NEW.user_id,
        NEW.id,
        'verification_request',
        jsonb_build_object(
          'previous_status', OLD.status,
          'new_status', NEW.status,
          'document_path', NEW.document_path,
          'rejection_reason', NEW.rejection_reason,
          'notes', NEW.notes
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Recreate the verification request notification trigger to ensure it uses the corrected function
DROP TRIGGER IF EXISTS verification_request_notification_trigger ON verification_requests;

CREATE TRIGGER verification_request_notification_trigger
BEFORE UPDATE OF status ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION handle_verification_request_status_change();

-- Add comments documenting the functions
COMMENT ON FUNCTION handle_verification_request_status_change() IS 'Processes verification request status changes, properly casting action_type to admin_action_type enum.';
COMMENT ON FUNCTION handle_profile_verification_change() IS 'Handles profile verification status changes, properly casting action_type to admin_action_type enum.';

-- Commit the changes
COMMIT;