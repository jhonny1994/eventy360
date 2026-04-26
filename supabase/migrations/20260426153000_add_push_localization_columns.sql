BEGIN;

CREATE TABLE IF NOT EXISTS public.push_notification_templates (
  template_key text NOT NULL REFERENCES public.email_templates(template_key) ON DELETE CASCADE,
  locale text NOT NULL,
  title_template text NOT NULL,
  body_template text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT push_notification_templates_pkey PRIMARY KEY (template_key, locale),
  CONSTRAINT push_notification_templates_locale_format CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

COMMENT ON TABLE public.push_notification_templates IS
  'Localized push notification templates by template key + locale.';

COMMENT ON COLUMN public.push_notification_templates.title_template IS
  'Push notification title template using mustache placeholders.';

COMMENT ON COLUMN public.push_notification_templates.body_template IS
  'Push notification body template using mustache placeholders.';

CREATE INDEX IF NOT EXISTS idx_push_notification_templates_locale
  ON public.push_notification_templates(locale);

DO $$
DECLARE
  has_legacy_push_columns boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_templates'
      AND column_name = 'push_title_translations'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_templates'
      AND column_name = 'push_body_translations'
  )
  INTO has_legacy_push_columns;

  IF has_legacy_push_columns THEN
    INSERT INTO public.push_notification_templates (
      template_key,
      locale,
      title_template,
      body_template
    )
    SELECT
      src.template_key,
      lower(locale_keys.locale_key) AS locale,
      COALESCE(src.title_json ->> locale_keys.locale_key, 'Eventy360') AS title_template,
      COALESCE(src.body_json ->> locale_keys.locale_key, 'You have a new update.') AS body_template
    FROM (
      SELECT
        template_key,
        COALESCE(push_title_translations, subject_translations, '{}'::jsonb) AS title_json,
        COALESCE(push_body_translations, body_html_translations, '{}'::jsonb) AS body_json
      FROM public.email_templates
    ) src
    CROSS JOIN LATERAL (
      SELECT key AS locale_key
      FROM jsonb_object_keys(src.title_json || src.body_json) AS key
    ) locale_keys
    ON CONFLICT (template_key, locale) DO UPDATE
    SET
      title_template = EXCLUDED.title_template,
      body_template = EXCLUDED.body_template,
      updated_at = timezone('utc'::text, now());
  ELSE
    INSERT INTO public.push_notification_templates (
      template_key,
      locale,
      title_template,
      body_template
    )
    SELECT
      src.template_key,
      lower(locale_keys.locale_key) AS locale,
      COALESCE(src.title_json ->> locale_keys.locale_key, 'Eventy360') AS title_template,
      COALESCE(src.body_json ->> locale_keys.locale_key, 'You have a new update.') AS body_template
    FROM (
      SELECT
        template_key,
        COALESCE(subject_translations, '{}'::jsonb) AS title_json,
        COALESCE(body_html_translations, '{}'::jsonb) AS body_json
      FROM public.email_templates
    ) src
    CROSS JOIN LATERAL (
      SELECT key AS locale_key
      FROM jsonb_object_keys(src.title_json || src.body_json) AS key
    ) locale_keys
    ON CONFLICT (template_key, locale) DO UPDATE
    SET
      title_template = EXCLUDED.title_template,
      body_template = EXCLUDED.body_template,
      updated_at = timezone('utc'::text, now());
  END IF;
END $$;

ALTER TABLE public.email_templates
  DROP COLUMN IF EXISTS push_title_translations,
  DROP COLUMN IF EXISTS push_body_translations;

COMMIT;
