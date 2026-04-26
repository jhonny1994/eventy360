// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_SEND_ATTEMPTS = 3;
const MAX_CONCURRENCY = 8;

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiryEpochSeconds = 0;

type PushRequest = {
  notification_id?: number;
  profile_id?: string;
  topic_id?: string;
  token?: string;
  tokens?: string[];
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  android_priority?: "normal" | "high";
  ttl_seconds?: number;
  collapse_key?: string;
  analytics_label?: string;
  dry_run?: boolean;
};

type WebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  record?: Record<string, unknown>;
  schema?: string;
};

type DeviceTokenRow = {
  profile_id: string;
  token: string;
  topic_id: string | null;
  platform: string | null;
};

type NotificationQueueRow = {
  id: number;
  template_key: string | null;
  recipient_profile_id: string | null;
  payload_data: Record<string, unknown> | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return responseJson(405, { error: "Method Not Allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const fcmProjectId = Deno.env.get("FCM_PROJECT_ID");
  const fcmClientEmail = Deno.env.get("FCM_CLIENT_EMAIL");
  const fcmPrivateKeyRaw = Deno.env.get("FCM_PRIVATE_KEY");

  if (!supabaseUrl || !serviceRoleKey || !fcmProjectId || !fcmClientEmail || !fcmPrivateKeyRaw) {
    return responseJson(500, {
      error: "Missing required environment variables.",
      required: [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "FCM_PROJECT_ID",
        "FCM_CLIENT_EMAIL",
        "FCM_PRIVATE_KEY",
      ],
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !isServiceRoleAuthorization(authHeader, serviceRoleKey)) {
    return responseJson(403, { error: "Forbidden. Service role authorization is required." });
  }

  let payload: PushRequest | WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return responseJson(400, { error: "Invalid JSON payload." });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const requestInput = normalizeRequestPayload(payload);

  let notificationQueueRecord: NotificationQueueRow | null = null;
  if (requestInput.notification_id != null) {
    const { data, error } = await supabase
      .from("notification_queue")
      .select("id, template_key, recipient_profile_id, payload_data")
      .eq("id", requestInput.notification_id)
      .single();

    if (error || !data) {
      return responseJson(404, {
        error: "Notification queue record not found.",
        details: error?.message ?? null,
      });
    }

    notificationQueueRecord = data as NotificationQueueRow;
  }

  const resolvedProfileId =
    requestInput.profile_id ??
    notificationQueueRecord?.recipient_profile_id ??
    asString(notificationQueueRecord?.payload_data?.profile_id);
  const resolvedTopicId =
    requestInput.topic_id ??
    asString(notificationQueueRecord?.payload_data?.topic_id);

  const directTokens = normalizeTokenList(requestInput.token, requestInput.tokens);
  if (
    directTokens.length === 0 &&
    !resolvedProfileId &&
    !resolvedTopicId &&
    requestInput.notification_id == null
  ) {
    return responseJson(400, {
      error:
        "Missing target. Provide at least one of notification_id, profile_id, topic_id, token, or tokens.",
    });
  }
  const dbTokens = await resolveDeviceTokens(supabase, {
    profile_id: resolvedProfileId,
    topic_id: resolvedTopicId,
    includeIfNoFilters: false,
  });

  const tokenRowsByToken = new Map<string, DeviceTokenRow>();
  for (const row of dbTokens) {
    if (!row.token) continue;
    tokenRowsByToken.set(row.token, row);
  }
  for (const token of directTokens) {
    if (!tokenRowsByToken.has(token)) {
      tokenRowsByToken.set(token, {
        profile_id: resolvedProfileId ?? "",
        token,
        topic_id: resolvedTopicId ?? null,
        platform: "android",
      });
    }
  }

  const targetTokens = [...tokenRowsByToken.keys()];
  if (targetTokens.length === 0) {
    return responseJson(202, {
      success: true,
      message: "No target device tokens found for request.",
      notification_id: requestInput.notification_id ?? null,
    });
  }

  const messageTitle =
    requestInput.title ??
    asString(notificationQueueRecord?.payload_data?.push_title) ??
    asString(notificationQueueRecord?.payload_data?.title) ??
    "Eventy360";
  const messageBody =
    requestInput.body ??
    asString(notificationQueueRecord?.payload_data?.push_body) ??
    asString(notificationQueueRecord?.payload_data?.body) ??
    "You have a new update.";

  const mergedData = {
    ...(notificationQueueRecord?.payload_data ?? {}),
    ...(requestInput.data ?? {}),
  };
  if (requestInput.notification_id != null) {
    mergedData.notification_id = requestInput.notification_id;
  }

  const dataPayload = toStringRecord(mergedData);
  const androidPriority = requestInput.android_priority ?? "high";
  const ttlSeconds = normalizeTtlSeconds(requestInput.ttl_seconds);
  const collapseKey = requestInput.collapse_key ?? asString(mergedData.collapse_key);
  const analyticsLabel = requestInput.analytics_label ?? asString(mergedData.analytics_label);
  const dryRun = requestInput.dry_run === true;

  const serviceAccountPrivateKey = fcmPrivateKeyRaw.replace(/\\n/g, "\n");
  const accessToken = await getGoogleAccessToken({
    clientEmail: fcmClientEmail,
    privateKeyPem: serviceAccountPrivateKey,
  });

  const sendSummary = {
    total: targetTokens.length,
    sent: 0,
    failed: 0,
    dropped_invalid_token: 0,
    retried: 0,
  };

  await mapWithConcurrency(targetTokens, MAX_CONCURRENCY, async (token) => {
    const tokenRow = tokenRowsByToken.get(token) ?? null;
    let attempt = 0;
    let sent = false;

    while (!sent && attempt < MAX_SEND_ATTEMPTS) {
      attempt += 1;

      const sendResult = await sendFcmToToken({
        accessToken,
        projectId: fcmProjectId,
        token,
        title: messageTitle,
        body: messageBody,
        data: dataPayload,
        androidPriority,
        ttlSeconds,
        collapseKey,
        analyticsLabel,
        dryRun,
      });

      await writePushDeliveryLog(supabase, {
        notification_id: requestInput.notification_id ?? null,
        profile_id: tokenRow?.profile_id || null,
        topic_id: tokenRow?.topic_id || resolvedTopicId || null,
        token,
        template_key: notificationQueueRecord?.template_key ?? null,
        status: sendResult.statusForLog,
        attempt,
        http_status: sendResult.httpStatus,
        fcm_error_code: sendResult.fcmErrorCode,
        response_body: sendResult.responseBody,
      });

      if (sendResult.ok) {
        sent = true;
        sendSummary.sent += 1;
        break;
      }

      if (sendResult.isInvalidToken) {
        sendSummary.failed += 1;
        sendSummary.dropped_invalid_token += 1;
        await dropInvalidDeviceToken(supabase, token);
        break;
      }

      if (!sendResult.shouldRetry || attempt >= MAX_SEND_ATTEMPTS) {
        sendSummary.failed += 1;
        break;
      }

      sendSummary.retried += 1;
      const waitMs = computeRetryDelayMs(sendResult.retryAfterSeconds, attempt);
      await sleep(waitMs);
    }
  });

  return responseJson(200, {
    success: true,
    notification_id: requestInput.notification_id ?? null,
    profile_id: resolvedProfileId ?? null,
    topic_id: resolvedTopicId ?? null,
    ...sendSummary,
  });
});

function normalizeRequestPayload(payload: PushRequest | WebhookPayload): PushRequest {
  if (isWebhookPayload(payload)) {
    const record = payload.record ?? {};
    return {
      notification_id: asNumber(record.id),
    };
  }
  return payload as PushRequest;
}

function isWebhookPayload(payload: unknown): payload is WebhookPayload {
  if (!payload || typeof payload !== "object") return false;
  const maybe = payload as Record<string, unknown>;
  return "record" in maybe && "table" in maybe;
}

function isServiceRoleAuthorization(authHeader: string, serviceRoleKey: string): boolean {
  const [scheme, token] = authHeader.trim().split(/\s+/, 2);
  return scheme?.toLowerCase() === "bearer" && token === serviceRoleKey;
}

async function resolveDeviceTokens(
  supabase: ReturnType<typeof createClient>,
  input: {
    profile_id?: string | null;
    topic_id?: string | null;
    includeIfNoFilters: boolean;
  },
): Promise<DeviceTokenRow[]> {
  let query = supabase.from("device_tokens").select("profile_id, token, topic_id, platform");

  if (input.profile_id) {
    query = query.eq("profile_id", input.profile_id);
  }
  if (input.topic_id) {
    query = query.eq("topic_id", input.topic_id);
  }

  if (!input.profile_id && !input.topic_id && !input.includeIfNoFilters) {
    return [];
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Failed to resolve device tokens:", error?.message ?? "unknown");
    return [];
  }
  return (data as DeviceTokenRow[]).filter((row) => typeof row.token === "string" && row.token.length > 0);
}

async function dropInvalidDeviceToken(
  supabase: ReturnType<typeof createClient>,
  token: string,
): Promise<void> {
  const { error } = await supabase.from("device_tokens").delete().eq("token", token);
  if (error) {
    console.error(`Failed to drop invalid token: ${token}`, error.message);
  }
}

async function writePushDeliveryLog(
  supabase: ReturnType<typeof createClient>,
  row: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from("push_delivery_log").insert(row);
  if (error) {
    // Never fail sending because logging failed.
    console.warn("push_delivery_log insert failed:", error.message);
  }
}

async function sendFcmToToken(input: {
  accessToken: string;
  projectId: string;
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
  androidPriority: "normal" | "high";
  ttlSeconds: number | null;
  collapseKey: string | null;
  analyticsLabel: string | null;
  dryRun: boolean;
}): Promise<{
  ok: boolean;
  shouldRetry: boolean;
  isInvalidToken: boolean;
  retryAfterSeconds: number | null;
  httpStatus: number;
  fcmErrorCode: string | null;
  statusForLog: "sent" | "failed" | "retrying" | "dropped";
  responseBody: unknown;
}> {
  const requestBody = {
    validate_only: input.dryRun,
    message: {
      token: input.token,
      notification: {
        title: input.title,
        body: input.body,
      },
      data: input.data,
      android: {
        priority: input.androidPriority,
        ...(input.ttlSeconds != null ? { ttl: `${input.ttlSeconds}s` } : {}),
        ...(input.collapseKey ? { collapseKey: input.collapseKey } : {}),
      },
      ...(input.analyticsLabel ? { fcmOptions: { analyticsLabel: input.analyticsLabel } } : {}),
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${input.projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  let responseBody: unknown = null;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (response.ok) {
    return {
      ok: true,
      shouldRetry: false,
      isInvalidToken: false,
      retryAfterSeconds: null,
      httpStatus: response.status,
      fcmErrorCode: null,
      statusForLog: "sent",
      responseBody,
    };
  }

  const retryAfterSeconds = parseRetryAfterSeconds(response.headers.get("retry-after"));
  const fcmErrorCode = extractFcmErrorCode(responseBody);
  const isInvalidToken = fcmErrorCode === "UNREGISTERED";
  const shouldRetry = RETRYABLE_STATUS_CODES.has(response.status) && !isInvalidToken;
  const statusForLog = isInvalidToken
    ? "dropped"
    : shouldRetry
    ? "retrying"
    : "failed";

  return {
    ok: false,
    shouldRetry,
    isInvalidToken,
    retryAfterSeconds,
    httpStatus: response.status,
    fcmErrorCode,
    statusForLog,
    responseBody,
  };
}

function extractFcmErrorCode(responseBody: unknown): string | null {
  const details = (responseBody as any)?.error?.details;
  if (Array.isArray(details)) {
    for (const detail of details) {
      if (typeof detail?.errorCode === "string") {
        return detail.errorCode;
      }
    }
  }
  const status = (responseBody as any)?.error?.status;
  if (typeof status === "string") {
    return status;
  }
  return null;
}

async function getGoogleAccessToken(input: {
  clientEmail: string;
  privateKeyPem: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessTokenExpiryEpochSeconds - now > 60) {
    return cachedAccessToken;
  }

  const assertion = await createServiceAccountJwt(input.clientEmail, input.privateKeyPem);
  const tokenResponse = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const tokenJson = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenJson?.access_token) {
    throw new Error(
      `Failed to obtain Google OAuth token (${tokenResponse.status}): ${
        JSON.stringify(tokenJson)
      }`,
    );
  }

  cachedAccessToken = tokenJson.access_token as string;
  cachedAccessTokenExpiryEpochSeconds = now + Number(tokenJson.expires_in ?? 3600);
  return cachedAccessToken;
}

async function createServiceAccountJwt(clientEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: FCM_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = await signWithRsaSha256(signingInput, privateKeyPem);
  return `${signingInput}.${signature}`;
}

async function signWithRsaSha256(input: string, privateKeyPem: string): Promise<string> {
  const privateKeyBytes = pemToBytes(privateKeyPem);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const data = new TextEncoder().encode(input);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data);
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function pemToBytes(pem: string): Uint8Array {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(text: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(text));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeTokenList(token?: string, tokens?: string[]): string[] {
  const out: string[] = [];
  if (typeof token === "string" && token.trim().length > 0) {
    out.push(token.trim());
  }
  if (Array.isArray(tokens)) {
    for (const t of tokens) {
      if (typeof t === "string" && t.trim().length > 0) {
        out.push(t.trim());
      }
    }
  }
  return [...new Set(out)];
}

function toStringRecord(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (typeof value === "string") {
      out[key] = value;
    } else {
      out[key] = JSON.stringify(value);
    }
  }
  return out;
}

function normalizeTtlSeconds(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded < 0) return null;
  // Clamp to Firebase max storage period (4 weeks).
  return Math.min(rounded, 2419200);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function parseRetryAfterSeconds(value: string | null): number | null {
  if (!value) return null;
  const asNumberValue = Number(value);
  if (Number.isFinite(asNumberValue) && asNumberValue >= 0) {
    return asNumberValue;
  }
  const retryDate = Date.parse(value);
  if (!Number.isFinite(retryDate)) return null;
  const diffMs = retryDate - Date.now();
  return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
}

function computeRetryDelayMs(retryAfterSeconds: number | null, attempt: number): number {
  if (retryAfterSeconds != null) {
    return retryAfterSeconds * 1000;
  }
  const exponential = 500 * (2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * 250);
  return exponential + jitter;
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) {
        return;
      }
      await worker(items[current]);
    }
  });
  await Promise.all(workers);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function responseJson(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}
