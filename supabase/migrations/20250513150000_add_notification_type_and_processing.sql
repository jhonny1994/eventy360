-- Create notification_type ENUM
CREATE TYPE public.notification_type_enum AS ENUM (
  'immediate',
  'scheduled'
);

-- Add notification_type column to notification_queue table using the ENUM
ALTER TABLE public.notification_queue 
ADD COLUMN notification_type public.notification_type_enum NOT NULL DEFAULT 'scheduled';

-- Add comments to notification_queue table for critical notifications
COMMENT ON TABLE public.notification_queue IS 'Stores email and notification queue items for processing by Edge Functions';
COMMENT ON COLUMN public.notification_queue.notification_type IS 'Type of notification: immediate (high priority) or scheduled (regular priority)';
COMMENT ON COLUMN public.notification_queue.template_key IS 'Template key for the email. Critical templates (payment_received_pending_verification, subscription_activated, admin_invitation) have immediate retry in Edge Function.';

-- Create HTTP extension if not exists (for webhook calls)
CREATE EXTENSION IF NOT EXISTS "http";

-- Create function to handle notification insert and categorize notifications
CREATE OR REPLACE FUNCTION handle_notification_insert()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  webhook_secret TEXT;
BEGIN
  -- Categorize notification type based on template_key
  CASE NEW.template_key
    WHEN 'admin_invitation' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_received_pending_verification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'subscription_activated' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'user_verified_badge_awarded' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'user_verified_badge_removed' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'trial_ending_soon' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'trial_expired' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    ELSE
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
  END CASE;
  
  -- For immediate notifications, we'll set up webhook but not call it directly
  -- This is safer as database triggers should be fast and not depend on external services
  -- Instead, we'll flag it for immediate processing by the Edge Function

  -- Critical notifications are processed immediately and have retry logic in the Edge Function
  -- The Edge Function (process-notification-queue) will:
  -- 1. Prioritize immediate notifications first
  -- 2. For critical templates, attempt immediate retry if first send fails
  -- 3. Apply exponential backoff for subsequent retries
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to execute the function on new notification inserts
CREATE TRIGGER notification_insert_trigger
BEFORE INSERT ON public.notification_queue
FOR EACH ROW EXECUTE FUNCTION handle_notification_insert();

-- Update RLS policy for notification_queue if needed
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Ensure only authenticated users can select their own notifications
CREATE POLICY select_own_notifications ON public.notification_queue
    FOR SELECT
    TO authenticated
    USING (recipient_profile_id = auth.uid() OR auth.uid() IN (SELECT profile_id FROM admin_profiles));

-- Ensure admin profiles can update notifications
CREATE POLICY update_as_admin ON public.notification_queue
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (SELECT profile_id FROM admin_profiles));

-- Add indexes for faster notification processing
CREATE INDEX idx_notification_queue_type ON public.notification_queue(notification_type, status);
CREATE INDEX idx_notification_queue_created_at ON public.notification_queue(created_at);

-- Index for critical template keys to quickly identify high-priority notifications
CREATE INDEX idx_notification_queue_critical_templates ON public.notification_queue(template_key) 
WHERE template_key IN ('payment_received_pending_verification', 'subscription_activated', 'admin_invitation'); 