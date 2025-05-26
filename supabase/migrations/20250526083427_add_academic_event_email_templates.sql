-- Add email templates for academic events feature

-- Insert template for abstract submission deadline approaching
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'abstract_deadline_approaching',
    jsonb_build_object(
        'en', 'Abstract submission deadline approaching for {{event_name.en}}',
        'fr', 'Date limite de soumission des résumés approchant pour {{event_name.fr}}',
        'ar', 'اقتراب الموعد النهائي لتقديم الملخص العلمي لمؤتمر {{event_name.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>This is a reminder that the abstract submission deadline for <strong>{{event_name.en}}</strong> is approaching. The deadline is <strong>{{deadline}}</strong>.</p>
               <p>To submit your abstract, please visit the event page and click on the "Submit Abstract" button.</p>
               <p>Thank you for your interest in this event.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous vous rappelons que la date limite de soumission des résumés pour <strong>{{event_name.fr}}</strong> approche. La date limite est fixée au <strong>{{deadline}}</strong>.</p>
               <p>Pour soumettre votre résumé, veuillez vous rendre sur la page de l\'événement et cliquer sur le bouton "Soumettre un résumé".</p>
               <p>Nous vous remercions de l\'intérêt que vous portez à cet événement.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>نود تذكيركم بأن الموعد النهائي لتقديم الملخص العلمي لمؤتمر <strong>{{event_name.ar}}</strong> يقترب. الموعد النهائي هو <strong>{{deadline}}</strong>.</p>
               <p>لتقديم ملخصكم العلمي، يرجى زيارة صفحة المؤتمر والنقر على زر "تقديم ملخص".</p>
               <p>نشكركم على اهتمامكم بهذا المؤتمر العلمي.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Sent to researchers to remind them of approaching abstract submission deadlines',
        'fr', 'Envoyé aux chercheurs pour leur rappeler les dates limites de soumission des résumés à venir',
        'ar', 'يتم إرسالها إلى الباحثين لتذكيرهم بالمواعيد النهائية القادمة لتقديم الملخصات العلمية'
    ),
    ARRAY['event_name', 'event_id', 'deadline']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for full paper submission deadline approaching
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'full_paper_deadline_approaching',
    jsonb_build_object(
        'en', 'Full paper submission deadline approaching for {{event_name.en}}',
        'fr', 'Date limite de soumission des articles complets approchant pour {{event_name.fr}}',
        'ar', 'اقتراب الموعد النهائي لتقديم البحث الكامل لمؤتمر {{event_name.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>This is a reminder that the full paper submission deadline for <strong>{{event_name.en}}</strong> is approaching. The deadline is <strong>{{deadline}}</strong>.</p>
               <p>Your abstract has been accepted, and you are now invited to submit your full paper. Please visit the event page and click on the "Submit Full Paper" button.</p>
               <p>Thank you for your contribution to this event.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous vous rappelons que la date limite de soumission des articles complets pour <strong>{{event_name.fr}}</strong> approche. La date limite est fixée au <strong>{{deadline}}</strong>.</p>
               <p>Votre résumé a été accepté, et vous êtes maintenant invité(e) à soumettre votre article complet. Veuillez vous rendre sur la page de l\'événement et cliquer sur le bouton "Soumettre un article complet".</p>
               <p>Nous vous remercions de votre contribution à cet événement.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>نود تذكيركم بأن الموعد النهائي لتقديم البحث الكامل لمؤتمر <strong>{{event_name.ar}}</strong> يقترب. الموعد النهائي هو <strong>{{deadline}}</strong>.</p>
               <p>لقد تم قبول ملخصكم العلمي، ويسرنا دعوتكم لتقديم البحث الكامل. يرجى زيارة صفحة المؤتمر والنقر على زر "تقديم البحث الكامل".</p>
               <p>نشكركم على مساهمتكم القيمة في هذا المؤتمر العلمي.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Sent to researchers with accepted abstracts to remind them of approaching full paper submission deadlines',
        'fr', 'Envoyé aux chercheurs dont les résumés ont été acceptés pour leur rappeler les dates limites de soumission des articles complets à venir',
        'ar', 'يتم إرسالها إلى الباحثين الذين تم قبول ملخصاتهم العلمية لتذكيرهم بالمواعيد النهائية القادمة لتقديم الأبحاث الكاملة'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'deadline']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for abstract received confirmation
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'abstract_received_confirmation',
    jsonb_build_object(
        'en', 'Abstract Received: {{submission_title.en}}',
        'fr', 'Résumé reçu: {{submission_title.fr}}',
        'ar', 'تم استلام الملخص العلمي: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>We are pleased to confirm that we have received your abstract submission titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong>.</p>
               <p>Your abstract is now under review. We will notify you of the review outcome as soon as possible.</p>
               <p>Thank you for your submission.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous avons le plaisir de vous confirmer que nous avons bien reçu votre résumé intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong>.</p>
               <p>Votre résumé est maintenant en cours d\'évaluation. Nous vous informerons du résultat de l\'évaluation dès que possible.</p>
               <p>Nous vous remercions pour votre soumission.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>يسرنا أن نؤكد استلامنا للملخص العلمي الذي قدمتموه بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong>.</p>
               <p>ملخصكم العلمي قيد التقييم حالياً. سنقوم بإخطاركم بنتيجة التقييم في أقرب وقت ممكن.</p>
               <p>نشكركم على مشاركتكم العلمية القيمة.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Confirmation sent to researchers when their abstract submission is received',
        'fr', 'Confirmation envoyée aux chercheurs lorsque leur résumé est reçu',
        'ar', 'تأكيد يرسل إلى الباحثين عند استلام ملخصاتهم العلمية'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for abstract accepted notification
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'abstract_accepted_notification',
    jsonb_build_object(
        'en', 'Abstract Accepted: {{submission_title.en}}',
        'fr', 'Résumé accepté: {{submission_title.fr}}',
        'ar', 'تم قبول الملخص العلمي: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>We are pleased to inform you that your abstract titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong> has been accepted.</p>
               <p>You are now invited to submit your full paper. Please visit the event page for more information on the full paper submission process and deadline.</p>
               <p>Congratulations, and thank you for your valuable contribution.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous avons le plaisir de vous informer que votre résumé intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong> a été accepté.</p>
               <p>Vous êtes maintenant invité(e) à soumettre votre article complet. Veuillez consulter la page de l\'événement pour plus d\'informations sur le processus de soumission et la date limite.</p>
               <p>Félicitations, et merci pour votre précieuse contribution.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>يسرنا إبلاغكم بأن ملخصكم العلمي بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong> قد تم قبوله.</p>
               <p>ندعوكم الآن لتقديم بحثكم الكامل. يرجى زيارة صفحة المؤتمر للحصول على مزيد من المعلومات حول عملية تقديم البحث الكامل والموعد النهائي.</p>
               <p>تهانينا، ونشكركم على مساهمتكم العلمية القيمة.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when their abstract has been accepted',
        'fr', 'Notification envoyée aux chercheurs lorsque leur résumé a été accepté',
        'ar', 'إشعار يرسل إلى الباحثين عند قبول ملخصاتهم العلمية'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'feedback']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for abstract rejected notification
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'abstract_rejected_notification',
    jsonb_build_object(
        'en', 'Abstract Review Result: {{submission_title.en}}',
        'fr', 'Résultat de l\''évaluation du résumé: {{submission_title.fr}}',
        'ar', 'نتيجة تقييم الملخص العلمي: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>Thank you for submitting your abstract titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong>.</p>
               <p>After careful review, we regret to inform you that your abstract has not been accepted for this event.</p>
               <p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
               <p>We appreciate your interest in our event and encourage you to consider submitting to future events.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous vous remercions d\'avoir soumis votre résumé intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong>.</p>
               <p>Après un examen attentif, nous regrettons de vous informer que votre résumé n\'a pas été retenu pour cet événement.</p>
               <p>{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}</p>
               <p>Nous apprécions votre intérêt pour notre événement et vous encourageons à soumettre vos travaux lors de futurs événements.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>نشكركم على تقديم ملخصكم العلمي بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong>.</p>
               <p>بعد التقييم العلمي الدقيق، نأسف لإبلاغكم بأن ملخصكم العلمي لم يتم قبوله لهذا المؤتمر.</p>
               <p>{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}</p>
               <p>نقدر اهتمامكم بمؤتمرنا العلمي ونشجعكم على المشاركة في المؤتمرات العلمية المستقبلية.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when their abstract has been rejected',
        'fr', 'Notification envoyée aux chercheurs lorsque leur résumé a été refusé',
        'ar', 'إشعار يرسل إلى الباحثين عند رفض ملخصاتهم العلمية'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'feedback']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for full paper received confirmation
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'full_paper_received_confirmation',
    jsonb_build_object(
        'en', 'Full Paper Received: {{submission_title.en}}',
        'fr', 'Article complet reçu: {{submission_title.fr}}',
        'ar', 'تم استلام البحث الكامل: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>We are pleased to confirm that we have received your full paper submission titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong>.</p>
               <p>Your paper is now under review. We will notify you of the review outcome as soon as possible.</p>
               <p>Thank you for your contribution.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous avons le plaisir de vous confirmer que nous avons bien reçu votre article complet intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong>.</p>
               <p>Votre article est maintenant en cours d\'évaluation. Nous vous informerons du résultat de l\'évaluation dès que possible.</p>
               <p>Nous vous remercions pour votre contribution.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>يسرنا أن نؤكد استلامنا للبحث الكامل الذي قدمتموه بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong>.</p>
               <p>بحثكم العلمي قيد التقييم حالياً. سنقوم بإخطاركم بنتيجة التقييم في أقرب وقت ممكن.</p>
               <p>نشكركم على مساهمتكم العلمية القيمة.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Confirmation sent to researchers when their full paper submission is received',
        'fr', 'Confirmation envoyée aux chercheurs lorsque leur article complet est reçu',
        'ar', 'تأكيد يرسل إلى الباحثين عند استلام أبحاثهم الكاملة'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for full paper accepted notification
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'full_paper_accepted_notification',
    jsonb_build_object(
        'en', 'Full Paper Accepted: {{submission_title.en}}',
        'fr', 'Article complet accepté: {{submission_title.fr}}',
        'ar', 'تم قبول البحث الكامل: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>We are pleased to inform you that your full paper titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong> has been accepted.</p>
               <p>Congratulations on this achievement! Your paper will be included in the event proceedings.</p>
               <p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
               <p>Thank you for your valuable contribution to our event.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous avons le plaisir de vous informer que votre article complet intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong> a été accepté.</p>
               <p>Félicitations pour cette réussite! Votre article sera inclus dans les actes de l\'événement.</p>
               <p>{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}</p>
               <p>Nous vous remercions pour votre précieuse contribution à notre événement.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>يسرنا إبلاغكم بأن بحثكم الكامل بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong> قد تم قبوله.</p>
               <p>تهانينا على هذا الإنجاز العلمي! سيتم إدراج بحثكم ضمن وقائع المؤتمر.</p>
               <p>{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}</p>
               <p>نشكركم على مساهمتكم العلمية القيمة في مؤتمرنا.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when their full paper has been accepted',
        'fr', 'Notification envoyée aux chercheurs lorsque leur article complet a été accepté',
        'ar', 'إشعار يرسل إلى الباحثين عند قبول أبحاثهم الكاملة'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'feedback']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for full paper rejected notification
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'full_paper_rejected_notification',
    jsonb_build_object(
        'en', 'Full Paper Review Result: {{submission_title.en}}',
        'fr', 'Résultat de l\''évaluation de l\''article complet: {{submission_title.fr}}',
        'ar', 'نتيجة تقييم البحث الكامل: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>Thank you for submitting your full paper titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong>.</p>
               <p>After careful review, we regret to inform you that your full paper has not been accepted for this event.</p>
               <p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>
               <p>We appreciate your interest in our event and encourage you to consider submitting to future events.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous vous remercions d\'avoir soumis votre article complet intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong>.</p>
               <p>Après un examen attentif, nous regrettons de vous informer que votre article n\'a pas été retenu pour cet événement.</p>
               <p>{{#feedback}}<p><strong>Commentaires des évaluateurs:</strong></p><p>{{feedback.fr}}</p>{{/feedback}}</p>
               <p>Nous apprécions votre intérêt pour notre événement et vous encourageons à soumettre vos travaux lors de futurs événements.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>نشكركم على تقديم بحثكم الكامل بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong>.</p>
               <p>بعد التقييم العلمي الدقيق، نأسف لإبلاغكم بأن بحثكم الكامل لم يتم قبوله لهذا المؤتمر.</p>
               <p>{{#feedback}}<p><strong>ملاحظات المقيّمين:</strong></p><p>{{feedback.ar}}</p>{{/feedback}}</p>
               <p>نقدر اهتمامكم بمؤتمرنا العلمي ونشجعكم على المشاركة في المؤتمرات العلمية المستقبلية.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when their full paper has been rejected',
        'fr', 'Notification envoyée aux chercheurs lorsque leur article complet a été refusé',
        'ar', 'إشعار يرسل إلى الباحثين عند رفض أبحاثهم الكاملة'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'feedback']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for revision requested notification
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'revision_requested_notification',
    jsonb_build_object(
        'en', 'Revision Requested: {{submission_title.en}}',
        'fr', 'Révision demandée: {{submission_title.fr}}',
        'ar', 'طلب تعديلات على البحث: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>Thank you for submitting your paper titled <strong>"{{submission_title.en}}"</strong> for the event <strong>{{event_name.en}}</strong>.</p>
               <p>After reviewing your submission, we are requesting revisions to your paper before it can be accepted.</p>
               <p><strong>Reviewer Feedback:</strong></p>
               <p>{{feedback.en}}</p>
               <p>Please make the requested revisions and resubmit your paper through the event page as soon as possible.</p>
               <p>Thank you for your understanding and cooperation.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous vous remercions d\'avoir soumis votre article intitulé <strong>"{{submission_title.fr}}"</strong> pour l\'événement <strong>{{event_name.fr}}</strong>.</p>
               <p>Après évaluation de votre soumission, nous vous demandons d\'apporter des révisions à votre article avant qu\'il puisse être accepté.</p>
               <p><strong>Commentaires des évaluateurs:</strong></p>
               <p>{{feedback.fr}}</p>
               <p>Veuillez effectuer les révisions demandées et soumettre à nouveau votre article via la page de l\'événement dès que possible.</p>
               <p>Nous vous remercions pour votre compréhension et votre coopération.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>نشكركم على تقديم بحثكم بعنوان <strong>"{{submission_title.ar}}"</strong> للمؤتمر العلمي <strong>{{event_name.ar}}</strong>.</p>
               <p>بعد تقييم بحثكم، نطلب منكم إجراء بعض التعديلات على البحث قبل قبوله نهائياً.</p>
               <p><strong>ملاحظات المقيّمين:</strong></p>
               <p>{{feedback.ar}}</p>
               <p>يرجى إجراء التعديلات المطلوبة وإعادة تقديم البحث من خلال صفحة المؤتمر في أقرب وقت ممكن.</p>
               <p>نشكركم على تفهمكم وتعاونكم.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when revisions are requested for their paper',
        'fr', 'Notification envoyée aux chercheurs lorsque des révisions sont demandées pour leur article',
        'ar', 'إشعار يرسل إلى الباحثين عند طلب تعديلات على أبحاثهم'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'feedback']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for new abstract submission notification (to organizers)
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'new_abstract_submission',
    jsonb_build_object(
        'en', 'New Abstract Submission: {{submission_title.en}}',
        'fr', 'Nouvelle soumission de résumé: {{submission_title.fr}}',
        'ar', 'تقديم ملخص علمي جديد: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Organizer,</p>
               <p>A new abstract has been submitted for your event <strong>{{event_name.en}}</strong>.</p>
               <p><strong>Submission Title:</strong> {{submission_title.en}}</p>
               <p><strong>Researcher:</strong> {{researcher_name}}</p>
               <p>Please log in to your account to review this submission.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher Organisateur,</p>
               <p>Un nouveau résumé a été soumis pour votre événement <strong>{{event_name.fr}}</strong>.</p>
               <p><strong>Titre de la soumission:</strong> {{submission_title.fr}}</p>
               <p><strong>Chercheur:</strong> {{researcher_name}}</p>
               <p>Veuillez vous connecter à votre compte pour examiner cette soumission.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>عزيزي منظم المؤتمر،</p>
               <p>تم تقديم ملخص علمي جديد لمؤتمركم <strong>{{event_name.ar}}</strong>.</p>
               <p><strong>عنوان البحث:</strong> {{submission_title.ar}}</p>
               <p><strong>الباحث:</strong> {{researcher_name}}</p>
               <p>يرجى تسجيل الدخول إلى حسابكم لمراجعة هذا الملخص العلمي.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to event organizers when a new abstract is submitted',
        'fr', 'Notification envoyée aux organisateurs d\''événements lorsqu\''un nouveau résumé est soumis',
        'ar', 'إشعار يرسل إلى منظمي المؤتمرات العلمية عند تقديم ملخص علمي جديد'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'researcher_name']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders;

-- Insert template for new full paper submission notification (to organizers)
INSERT INTO public.email_templates (
    template_key, 
    subject_translations, 
    body_html_translations, 
    description_translations, 
    available_placeholders
) VALUES (
    'new_full_paper_submission',
    jsonb_build_object(
        'en', 'New Full Paper Submission: {{submission_title.en}}',
        'fr', 'Nouvelle soumission d\''article complet: {{submission_title.fr}}',
        'ar', 'تقديم بحث كامل جديد: {{submission_title.ar}}'
    ),
    jsonb_build_object(
        'en', '<p>Dear Organizer,</p>
               <p>A new full paper has been submitted for your event <strong>{{event_name.en}}</strong>.</p>
               <p><strong>Submission Title:</strong> {{submission_title.en}}</p>
               <p><strong>Researcher:</strong> {{researcher_name}}</p>
               <p>Please log in to your account to review this submission.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher Organisateur,</p>
               <p>Un nouvel article complet a été soumis pour votre événement <strong>{{event_name.fr}}</strong>.</p>
               <p><strong>Titre de la soumission:</strong> {{submission_title.fr}}</p>
               <p><strong>Chercheur:</strong> {{researcher_name}}</p>
               <p>Veuillez vous connecter à votre compte pour examiner cette soumission.</p>
               <p>Cordialement,<br>L\'équipe Eventy360</p>',
        'ar', '<p>عزيزي منظم المؤتمر،</p>
               <p>تم تقديم بحث كامل جديد لمؤتمركم <strong>{{event_name.ar}}</strong>.</p>
               <p><strong>عنوان البحث:</strong> {{submission_title.ar}}</p>
               <p><strong>الباحث:</strong> {{researcher_name}}</p>
               <p>يرجى تسجيل الدخول إلى حسابكم لمراجعة هذا البحث العلمي.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to event organizers when a new full paper is submitted',
        'fr', 'Notification envoyée aux organisateurs d\''événements lorsqu\''un nouvel article complet est soumis',
        'ar', 'إشعار يرسل إلى منظمي المؤتمرات العلمية عند تقديم بحث كامل جديد'
    ),
    ARRAY['event_name', 'event_id', 'submission_id', 'submission_title', 'researcher_name']
)
ON CONFLICT (template_key) DO UPDATE SET
    subject_translations = EXCLUDED.subject_translations,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    available_placeholders = EXCLUDED.available_placeholders; 