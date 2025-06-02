-- Migration to add topic notification system
-- This migration adds support for notifying researchers when events are created in their subscribed topics

-- Insert template for new event in subscribed topic notification
INSERT INTO public.email_templates (
    template_key,
    available_placeholders,
    body_html_translations,
    description_translations,
    subject_translations
) VALUES (
    'new_event_in_subscribed_topic',
    ARRAY['event_name', 'event_id', 'event_date', 'wilaya_name', 'daira_name', 'topic_name', 'topic_id'],
    jsonb_build_object(
        'en', '<p>Dear Researcher,</p>
               <p>We are pleased to inform you that a new event has been published in a topic you are following:</p>
               <p><strong>Event Name:</strong> {{event_name.en}}</p>
               <p><strong>Date:</strong> {{event_date}}</p>
               <p><strong>Location:</strong> {{wilaya_name.other}}, {{daira_name.other}}</p>
               <p><strong>Topic:</strong> {{topic_name.en}}</p>
               <p>For more information and to submit your research, please visit the event page on Eventy360.</p>
               <p>Best regards,<br>Eventy360 Team</p>',
        'fr', '<p>Cher(e) Chercheur(euse),</p>
               <p>Nous avons le plaisir de vous informer qu''un nouvel événement a été publié dans un domaine que vous suivez :</p>
               <p><strong>Nom de l''événement :</strong> {{event_name.fr}}</p>
               <p><strong>Date :</strong> {{event_date}}</p>
               <p><strong>Lieu :</strong> {{wilaya_name.other}}, {{daira_name.other}}</p>
               <p><strong>Thématique :</strong> {{topic_name.fr}}</p>
               <p>Pour plus d''informations et pour soumettre votre recherche, veuillez visiter la page de l''événement sur Eventy360.</p>
               <p>Cordialement,<br>L''équipe Eventy360</p>',
        'ar', '<p>حضرة الباحث/ة المحترم/ة،</p>
               <p>يسرنا إعلامكم بنشر فعالية جديدة في مجال من مجالات اهتمامكم:</p>
               <p><strong>اسم الفعالية:</strong> {{event_name.ar}}</p>
               <p><strong>التاريخ:</strong> {{event_date}}</p>
               <p><strong>المكان:</strong> {{wilaya_name.ar}}، {{daira_name.ar}}</p>
               <p><strong>الموضوع:</strong> {{topic_name.ar}}</p>
               <p>للمزيد من المعلومات وتقديم بحثكم، يرجى زيارة صفحة الفعالية على منصة Eventy360.</p>
               <p>مع فائق الاحترام والتقدير،<br>فريق منصة Eventy360</p>'
    ),
    jsonb_build_object(
        'en', 'Notification sent to researchers when a new event is created in a topic they are subscribed to',
        'fr', 'Notification envoyée aux chercheurs lorsqu''un nouvel événement est créé dans un sujet auquel ils sont abonnés',
        'ar', 'إشعار يرسل إلى الباحثين عند إنشاء فعالية جديدة في موضوع مشتركين فيه'
    ),
    jsonb_build_object(
        'en', 'New Event in Your Topic of Interest: {{event_name.en}}',
        'fr', 'Nouvel Événement dans Votre Domaine d''Intérêt: {{event_name.fr}}',
        'ar', 'فعالية جديدة في مجال اهتمامك: {{event_name.ar}}'
    )
)
ON CONFLICT (template_key) DO UPDATE SET
    available_placeholders = EXCLUDED.available_placeholders,
    body_html_translations = EXCLUDED.body_html_translations,
    description_translations = EXCLUDED.description_translations,
    subject_translations = EXCLUDED.subject_translations;

-- Create function to notify researchers about new events in their subscribed topics
CREATE OR REPLACE FUNCTION public.notify_researchers_of_new_event_in_topic()
RETURNS TRIGGER AS $$
DECLARE
    topic_record RECORD;
    researcher_record RECORD;
    wilaya_record RECORD;
    daira_record RECORD;
    payload JSONB;
BEGIN
    -- Only proceed if the event is published
    IF NEW.status != 'published' THEN
        RETURN NEW;
    END IF;
    
    -- Get wilaya and daira names for the event (both Arabic and other languages)
    SELECT w.name_ar, w.name_other INTO wilaya_record
    FROM wilayas w
    WHERE w.id = NEW.wilaya_id;
    
    SELECT d.name_ar, d.name_other INTO daira_record
    FROM dairas d
    WHERE d.id = NEW.daira_id;
    
    -- For each topic associated with the event
    FOR topic_record IN 
        SELECT t.id, t.name_translations, et.topic_id
        FROM event_topics et
        JOIN topics t ON et.topic_id = t.id
        WHERE et.event_id = NEW.id
    LOOP
        -- For each researcher subscribed to this topic
        FOR researcher_record IN
            SELECT rts.profile_id
            FROM researcher_topic_subscriptions rts
            JOIN subscriptions s ON rts.profile_id = s.user_id
            WHERE rts.topic_id = topic_record.id
            AND s.status IN ('active', 'trial')
        LOOP
            -- Prepare notification payload with localized location names
            payload := jsonb_build_object(
                'event_name', NEW.event_name_translations,
                'event_id', NEW.id,
                'event_date', to_char(NEW.event_date::date, 'YYYY-MM-DD'),
                'wilaya_name', jsonb_build_object(
                    'ar', wilaya_record.name_ar,
                    'other', wilaya_record.name_other
                ),
                'daira_name', jsonb_build_object(
                    'ar', daira_record.name_ar,
                    'other', daira_record.name_other
                ),
                'topic_name', topic_record.name_translations,
                'topic_id', topic_record.id
            );
            
            -- Queue notification for the researcher
            INSERT INTO notification_queue (
                notification_type,
                recipient_profile_id,
                template_key,
                payload_data,
                status
            ) VALUES (
                'immediate',
                researcher_record.profile_id,
                'new_event_in_subscribed_topic',
                payload,
                'pending'
            );
        END LOOP;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to execute the function when a new event is created
CREATE TRIGGER trigger_notify_researchers_of_new_event
AFTER INSERT OR UPDATE OF status ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.notify_researchers_of_new_event_in_topic();

-- Update the notification categorization function to include the new template key
CREATE OR REPLACE FUNCTION public.handle_notification_insert()
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
    WHEN 'new_event_in_subscribed_topic' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
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