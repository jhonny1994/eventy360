-- Migration to update all email templates to remove HTML anchor tags and standardize placeholders
-- This is part of the notification system cleanup project to simplify email templates
-- by removing URLs, emails, and clickable elements, keeping only plain text placeholders.

-- Template: user_verified_badge_awarded
-- Update to remove HTML anchor tags and URL links completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>يسرنا إعلامكم بأنه قد تم منحكم شارة التوثيق الرسمية على منصة Eventy360. تعد هذه الشارة بمثابة دليل على موثوقية حسابكم وتميزكم ضمن مجتمعنا الأكاديمي.</p><p>يمكنكم الاطلاع على ملفكم الشخصي والشارة الجديدة من خلال صفحة الملف الشخصي.</p><p>نشكركم على انضمامكم لمجتمع Eventy360 ونتطلع إلى مساهمتكم القيمة.</p><p>مع خالص التقدير والاحترام،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We are pleased to inform you that your profile on Eventy360 has been awarded the official verification badge. This badge serves as a testament to your credibility and distinction within our academic community.</p><p>You can view your profile and new badge through your profile page.</p><p>Thank you for being part of the Eventy360 community. We look forward to your valuable contributions.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous avons le plaisir de vous informer que votre profil sur Eventy360 a reçu le badge de vérification officiel. Ce badge témoigne de votre crédibilité et de votre distinction au sein de notre communauté académique.</p><p>Vous pouvez consulter votre profil et votre nouveau badge via la page de profil.</p><p>Nous vous remercions de faire partie de la communauté Eventy360 et nous nous réjouissons de vos précieuses contributions.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'user_verified_badge_awarded';

-- Template: user_verified_badge_removed
-- Update to remove Profile Page Link placeholders and Support Email references completely
-- Note: This template is intentionally static with no dynamic placeholders.
-- The handle_verification_badge_change function has been updated in 20250701000001_update_notification_sql_functions.sql
-- to ensure compatibility with this static template approach.
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأنه تم إزالة شارة التوثيق من ملفكم الشخصي على منصة Eventy360.</p><p>إذا كان لديكم أي استفسارات بخصوص هذا الإجراء، يرجى التواصل مع فريق الدعم الأكاديمي.</p><p>يمكنكم الاطلاع على ملفكم الشخصي من صفحة الملف الشخصي.</p><p>نشكركم على تفهمكم وتعاونكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We wish to inform you that the verification badge has been removed from your profile on the Eventy360 platform.</p><p>If you have any inquiries regarding this action, please contact our academic support team.</p><p>You can view your profile through your profile page.</p><p>Thank you for your understanding and cooperation.</p><p>With sincere regards,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que le badge de vérification a été retiré de votre profil sur la plateforme Eventy360.</p><p>Si vous avez des questions concernant cette action, veuillez contacter notre équipe de support académique.</p><p>Vous pouvez consulter votre profil via la page de profil.</p><p>Nous vous remercions de votre compréhension et de votre coopération.</p><p>Cordialement,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'user_verified_badge_removed';

-- Template: payment_received_pending_verification
-- Update to remove Finance Department Email references completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأننا استلمنا إشعار دفعتكم بنجاح. سيقوم فريقنا المختص بمراجعة تفاصيل الدفع والتحقق منها خلال فترة لا تتجاوز 48 ساعة عمل، وسيتم تحديث حالة اشتراككم فور الانتهاء من عملية التحقق.</p><p>تفاصيل العملية:<br>- رقم المرجع: {{reference_number}}<br>- المبلغ: {{amount}}<br>- التاريخ: {{date}}</p><p>في حال وجود أي استفسارات تتعلق بعملية الدفع، يرجى التواصل مع قسم المالية.</p><p>نشكركم على ثقتكم بخدماتنا.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We are pleased to inform you that we have successfully received your payment notification. Our specialized team will review and verify the payment details within a period not exceeding 48 business hours, and your subscription status will be updated immediately upon completion of the verification process.</p><p>Transaction Details:<br>- Reference Number: {{reference_number}}<br>- Amount: {{amount}}<br>- Date: {{date}}</p><p>Should you have any inquiries regarding the payment process, please contact our finance department.</p><p>Thank you for your trust in our services.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous avons le plaisir de vous informer que nous avons bien reçu votre notification de paiement. Notre équipe spécialisée examinera et vérifiera les détails du paiement dans un délai ne dépassant pas 48 heures ouvrables, et l''état de votre abonnement sera mis à jour immédiatement après la finalisation du processus de vérification.</p><p>Détails de la transaction :<br>- Numéro de référence : {{reference_number}}<br>- Montant : {{amount}}<br>- Date : {{date}}</p><p>Si vous avez des questions concernant le processus de paiement, veuillez contacter notre département financier.</p><p>Nous vous remercions de votre confiance en nos services.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'payment_received_pending_verification';

