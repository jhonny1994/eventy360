-- Admin runbook: upsert localized push templates via RPC.
-- Requires service-role context (Supabase SQL Editor with elevated role or backend service role).

-- Example: update Arabic copy.
SELECT public.upsert_push_notification_template(
  p_template_key := 'new_event_in_subscribed_topic',
  p_locale := 'ar',
  p_title_template := 'فعالية جديدة ضمن اهتماماتك',
  p_body_template := 'تم نشر "{{event_name.ar}}". اطلع على التفاصيل وسجّل الآن.'
);

-- Example: update English copy.
SELECT public.upsert_push_notification_template(
  p_template_key := 'new_event_in_subscribed_topic',
  p_locale := 'en',
  p_title_template := 'New Event in Your Interests',
  p_body_template := '"{{event_name.en}}" was just published. Open Eventy360 for details.'
);

-- Verify current entries.
SELECT
  template_key,
  locale,
  title_template,
  body_template,
  updated_at
FROM public.push_notification_templates
WHERE template_key = 'new_event_in_subscribed_topic'
ORDER BY locale;
