-- Migration: Update Admin Invitation System (v3 - Simplified Email)
-- Description: This migration further simplifies the admin_invitation email template and 
-- the create_admin_invitation SQL function by removing admin_name, role, and validity_period.

-- Update the email template for admin invitation
UPDATE public.email_templates
SET 
  subject_translations = jsonb_build_object(
    'en', 'Your Eventy360 Admin Account Activation',
    'fr', 'Activation de votre compte administrateur Eventy360',
    'ar', 'تفعيل حساب المشرف الخاص بك على Eventy360'
  ),
  body_html_translations = jsonb_build_object(
    'en', '<p>Hello,</p><p>Please click the following link to activate your Eventy360 admin account and complete your registration: <a href="{{magic_link}}">Activate Account</a></p><p>If you did not expect this invitation, you can safely ignore this email.</p>',
    'fr', '<p>Bonjour,</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte administrateur Eventy360 et compléter votre inscription : <a href="{{magic_link}}">Activer le compte</a></p><p>Si vous n''attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.</p>',
    'ar', '<p>مرحباً،</p><p>يرجى الضغط على الرابط التالي لتفعيل حساب المشرف الخاص بك على Eventy360 وإكمال تسجيلك: <a href="{{magic_link}}">تفعيل الحساب</a></p><p>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>'
  ),
  description_translations = jsonb_build_object(
    'en', 'Email sent to invited admins with a magic link for account activation.',
    'fr', 'Email envoyé aux administrateurs invités avec un lien magique pour l''activation du compte.',
    'ar', 'البريد الإلكتروني المرسل إلى المشرفين المدعوين مع رابط سحري لتفعيل الحساب.'
  ),
  available_placeholders = ARRAY['magic_link'] -- Only magic_link remains
WHERE template_key = 'admin_invitation';

-- Ensure the template exists (idempotency)
INSERT INTO public.email_templates (template_key, subject_translations, body_html_translations, description_translations, available_placeholders)
SELECT 
  'admin_invitation',
  jsonb_build_object(
    'en', 'Your Eventy360 Admin Account Activation',
    'fr', 'Activation de votre compte administrateur Eventy360',
    'ar', 'تفعيل حساب المشرف الخاص بك على Eventy360'
  ),
  jsonb_build_object(
    'en', '<p>Hello,</p><p>Please click the following link to activate your Eventy360 admin account and complete your registration: <a href="{{magic_link}}">Activate Account</a></p><p>If you did not expect this invitation, you can safely ignore this email.</p>',
    'fr', '<p>Bonjour,</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte administrateur Eventy360 et compléter votre inscription : <a href="{{magic_link}}">Activer le compte</a></p><p>Si vous n''attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.</p>',
    'ar', '<p>مرحباً،</p><p>يرجى الضغط على الرابط التالي لتفعيل حساب المشرف الخاص بك على Eventy360 وإكمال تسجيلك: <a href="{{magic_link}}">تفعيل الحساب</a></p><p>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>'
  ),
  jsonb_build_object(
    'en', 'Email sent to invited admins with a magic link for account activation.',
    'fr', 'Email envoyé aux administrateurs invités avec un lien magique pour l''activation du compte.',
    'ar', 'البريد الإلكتروني المرسل إلى المشرفين المدعوين مع رابط سحري لتفعيل الحساب.'
  ),
  ARRAY['magic_link'] -- Only magic_link remains
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE template_key = 'admin_invitation'
);

-- Drop the existing function signatures before creating the updated version
DROP FUNCTION IF EXISTS public.create_admin_invitation(text, text);
DROP FUNCTION IF EXISTS public.create_admin_invitation(text, text, text, text);
DROP FUNCTION IF EXISTS public.create_admin_invitation(text, text); -- For the new signature

-- Recreate/Update the create_admin_invitation function
CREATE OR REPLACE FUNCTION public.create_admin_invitation(
    p_invited_user_email TEXT, 
    p_magic_link TEXT          -- The generated magic link
)
 RETURNS VOID 
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- This function now only queues the notification with the magic link,
  -- and stores the recipient email in the payload_data instead of recipient_email column
  
  INSERT INTO public.notification_queue (
    template_key,
    recipient_profile_id, -- Set to NULL as we don't have a profile yet
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'admin_invitation',
    NULL, -- No profile ID associated yet
    'pending',
    0,
    jsonb_build_object(
      'magic_link', p_magic_link,
      'recipient_email', p_invited_user_email -- Store email in payload_data
    ),
    'immediate'
  );
END;
$function$;

-- Add comment to the updated function
COMMENT ON FUNCTION public.create_admin_invitation(TEXT, TEXT) 
IS 'Queues a simplified admin invitation email containing only a magic link. The email address is stored in payload_data instead of recipient_email.';

-- Migration comment
COMMENT ON MIGRATION '20250802100000_update_admin_invitation_system.sql' IS 'Simplifies admin_invitation email template and SQL function to only use magic_link. Email is stored in payload_data.'; 