-- Template: subscription_activated
-- Update to remove Subscription Management Page links completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>يسرنا إعلامكم بأنه قد تم تفعيل اشتراككم في منصة Eventy360 بنجاح. بإمكانكم الآن الاستفادة من كافة المزايا والخدمات المتاحة ضمن باقة اشتراككم.</p><p>تفاصيل الاشتراك:<br>- نوع الباقة: {{package_type}}<br>- تاريخ البدء: {{start_date}}<br>- تاريخ الانتهاء: {{end_date}}</p><p>يمكنكم إدارة اشتراككم والاطلاع على التفاصيل من صفحة الاشتراكات.</p><p>نشكركم على ثقتكم بمنصة Eventy360، ونتطلع إلى تقديم تجربة أكاديمية متميزة لكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We are pleased to inform you that your subscription to the Eventy360 platform has been successfully activated. You can now take advantage of all the features and services available within your subscription package.</p><p>Subscription Details:<br>- Package Type: {{package_type}}<br>- Start Date: {{start_date}}<br>- End Date: {{end_date}}</p><p>You can manage your subscription and view the details through your subscriptions page.</p><p>Thank you for your trust in the Eventy360 platform. We look forward to providing you with an exceptional academic experience.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous avons le plaisir de vous informer que votre abonnement à la plateforme Eventy360 a été activé avec succès. Vous pouvez désormais profiter de toutes les fonctionnalités et services disponibles dans votre forfait d''abonnement.</p><p>Détails de l''abonnement :<br>- Type de forfait : {{package_type}}<br>- Date de début : {{start_date}}<br>- Date de fin : {{end_date}}</p><p>Vous pouvez gérer votre abonnement et consulter les détails via la page des abonnements.</p><p>Nous vous remercions de votre confiance en la plateforme Eventy360 et nous nous réjouissons de vous offrir une expérience académique exceptionnelle.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'subscription_activated';

-- Template: trial_ending_soon
-- Update to remove Upgrade/Payment Page Link and Support Email completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأن فترة التجربة المجانية لاشتراككم في منصة Eventy360 ستنتهي قريباً في تاريخ {{expiry_date}}.</p><p>نأمل أن تكونوا قد استفدتم من تجربة منصتنا خلال هذه الفترة. للاستمرار في الاستفادة من كافة الميزات والخدمات دون انقطاع، ندعوكم لترقية اشتراككم إلى إحدى باقاتنا المدفوعة.</p><p>يمكنكم الاطلاع على خيارات الترقية المتاحة وإتمام عملية الدفع من صفحة الاشتراكات.</p><p>في حال وجود أي استفسارات أو مساعدة مطلوبة، يرجى التواصل مع فريق الدعم.</p><p>نشكركم على اهتمامكم بمنصة Eventy360.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We wish to inform you that your free trial period for the Eventy360 platform will expire soon on {{expiry_date}}.</p><p>We hope you have benefited from experiencing our platform during this period. To continue enjoying all features and services without interruption, we invite you to upgrade your subscription to one of our paid packages.</p><p>You can view the available upgrade options and complete the payment process through the subscriptions page.</p><p>Should you have any inquiries or require assistance, please contact our support team.</p><p>Thank you for your interest in the Eventy360 platform.</p><p>With sincere regards,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que votre période d''essai gratuit pour la plateforme Eventy360 expirera prochainement le {{expiry_date}}.</p><p>Nous espérons que vous avez bénéficié de l''expérience de notre plateforme pendant cette période. Pour continuer à profiter de toutes les fonctionnalités et services sans interruption, nous vous invitons à mettre à niveau votre abonnement vers l''un de nos forfaits payants.</p><p>Vous pouvez consulter les options de mise à niveau disponibles et finaliser le processus de paiement via la page des abonnements.</p><p>Si vous avez des questions ou besoin d''assistance, veuillez contacter notre équipe de support.</p><p>Nous vous remercions de votre intérêt pour la plateforme Eventy360.</p><p>Cordialement,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'trial_ending_soon';

