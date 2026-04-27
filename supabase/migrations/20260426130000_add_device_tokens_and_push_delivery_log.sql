-- Device token storage + push delivery observability
-- Supports production FCM sender from Supabase Edge Functions.

BEGIN;

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  topic_id uuid NULL REFERENCES public.topics(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT 'android',
  app_version text NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_tokens
  ADD COLUMN IF NOT EXISTS app_version text NULL,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS ux_device_tokens_profile_token_topic
  ON public.device_tokens (profile_id, token, topic_id);

CREATE INDEX IF NOT EXISTS idx_device_tokens_profile_id
  ON public.device_tokens (profile_id);

CREATE INDEX IF NOT EXISTS idx_device_tokens_topic_id
  ON public.device_tokens (topic_id);

CREATE INDEX IF NOT EXISTS idx_device_tokens_token
  ON public.device_tokens (token);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "device_tokens_select_own" ON public.device_tokens;
CREATE POLICY "device_tokens_select_own"
  ON public.device_tokens
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "device_tokens_insert_own" ON public.device_tokens;
CREATE POLICY "device_tokens_insert_own"
  ON public.device_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "device_tokens_update_own" ON public.device_tokens;
CREATE POLICY "device_tokens_update_own"
  ON public.device_tokens
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "device_tokens_delete_own" ON public.device_tokens;
CREATE POLICY "device_tokens_delete_own"
  ON public.device_tokens
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS set_device_tokens_updated_at ON public.device_tokens;
CREATE TRIGGER set_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_tokens TO authenticated;
GRANT ALL ON public.device_tokens TO service_role;

CREATE TABLE IF NOT EXISTS public.push_delivery_log (
  id bigserial PRIMARY KEY,
  notification_id bigint NULL REFERENCES public.notification_queue(id) ON DELETE SET NULL,
  profile_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic_id uuid NULL REFERENCES public.topics(id) ON DELETE SET NULL,
  token text NOT NULL,
  template_key text NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'retrying', 'dropped')),
  attempt smallint NOT NULL DEFAULT 1,
  http_status integer NULL,
  fcm_error_code text NULL,
  response_body jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_delivery_log_created_at
  ON public.push_delivery_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_delivery_log_notification_id
  ON public.push_delivery_log (notification_id);

CREATE INDEX IF NOT EXISTS idx_push_delivery_log_profile_id
  ON public.push_delivery_log (profile_id);

CREATE INDEX IF NOT EXISTS idx_push_delivery_log_topic_id
  ON public.push_delivery_log (topic_id);

CREATE INDEX IF NOT EXISTS idx_push_delivery_log_status
  ON public.push_delivery_log (status);

ALTER TABLE public.push_delivery_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_delivery_log_admin_read" ON public.push_delivery_log;
CREATE POLICY "push_delivery_log_admin_read"
  ON public.push_delivery_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
    )
  );

GRANT SELECT ON public.push_delivery_log TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.push_delivery_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.push_delivery_log_id_seq TO service_role;

COMMIT;
