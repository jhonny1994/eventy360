-- Add missing email templates for payment verification and rejection

-- First ensure these templates don't already exist (for idempotency)
DELETE FROM public.email_templates
WHERE
    template_key IN (
        'payment_verified_notification',
        'payment_rejected_notification'
    );

-- Insert new templates with placeholders and proper translations
INSERT INTO
    public.email_templates (
        template_key,
        subject_translations,
        body_html_translations
    )
VALUES
    (
        'payment_verified_notification',
        '{"ar": "تم التحقق من دفعتكم وتفعيل الاشتراك", "en": "Payment Verified and Subscription Activated", "fr": "Paiement vérifié et abonnement activé"}',
        '{"ar": "<p>السيد(ة) المحترم(ة)،</p><p>يسرنا إعلامكم بأنه تم التحقق من دفعتكم بنجاح وتفعيل اشتراككم في منصة Eventy360. يمكنكم الآن الاستفادة من جميع الميزات المتاحة ضمن باقة اشتراككم.</p><p>تفاصيل الدفع:<br>- رقم المرجع: [reference_number]<br>- المبلغ: [amount] د.ج<br>- طريقة الدفع: [payment_method]<br>- فترة الاشتراك: [billing_period]</p><p>تفاصيل الاشتراك:<br>- نوع الباقة: [subscription_tier]<br>- تاريخ البدء: [start_date]<br>- تاريخ الانتهاء: [end_date]</p><p>يمكنكم إدارة اشتراككم والاطلاع على التفاصيل من خلال صفحة إدارة الاشتراك على المنصة.</p><p>نشكركم على ثقتكم بمنصة Eventy360، ونتطلع إلى تقديم تجربة أكاديمية متميزة لكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>",
        "en": "<p>Dear Esteemed Member,</p><p>We are pleased to inform you that your payment has been successfully verified and your subscription to the Eventy360 platform has been activated. You can now take advantage of all the features available within your subscription package.</p><p>Payment Details:<br>- Reference Number: [reference_number]<br>- Amount: [amount] DZD<br>- Payment Method: [payment_method]<br>- Billing Period: [billing_period]</p><p>Subscription Details:<br>- Package Type: [subscription_tier]<br>- Start Date: [start_date]<br>- End Date: [end_date]</p><p>You can manage your subscription and view the details through your account dashboard on the platform.</p><p>Thank you for your trust in the Eventy360 platform. We look forward to providing you with an exceptional academic experience.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>",
        "fr": "<p>Cher(e) Membre Estimé(e),</p><p>Nous avons le plaisir de vous informer que votre paiement a été vérifié avec succès et que votre abonnement à la plateforme Eventy360 a été activé. Vous pouvez désormais profiter de toutes les fonctionnalités disponibles dans votre forfait d''abonnement.</p><p>Détails du paiement :<br>- Numéro de référence : [reference_number]<br>- Montant : [amount] DZD<br>- Méthode de paiement : [payment_method]<br>- Période de facturation : [billing_period]</p><p>Détails de l''abonnement :<br>- Type de forfait : [subscription_tier]<br>- Date de début : [start_date]<br>- Date de fin : [end_date]</p><p>Vous pouvez gérer votre abonnement et consulter les détails via votre tableau de bord sur la plateforme.</p><p>Nous vous remercions de votre confiance en la plateforme Eventy360 et nous nous réjouissons de vous offrir une expérience académique exceptionnelle.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>"}'
    ),
    (
        'payment_rejected_notification',
        '{"ar": "إشعار بخصوص دفعتكم - المراجعة لم تكتمل", "en": "Notice Regarding Your Payment - Verification Not Completed", "fr": "Avis concernant votre paiement - Vérification non complétée"}',
        '{"ar": "<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأننا قمنا بمراجعة دفعتكم المقدمة، ونأسف لإبلاغكم بأن عملية التحقق لم تكتمل بنجاح للأسباب التالية:</p><p>[rejection_reason]</p><p>تفاصيل الدفع المرفوض:<br>- رقم المرجع: [reference_number]<br>- المبلغ: [amount] د.ج<br>- تاريخ التقديم: [reported_date]</p><p>يمكنكم إعادة تقديم طلب الدفع مع مراعاة الأسباب المذكورة أعلاه. للمساعدة، يرجى التواصل مع فريق الدعم على [support_email].</p><p>نشكركم على تفهمكم وتعاونكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>",
        "en": "<p>Dear Esteemed Member,</p><p>We wish to inform you that we have reviewed your submitted payment, and regret to inform you that the verification process could not be completed successfully for the following reasons:</p><p>[rejection_reason]</p><p>Rejected Payment Details:<br>- Reference Number: [reference_number]<br>- Amount: [amount] DZD<br>- Submission Date: [reported_date]</p><p>You may resubmit a payment request, considering the reasons mentioned above. For assistance, please contact our support team at [support_email].</p><p>Thank you for your understanding and cooperation.</p><p>With sincere regards,<br>The Eventy360 Team</p>",
        "fr": "<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que nous avons examiné votre paiement soumis, et regrettons de vous informer que le processus de vérification n''a pas pu être complété avec succès pour les raisons suivantes :</p><p>[rejection_reason]</p><p>Détails du paiement rejeté :<br>- Numéro de référence : [reference_number]<br>- Montant : [amount] DZD<br>- Date de soumission : [reported_date]</p><p>Vous pouvez soumettre à nouveau une demande de paiement, en tenant compte des raisons mentionnées ci-dessus. Pour obtenir de l''aide, veuillez contacter notre équipe de support à [support_email].</p><p>Nous vous remercions de votre compréhension et de votre coopération.</p><p>Cordialement,<br>L''Équipe Eventy360</p>"}'
    );

-- Update the notification categorization function to ensure these templates are processed with the correct priority
CREATE OR REPLACE FUNCTION handle_notification_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Categorize notification type based on template_key
  CASE NEW.template_key
    WHEN 'admin_invitation' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_received_pending_verification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_verified_notification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_rejected_notification' THEN
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the critical templates index to include our new templates
DROP INDEX IF EXISTS idx_notification_queue_critical_templates;
CREATE INDEX idx_notification_queue_critical_templates ON public.notification_queue(template_key) 
WHERE template_key IN ('payment_received_pending_verification', 'payment_verified_notification', 'payment_rejected_notification', 'admin_invitation');

COMMENT ON COLUMN public.notification_queue.template_key IS 'Template key for the email. Critical templates (payment_received_pending_verification, payment_verified_notification, payment_rejected_notification, admin_invitation) have immediate retry in Edge Function.'; 