-- Template: trial_expired
-- Update to remove Upgrade/Payment Page Link and Support Email completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأن فترة التجربة المجانية لاشتراككم في منصة Eventy360 قد انتهت. لاستعادة الوصول الكامل إلى جميع الميزات والخدمات، ندعوكم لترقية حسابكم إلى إحدى باقاتنا المدفوعة.</p><p>بإمكانكم الاطلاع على خيارات الترقية المتاحة وإتمام عملية الدفع من صفحة الاشتراكات.</p><p>تفاصيل الاشتراك المنتهي:<br>- نوع الباقة: تجريبية<br>- تاريخ الانتهاء: {{expiry_date}}</p><p>في حال وجود أي استفسارات أو مساعدة مطلوبة، يرجى التواصل مع فريق الدعم.</p><p>نشكركم على اهتمامكم بمنصة Eventy360.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We wish to inform you that your free trial period for the Eventy360 platform has expired. To regain full access to all features and services, we invite you to upgrade your account to one of our paid packages.</p><p>You can view the available upgrade options and complete the payment process through the subscriptions page.</p><p>Expired Subscription Details:<br>- Package Type: Trial<br>- Expiry Date: {{expiry_date}}</p><p>Should you have any inquiries or require assistance, please contact our support team.</p><p>Thank you for your interest in the Eventy360 platform.</p><p>With sincere regards,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que votre période d''essai gratuit pour la plateforme Eventy360 a expiré. Pour retrouver un accès complet à toutes les fonctionnalités et services, nous vous invitons à mettre à niveau votre compte vers l''un de nos forfaits payants.</p><p>Vous pouvez consulter les options de mise à niveau disponibles et finaliser le processus de paiement via la page des abonnements.</p><p>Détails de l''abonnement expiré :<br>- Type de forfait : Essai<br>- Date d''expiration : {{expiry_date}}</p><p>Si vous avez des questions ou besoin d''assistance, veuillez contacter notre équipe de support.</p><p>Nous vous remercions de votre intérêt pour la plateforme Eventy360.</p><p>Cordialement,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'trial_expired';

