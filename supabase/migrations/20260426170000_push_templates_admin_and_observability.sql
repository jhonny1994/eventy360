BEGIN;

-- Ensure Arabic and English push templates exist for every email template.
INSERT INTO public.push_notification_templates (
  template_key,
  locale,
  title_template,
  body_template
)
SELECT
  et.template_key,
  locale_choice.locale,
  CASE locale_choice.locale
    WHEN 'ar' THEN COALESCE(et.subject_translations ->> 'ar', et.subject_translations ->> 'en', 'Eventy360')
    WHEN 'en' THEN COALESCE(et.subject_translations ->> 'en', et.subject_translations ->> 'ar', 'Eventy360')
  END AS title_template,
  CASE locale_choice.locale
    WHEN 'ar' THEN COALESCE(et.body_html_translations ->> 'ar', et.body_html_translations ->> 'en', 'You have a new update.')
    WHEN 'en' THEN COALESCE(et.body_html_translations ->> 'en', et.body_html_translations ->> 'ar', 'You have a new update.')
  END AS body_template
FROM public.email_templates et
CROSS JOIN (VALUES ('ar'::text), ('en'::text)) AS locale_choice(locale)
ON CONFLICT (template_key, locale) DO UPDATE
SET
  title_template = EXCLUDED.title_template,
  body_template = EXCLUDED.body_template,
  updated_at = timezone('utc'::text, now());

-- Curated concise push copy for push-eligible templates (AR/EN).
INSERT INTO public.push_notification_templates (
  template_key,
  locale,
  title_template,
  body_template
)
VALUES
  (
    'new_event_in_subscribed_topic',
    'ar',
    'فعالية جديدة ضمن اهتماماتك',
    'تم نشر "{{event_name.ar}}". اطلع على التفاصيل وسجّل الآن.'
  ),
  (
    'new_event_in_subscribed_topic',
    'en',
    'New Event in Your Interests',
    '"{{event_name.en}}" was just published. Open Eventy360 for details.'
  ),
  (
    'abstract_deadline_approaching',
    'ar',
    'تذكير: موعد الملخص يقترب',
    'يتبقى وقت قصير على نهاية التقديم في "{{event_name.ar}}".'
  ),
  (
    'abstract_deadline_approaching',
    'en',
    'Reminder: Abstract Deadline Soon',
    'Abstract submission closes soon for "{{event_name.en}}".'
  ),
  (
    'full_paper_deadline_approaching',
    'ar',
    'تذكير: موعد البحث الكامل يقترب',
    'الموعد النهائي لتقديم البحث الكامل في "{{event_name.ar}}" يقترب.'
  ),
  (
    'full_paper_deadline_approaching',
    'en',
    'Reminder: Full Paper Deadline Soon',
    'Full paper submission closes soon for "{{event_name.en}}".'
  )
ON CONFLICT (template_key, locale) DO UPDATE
SET
  title_template = EXCLUDED.title_template,
  body_template = EXCLUDED.body_template,
  updated_at = timezone('utc'::text, now());

CREATE OR REPLACE FUNCTION public.upsert_push_notification_template(
  p_template_key text,
  p_locale text,
  p_title_template text,
  p_body_template text
)
RETURNS public.push_notification_templates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_locale text;
  upserted public.push_notification_templates;
BEGIN
  normalized_locale := lower(trim(p_locale));

  IF normalized_locale !~ '^[a-z]{2}(-[a-z]{2})?$' THEN
    RAISE EXCEPTION 'Invalid locale format. Expected patterns: ar, en, en-us';
  END IF;

  IF normalized_locale LIKE '%-%' THEN
    normalized_locale :=
      split_part(normalized_locale, '-', 1) || '-' || upper(split_part(normalized_locale, '-', 2));
  END IF;

  INSERT INTO public.push_notification_templates (
    template_key,
    locale,
    title_template,
    body_template,
    updated_at
  )
  VALUES (
    p_template_key,
    normalized_locale,
    p_title_template,
    p_body_template,
    timezone('utc'::text, now())
  )
  ON CONFLICT (template_key, locale) DO UPDATE
  SET
    title_template = EXCLUDED.title_template,
    body_template = EXCLUDED.body_template,
    updated_at = timezone('utc'::text, now())
  RETURNING * INTO upserted;

  RETURN upserted;
END;
$$;

COMMENT ON FUNCTION public.upsert_push_notification_template(text, text, text, text) IS
  'Admin-safe helper to upsert one localized push template entry.';

REVOKE ALL ON FUNCTION public.upsert_push_notification_template(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_push_notification_template(text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.upsert_push_notification_template(text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_push_notification_template(text, text, text, text) TO service_role;

CREATE OR REPLACE VIEW public.push_delivery_template_metrics_7d AS
SELECT
  date_trunc('day', created_at) AS day,
  COALESCE(template_key, 'unknown') AS template_key,
  status,
  count(*)::bigint AS deliveries
FROM public.push_delivery_log
WHERE created_at >= now() - interval '7 days'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 2, 3;

COMMENT ON VIEW public.push_delivery_template_metrics_7d IS
  '7-day push delivery counts by template and status.';

CREATE OR REPLACE VIEW public.push_invalid_token_cleanup_metrics_30d AS
SELECT
  date_trunc('day', created_at) AS day,
  count(*) FILTER (WHERE status = 'dropped' AND fcm_error_code = 'UNREGISTERED')::bigint AS dropped_invalid_tokens,
  count(*) FILTER (WHERE status = 'failed')::bigint AS failed_deliveries,
  count(*) FILTER (WHERE status = 'sent')::bigint AS sent_deliveries
FROM public.push_delivery_log
WHERE created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW public.push_invalid_token_cleanup_metrics_30d IS
  '30-day trend for invalid-token drops and push outcomes.';

GRANT SELECT ON public.push_delivery_template_metrics_7d TO service_role;
GRANT SELECT ON public.push_invalid_token_cleanup_metrics_30d TO service_role;

COMMIT;
