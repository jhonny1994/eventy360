-- Update the email templates for verification to ensure correct context
-- For rejected verification requests, we need to clarify that this is about a rejection of request, not removal of badge
UPDATE public.email_templates
SET body_html_translations = jsonb_set(
  body_html_translations,
  '{en}',
  '"<p>Dear Esteemed Member,</p><p>We wish to inform you that your verification request on the Eventy360 platform has been reviewed and was not approved.</p><p>Reason: [rejection_reason]</p><p>You may submit a new verification request with updated documents if you wish to try again.</p><p>Thank you for your understanding and cooperation.</p><p>With sincere regards,<br>The Eventy360 Team</p>"'::jsonb
)
WHERE template_key = 'user_verified_badge_removed';

-- Update Arabic translation for rejected verification
UPDATE public.email_templates
SET body_html_translations = jsonb_set(
  body_html_translations,
  '{ar}',
  '"<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأنه تمت مراجعة طلب التوثيق الخاص بكم على منصة Eventy360 ولم يتم الموافقة عليه.</p><p>السبب: [rejection_reason]</p><p>يمكنكم تقديم طلب توثيق جديد مع مستندات محدثة إذا كنتم ترغبون في المحاولة مرة أخرى.</p><p>نشكركم على تفهمكم وتعاونكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>"'::jsonb
)
WHERE template_key = 'user_verified_badge_removed';

-- Update French translation for rejected verification
UPDATE public.email_templates
SET body_html_translations = jsonb_set(
  body_html_translations,
  '{fr}',
  '"<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que votre demande de vérification sur la plateforme Eventy360 a été examinée et n''a pas été approuvée.</p><p>Raison: [rejection_reason]</p><p>Vous pouvez soumettre une nouvelle demande de vérification avec des documents mis à jour si vous souhaitez essayer à nouveau.</p><p>Nous vous remercions de votre compréhension et de votre coopération.</p><p>Cordialement,<br>L''Équipe Eventy360</p>"'::jsonb
)
WHERE template_key = 'user_verified_badge_removed';

-- Create a view for verification request status with profile details
-- Simplified and fixed to use proper columns
CREATE OR REPLACE VIEW verification_request_details AS
SELECT 
  vr.id,
  vr.user_id,
  vr.document_path,
  vr.status,
  vr.submitted_at,
  vr.processed_at,
  vr.processed_by,
  vr.rejection_reason,
  vr.notes,
  p.user_type,
  p.is_verified,
  -- Use Arabic translation (ar) as primary, fallback to English or researcher name
  CASE
    WHEN p.user_type = 'organizer' THEN 
      COALESCE(op.name_translations->>'ar', op.name_translations->>'ar')
    WHEN p.user_type = 'researcher' THEN 
      rp.name
    ELSE 'Unknown'
  END AS user_name,
  CASE 
    WHEN p.user_type = 'organizer' THEN op.profile_picture_url
    WHEN p.user_type = 'researcher' THEN rp.profile_picture_url
    ELSE NULL
  END AS profile_picture_url,
  -- Admin who processed the request
  CASE
    WHEN vr.processed_by IS NOT NULL THEN
      COALESCE(admin_a.name, 'Admin')
    ELSE
      NULL
  END AS admin_name
FROM 
  verification_requests vr
JOIN 
  profiles p ON vr.user_id = p.id
LEFT JOIN 
  organizer_profiles op ON p.id = op.profile_id AND p.user_type = 'organizer'
LEFT JOIN 
  researcher_profiles rp ON p.id = rp.profile_id AND p.user_type = 'researcher'
LEFT JOIN 
  admin_profiles admin_a ON vr.processed_by = admin_a.profile_id;

-- Create a function to handle verification request status changes
CREATE OR REPLACE FUNCTION handle_verification_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  template_key TEXT;
  action_type admin_action_type;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine which template and action type to use based on the new status
    IF NEW.status = 'approved' THEN
      template_key := 'user_verified_badge_awarded';
      action_type := 'awarded_badge';
      
      -- Update the profile's is_verified status to true
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      template_key := 'user_verified_badge_removed';
      action_type := 'removed_badge';
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
$$ LANGUAGE plpgsql;

-- Create the trigger on verification_requests table for notifications
DROP TRIGGER IF EXISTS verification_request_notification_trigger ON verification_requests;

CREATE TRIGGER verification_request_notification_trigger
AFTER UPDATE OF status ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION handle_verification_request_status_change();

-- Create an admin view for easier filtering of verification requests
CREATE OR REPLACE VIEW admin_verification_requests AS
SELECT 
  vrd.*,
  CASE
    WHEN vrd.status = 'pending' THEN 'Pending Review'
    WHEN vrd.status = 'approved' THEN 'Approved'
    WHEN vrd.status = 'rejected' THEN 'Rejected'
    ELSE 'Unknown'
  END AS status_label,
  EXTRACT(EPOCH FROM (NOW() - vrd.submitted_at))/86400 AS days_pending
FROM 
  verification_request_details vrd
ORDER BY 
  CASE WHEN vrd.status = 'pending' THEN 0 ELSE 1 END,
  vrd.submitted_at DESC;

-- Grant appropriate privileges
GRANT SELECT ON verification_request_details TO authenticated;
GRANT SELECT ON admin_verification_requests TO authenticated; 