-- Template: admin_invitation
-- Update to remove signin_link HTML anchor tag and platform_management_email completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>يسرنا دعوتكم للانضمام إلى فريق إدارة منصة Eventy360 بصفة مسؤول. هذه الدعوة تعكس ثقتنا في خبراتكم ومؤهلاتكم للمساهمة في تطوير وإدارة المنصة.</p><p>يرجى التواصل مع إدارة المنصة لإكمال عملية تسجيل حسابكم كمسؤول.</p><p>يرجى العلم بأن هذه الدعوة صالحة لمدة {{validity_period}} من تاريخ استلام هذه الرسالة.</p><p>ملاحظة هامة: إذا لم تكونوا تتوقعون استلام هذه الدعوة، أو إذا كان هناك أي استفسارات، يرجى التواصل معنا مباشرة، وعدم اتخاذ أي إجراء بخصوص هذه الرسالة.</p><p>نتطلع إلى انضمامكم إلى فريقنا والعمل سوياً لتحقيق أهداف المنصة.</p><p>مع خالص التقدير والاحترام،<br>إدارة منصة Eventy360</p>',
    'en', '<p>Dear Esteemed Colleague,</p><p>We are pleased to invite you to join the management team of the Eventy360 platform as an administrator. This invitation reflects our confidence in your expertise and qualifications to contribute to the development and management of the platform.</p><p>Please contact platform management to complete your administrator account registration process.</p><p>Please note that this invitation is valid for {{validity_period}} from the date of receiving this message.</p><p>Important Note: If you were not expecting to receive this invitation, or if you have any inquiries, please contact us directly and do not take any action regarding this message.</p><p>We look forward to your joining our team and working together to achieve the platform''s objectives.</p><p>With sincere appreciation and respect,<br>Eventy360 Platform Management</p>',
    'fr', '<p>Cher(ère) Collègue Estimé(e),</p><p>Nous avons le plaisir de vous inviter à rejoindre l''équipe de gestion de la plateforme Eventy360 en tant qu''administrateur. Cette invitation reflète notre confiance en votre expertise et vos qualifications pour contribuer au développement et à la gestion de la plateforme.</p><p>Veuillez contacter la direction de la plateforme pour compléter votre processus d''inscription en tant qu''administrateur.</p><p>Veuillez noter que cette invitation est valable pendant {{validity_period}} à compter de la date de réception de ce message.</p><p>Note importante : Si vous ne vous attendiez pas à recevoir cette invitation, ou si vous avez des questions, veuillez nous contacter directement, et ne prenez aucune mesure concernant ce message.</p><p>Nous nous réjouissons de vous accueillir dans notre équipe et de travailler ensemble pour atteindre les objectifs de la plateforme.</p><p>Avec notre sincère considération et respect,<br>La Direction de la Plateforme Eventy360</p>'
)
WHERE template_key = 'admin_invitation';

-- Template: payment_verified_notification
-- Standardize placeholders to mustache format
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>يسرنا إعلامكم بأنه تم التحقق من دفعتكم بنجاح وتفعيل اشتراككم في منصة Eventy360. يمكنكم الآن الاستفادة من جميع الميزات المتاحة ضمن باقة اشتراككم.</p><p>تفاصيل الدفع:<br>- رقم المرجع: {{reference_number}}<br>- المبلغ: {{amount}} د.ج<br>- طريقة الدفع: {{payment_method}}<br>- فترة الاشتراك: {{billing_period}}</p><p>تفاصيل الاشتراك:<br>- نوع الباقة: {{subscription_tier}}<br>- تاريخ البدء: {{start_date}}<br>- تاريخ الانتهاء: {{end_date}}</p><p>يمكنكم إدارة اشتراككم والاطلاع على التفاصيل من خلال صفحة الاشتراكات على المنصة.</p><p>نشكركم على ثقتكم بمنصة Eventy360، ونتطلع إلى تقديم تجربة أكاديمية متميزة لكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We are pleased to inform you that your payment has been successfully verified and your subscription to the Eventy360 platform has been activated. You can now take advantage of all the features available within your subscription package.</p><p>Payment Details:<br>- Reference Number: {{reference_number}}<br>- Amount: {{amount}} DZD<br>- Payment Method: {{payment_method}}<br>- Billing Period: {{billing_period}}</p><p>Subscription Details:<br>- Package Type: {{subscription_tier}}<br>- Start Date: {{start_date}}<br>- End Date: {{end_date}}</p><p>You can manage your subscription and view the details through your account dashboard on the platform.</p><p>Thank you for your trust in the Eventy360 platform. We look forward to providing you with an exceptional academic experience.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous avons le plaisir de vous informer que votre paiement a été vérifié avec succès et que votre abonnement à la plateforme Eventy360 a été activé. Vous pouvez désormais profiter de toutes les fonctionnalités disponibles dans votre forfait d''abonnement.</p><p>Détails du paiement :<br>- Numéro de référence : {{reference_number}}<br>- Montant : {{amount}} DZD<br>- Méthode de paiement : {{payment_method}}<br>- Période de facturation : {{billing_period}}</p><p>Détails de l''abonnement :<br>- Type de forfait : {{subscription_tier}}<br>- Date de début : {{start_date}}<br>- Date de fin : {{end_date}}</p><p>Vous pouvez gérer votre abonnement et consulter les détails via votre tableau de bord sur la plateforme.</p><p>Nous vous remercions de votre confiance en la plateforme Eventy360 et nous nous réjouissons de vous offrir une expérience académique exceptionnelle.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'payment_verified_notification';

