-- Push observability checks

-- 1) Delivery health in the last 7 days.
SELECT *
FROM public.push_delivery_template_metrics_7d
ORDER BY day DESC, template_key, status;

-- 2) Invalid token cleanup trend in the last 30 days.
SELECT *
FROM public.push_invalid_token_cleanup_metrics_30d
ORDER BY day DESC;

-- 3) Current device token inventory.
SELECT
  platform,
  count(*)::bigint AS tokens
FROM public.device_tokens
GROUP BY platform
ORDER BY tokens DESC;

-- 4) Invalid token drops by day (raw log check).
SELECT
  date_trunc('day', created_at) AS day,
  count(*)::bigint AS dropped_invalid_tokens
FROM public.push_delivery_log
WHERE status = 'dropped'
  AND fcm_error_code = 'UNREGISTERED'
  AND created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;
