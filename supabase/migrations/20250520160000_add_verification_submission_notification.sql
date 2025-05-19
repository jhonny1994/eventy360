-- Add a notification trigger for submission of verification requests
-- This ensures users receive a confirmation email when they submit a verification request

-- First create the email template for verification request submission
INSERT INTO
    public.email_templates (
        template_key,
        subject_translations,
        body_html_translations
    )
VALUES
    (
        'verification_request_submitted',
        '{"ar": "تم استلام طلب التوثيق الخاص بكم في منصة Eventy360", "en": "Your Eventy360 Verification Request Received", "fr": "Votre demande de vérification Eventy360 reçue"}',
        '{"ar": "<p>السيد(ة) المحترم(ة)،</p><p>نود إشعاركم بأننا استلمنا طلب التوثيق الخاص بكم على منصة Eventy360 بنجاح. سيقوم فريقنا بمراجعة طلبكم في أقرب وقت ممكن.</p><p>تفاصيل الطلب:<br>- تاريخ التقديم: [submission_date]</p><p>سيتم إشعاركم عبر البريد الإلكتروني بمجرد الانتهاء من مراجعة طلبكم.</p><p>يمكنكم متابعة حالة الطلب من خلال صفحة ملفكم الشخصي.</p><p>مع خالص التقدير والاحترام،<br>فريق Eventy360</p>",
        "en": "<p>Dear Esteemed Member,</p><p>We would like to inform you that we have successfully received your verification request on the Eventy360 platform. Our team will review your request as soon as possible.</p><p>Request Details:<br>- Submission Date: [submission_date]</p><p>You will be notified by email once your request has been reviewed.</p><p>You can check the status of your request through your profile page.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>",
        "fr": "<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que nous avons bien reçu votre demande de vérification sur la plateforme Eventy360. Notre équipe examinera votre demande dans les plus brefs délais.</p><p>Détails de la demande:<br>- Date de soumission: [submission_date]</p><p>Vous serez notifié(e) par email dès que votre demande aura été examinée.</p><p>Vous pouvez vérifier l''état de votre demande sur votre page de profil.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>"}'
    );

-- Create a function to handle new verification request submissions
CREATE OR REPLACE FUNCTION handle_verification_request_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Add notification to queue for verification request submission
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    notification_type,
    status,
    attempts,
    payload_data
  ) VALUES (
    'verification_request_submitted',
    NEW.user_id,
    'immediate',
    'pending',
    0,
    jsonb_build_object(
      'profile_id', NEW.user_id,
      'verification_request_id', NEW.id,
      'submission_date', to_char(NEW.submitted_at, 'YYYY-MM-DD HH24:MI:SS')
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on verification_requests table for submission notifications
DROP TRIGGER IF EXISTS verification_request_submission_trigger ON verification_requests;

CREATE TRIGGER verification_request_submission_trigger
AFTER INSERT ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION handle_verification_request_submission();

-- Update the existing verification_request_status_change function
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

-- Grant appropriate privileges
GRANT SELECT ON verification_request_details TO authenticated; 