-- Template: payment_rejected_notification
-- Update to remove Support Email completely
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إعلامكم بأننا قمنا بمراجعة دفعتكم المقدمة، ونأسف لإبلاغكم بأن عملية التحقق لم تكتمل بنجاح للأسباب التالية:</p><p>{{rejection_reason}}</p><p>تفاصيل الدفع المرفوض:<br>- رقم المرجع: {{reference_number}}<br>- المبلغ: {{amount}} د.ج<br>- تاريخ التقديم: {{reported_date}}</p><p>يمكنكم إعادة تقديم طلب الدفع مع مراعاة الأسباب المذكورة أعلاه. للمساعدة، يرجى التواصل مع فريق الدعم.</p><p>نشكركم على تفهمكم وتعاونكم.</p><p>مع خالص التقدير،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We wish to inform you that we have reviewed your submitted payment, and regret to inform you that the verification process could not be completed successfully for the following reasons:</p><p>{{rejection_reason}}</p><p>Rejected Payment Details:<br>- Reference Number: {{reference_number}}<br>- Amount: {{amount}} DZD<br>- Submission Date: {{reported_date}}</p><p>You may resubmit a payment request, considering the reasons mentioned above. For assistance, please contact our support team.</p><p>Thank you for your understanding and cooperation.</p><p>With sincere regards,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que nous avons examiné votre paiement soumis, et regrettons de vous informer que le processus de vérification n''a pas pu être complété avec succès pour les raisons suivantes :</p><p>{{rejection_reason}}</p><p>Détails du paiement rejeté :<br>- Numéro de référence : {{reference_number}}<br>- Montant : {{amount}} DZD<br>- Date de soumission : {{reported_date}}</p><p>Vous pouvez soumettre à nouveau une demande de paiement, en tenant compte des raisons mentionnées ci-dessus. Pour obtenir de l''aide, veuillez contacter notre équipe de support.</p><p>Nous vous remercions de votre compréhension et de votre coopération.</p><p>Cordialement,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'payment_rejected_notification';

-- Template: verification_request_submitted
-- Update to convert bracket-style placeholders to mustache-style
UPDATE public.email_templates
SET body_html_translations = jsonb_build_object(
    'ar', '<p>السيد(ة) المحترم(ة)،</p><p>نود إشعاركم بأننا استلمنا طلب التوثيق الخاص بكم على منصة Eventy360 بنجاح. سيقوم فريقنا بمراجعة طلبكم في أقرب وقت ممكن.</p><p>تفاصيل الطلب:<br>- تاريخ التقديم: {{submission_date}}</p><p>سيتم إشعاركم عبر البريد الإلكتروني بمجرد الانتهاء من مراجعة طلبكم.</p><p>يمكنكم متابعة حالة الطلب من خلال صفحة ملفكم الشخصي.</p><p>مع خالص التقدير والاحترام،<br>فريق Eventy360</p>',
    'en', '<p>Dear Esteemed Member,</p><p>We would like to inform you that we have successfully received your verification request on the Eventy360 platform. Our team will review your request as soon as possible.</p><p>Request Details:<br>- Submission Date: {{submission_date}}</p><p>You will be notified by email once your request has been reviewed.</p><p>You can check the status of your request through your profile page.</p><p>With sincere appreciation,<br>The Eventy360 Team</p>',
    'fr', '<p>Cher(e) Membre Estimé(e),</p><p>Nous souhaitons vous informer que nous avons bien reçu votre demande de vérification sur la plateforme Eventy360. Notre équipe examinera votre demande dans les plus brefs délais.</p><p>Détails de la demande:<br>- Date de soumission: {{submission_date}}</p><p>Vous serez notifié(e) par email dès que votre demande aura été examinée.</p><p>Vous pouvez vérifier l''état de votre demande sur votre page de profil.</p><p>Avec notre sincère considération,<br>L''Équipe Eventy360</p>'
)
WHERE template_key = 'verification_request_submitted';

