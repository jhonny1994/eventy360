-- Migration to fix duplicate verification emails issue
-- This migration modifies the handle_verification_request_status_change function
-- to follow the Single Responsibility Principle

BEGIN;

-- Modify handle_verification_request_status_change function to remove notification logic for approvals
CREATE OR REPLACE FUNCTION public.handle_verification_request_status_change()
RETURNS TRIGGER AS $$
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
    
    -- Determine the action type based on the new status
    IF NEW.status = 'approved' THEN
      action_type := 'awarded_badge';
      
      -- Update the profile's is_verified status to true
      -- The trigger on profiles table will handle the notification
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
      
    ELSIF NEW.status = 'rejected' THEN
      -- Fix: Use a more accurate action_type for rejections
      action_type := 'processed_verification_request';
      -- Fix: Use a specific template for rejections
      template_key := 'verification_request_rejected';
      
      -- For rejections, we need to send a notification here
      -- since the profile trigger won't fire (is_verified doesn't change)
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
          'verification_request_id', NEW.id,
          'rejection_reason', COALESCE(NEW.rejection_reason, 'Your verification documents did not meet our requirements.')
        )
      );
    END IF;
    
    -- Log the admin action only if an action type was determined
    IF action_type IS NOT NULL THEN
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_verification_request_status_change() IS 'Processes verification request status changes. For approvals, updates profile status and lets profile trigger handle notification. For rejections, sends notification directly.';

COMMIT; 