-- IMPORTANT NOTE ABOUT CONDITIONAL MUSTACHE PLACEHOLDERS
-- Some academic event email templates use conditional Mustache syntax like {{#feedback}}...{{/feedback}}
-- The Edge Function doesn't currently implement conditional Mustache templating logic.
-- These templates will need to be handled at the SQL function level where feedback text is conditionally
-- included in the payload before sending to the email system.
-- For a proper solution, implement one of these approaches:
-- 1. Update SQL functions to pre-process conditionals before sending to notification_queue
-- 2. Add a proper Mustache templating engine to the send-email Edge Function (complex solution)
-- 3. Simplify affected templates by removing conditional tags and letting SQL functions handle conditionals

-- Update the notifications system to update notification_queue to remove URL/email placeholders completely
-- This function will be modified to remove placeholders entirely, not just rename them

-- Create or replace function to update notification queue placeholders
CREATE OR REPLACE FUNCTION update_notification_queue_placeholders()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove URL/email fields based on template_key
  CASE NEW.template_key
    WHEN 'user_verified_badge_awarded' THEN
      -- Remove profile_page_link
      IF NEW.payload_data ? 'profile_page_link' THEN
        NEW.payload_data = NEW.payload_data - 'profile_page_link';
      END IF;
      
    WHEN 'user_verified_badge_removed' THEN
      -- Remove Profile Page Link and Support Email
      IF NEW.payload_data ? 'Profile Page Link' THEN
        NEW.payload_data = NEW.payload_data - 'Profile Page Link';
      END IF;
      
      IF NEW.payload_data ? 'Support Email' THEN
        NEW.payload_data = NEW.payload_data - 'Support Email';
      END IF;
      
    WHEN 'payment_received_pending_verification' THEN
      -- Remove Finance Department Email
      IF NEW.payload_data ? 'Finance Department Email' THEN
        NEW.payload_data = NEW.payload_data - 'Finance Department Email';
      END IF;
      
    WHEN 'subscription_activated' THEN
      -- Remove Subscription Management Page Link
      IF NEW.payload_data ? 'Subscription Management Page Link' THEN
        NEW.payload_data = NEW.payload_data - 'Subscription Management Page Link';
      END IF;
      
    WHEN 'trial_ending_soon' THEN
      -- Remove Upgrade/Payment Page Link and Support Email
      IF NEW.payload_data ? 'Upgrade/Payment Page Link' THEN
        NEW.payload_data = NEW.payload_data - 'Upgrade/Payment Page Link';
      END IF;
      
      IF NEW.payload_data ? 'Support Email' THEN
        NEW.payload_data = NEW.payload_data - 'Support Email';
      END IF;
      
    WHEN 'trial_expired' THEN
      -- Remove Upgrade/Payment Page Link and Support Email
      IF NEW.payload_data ? 'Upgrade/Payment Page Link' THEN
        NEW.payload_data = NEW.payload_data - 'Upgrade/Payment Page Link';
      END IF;
      
      IF NEW.payload_data ? 'Support Email' THEN
        NEW.payload_data = NEW.payload_data - 'Support Email';
      END IF;
      
    WHEN 'admin_invitation' THEN
      -- Remove signin_link and platform_management_email
      IF NEW.payload_data ? 'signin_link' THEN
        NEW.payload_data = NEW.payload_data - 'signin_link';
      END IF;
      
      IF NEW.payload_data ? 'platform_management_email' THEN
        NEW.payload_data = NEW.payload_data - 'platform_management_email';
      END IF;
      
    WHEN 'payment_rejected_notification' THEN
      -- Remove support_email
      IF NEW.payload_data ? 'support_email' THEN
        NEW.payload_data = NEW.payload_data - 'support_email';
      END IF;
      
    ELSE
      -- No specific updates for other templates
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to apply placeholder updates on notification queue inserts
DROP TRIGGER IF EXISTS update_notification_queue_placeholders_trigger ON notification_queue;

CREATE TRIGGER update_notification_queue_placeholders_trigger
BEFORE INSERT ON notification_queue
FOR EACH ROW
EXECUTE FUNCTION update_notification_queue_placeholders();

-- Add comment to document this migration
COMMENT ON MIGRATION IS 'Update email templates to completely remove HTML anchor tags and URL/email placeholders'; 