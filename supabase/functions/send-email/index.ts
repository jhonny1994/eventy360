/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Edge Function for sending emails via Resend API
 * 
 * The @ts-nocheck directive is necessary for Supabase Edge Functions deployment
 * as they run in Deno's runtime where relative imports for types can be problematic.
 * The code uses type assertions to maintain type safety where possible.
 */
// @ts-nocheck
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // For production, restrict to specific domains
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// --- BEGIN INLINED TYPES ---
interface SendEmailPayload {
  notification_id?: number; // Used when sending from notification queue
  to?: string;             // Used when sending directly
  subject?: string;        // Used when sending directly
  html?: string;           // Used when sending directly
}

type QueueStatusEnum = "pending" | "processing" | "completed" | "failed";
// type EmailLogStatusEnum = "attempted" | "sent" | "failed" | "retry_attempted"; // Linter warning, remove if not used
type NotificationType = "immediate" | "scheduled"; // Removed "standard"

interface NotificationQueueItem {
  id: number;
  template_key: string | null;
  recipient_profile_id: string | null;
  payload_data: Record<string, unknown>; // JSON data
  status: QueueStatusEnum;
  attempts: number;
  last_attempt_at: string | null;
  last_error: string | null;
  process_after: string | null;
  created_at: string;
  updated_at: string;
  notification_type: NotificationType;
}

interface EmailTemplate {
  template_key: string;
  subject_translations: Record<string, string>;
  body_html_translations: Record<string, string>;
  description_translations: Record<string, string> | null;
  available_placeholders: string[] | null;
}

// ProfileData interface removed as it was unused after refactoring language preference logic

// --- END INLINED TYPES ---

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable.");
    }
    if (!RESEND_FROM_EMAIL) {
      throw new Error("Missing RESEND_FROM_EMAIL environment variable.");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: SendEmailPayload = await req.json();
    
    // Two modes of operation:
    // 1. Notification queue processing (notification_id provided)
    // 2. Direct email sending (to, subject, html provided)
    
    if (payload.notification_id) {
      // Process notification from queue
      return await processNotificationEmail(
        supabase, 
        payload.notification_id, 
        RESEND_API_KEY,
        RESEND_FROM_EMAIL
      );
    } else if (payload.to && payload.subject && payload.html) {
      // Direct email sending
      return await sendDirectEmail(
        payload.to,
        payload.subject,
        payload.html,
        RESEND_API_KEY,
        RESEND_FROM_EMAIL
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: "Invalid payload. Provide either notification_id OR (to, subject, html)." 
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

async function processNotificationEmail(supabase: SupabaseClient, notificationId: number, resendApiKey: string, fromEmail: string) {
  console.log(`Processing notification ID: ${notificationId}`);
  
  // 1. Get notification details
  const { data: notification, error: notificationError } = await supabase
    .from("notification_queue")
    .select("*")
    .eq("id", notificationId)
    .single();
  
  if (notificationError || !notification) {
    console.error("Error fetching notification:", notificationError);
    return new Response(
      JSON.stringify({ error: "Notification not found", details: notificationError }),
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Use the NotificationQueueItem interface with type assertion
  const typedNotification: NotificationQueueItem = notification as NotificationQueueItem;

  try {
    // 2. Get email template
    if (!typedNotification.template_key) {
      throw new Error("Notification missing template_key");
    }
    
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", typedNotification.template_key)
      .single();
    
    if (templateError || !template) {
      throw new Error(`Template not found: ${typedNotification.template_key}`);
    }
    
    // Use the EmailTemplate interface with type assertion
    const typedTemplate: EmailTemplate = template as EmailTemplate;
    
    // 3. Get recipient profile details
    let recipientEmail = null;
    let userPreferredLanguage = "ar"; // Default to Arabic

    if (typedNotification.recipient_profile_id) {
      const { data: userData, error: userError } = await supabase
        .auth
        .admin
        .getUserById(typedNotification.recipient_profile_id);
      
      if (userError) {
        console.warn("Warning fetching user for language preference:", userError.message);
      } else if (userData && userData.user) {
        recipientEmail = userData.user.email;
        
        const profileTypes = ['researcher_profiles', 'organizer_profiles'];
        for (const profileType of profileTypes) {
          const { data: profileData } = await supabase
            .from(profileType)
            .select("language") // Only select language
            .eq("profile_id", typedNotification.recipient_profile_id)
            .maybeSingle();
          
          if (profileData) {
            const typedProfileData = profileData as { language?: string };
            if (typedProfileData.language) {
              userPreferredLanguage = typedProfileData.language;
            }
            break; 
          }
        }
      }
    } else if (typedNotification.payload_data && typedNotification.payload_data.recipient_email) {
      recipientEmail = typedNotification.payload_data.recipient_email as string;
    }
    
    if (!recipientEmail) {
      throw new Error("Could not determine recipient email for notification ID: " + typedNotification.id);
    }
    
    // 4. Select appropriate language template
    // Arabic is the primary language. If it's missing, the email send should fail.
    if (!typedTemplate.subject_translations.ar || !typedTemplate.body_html_translations.ar) {
      throw new Error(`Required Arabic translation missing for template ${typedTemplate.template_key}`);
    }

    let subject = typedTemplate.subject_translations.ar;
    let htmlBody = typedTemplate.body_html_translations.ar;
    let langToUse = 'ar';

    // If user has a different preferred language AND that template exists, use it. Otherwise, stick to Arabic.
    if (userPreferredLanguage !== 'ar' &&
        typedTemplate.subject_translations[userPreferredLanguage] &&
        typedTemplate.body_html_translations[userPreferredLanguage]) {
      subject = typedTemplate.subject_translations[userPreferredLanguage];
      htmlBody = typedTemplate.body_html_translations[userPreferredLanguage];
      langToUse = userPreferredLanguage;
      console.log(`Using user preferred language '${langToUse}' for template ${typedTemplate.template_key}`);
    } else {
      console.log(`Using primary language 'ar' for template ${typedTemplate.template_key}`);
    }
    
    // 5. Process template with placeholders
    if (typedNotification.payload_data) {
      const placeholderPattern = /\\[([A-Za-z0-9_.-]+)\\]/g; // More specific placeholder pattern

      // Process subject
      let match;
      while ((match = placeholderPattern.exec(subject)) !== null) {
        const placeholderKey = match[1];
        const replacementValue = String(getNestedProperty(typedNotification.payload_data, placeholderKey) || `[${placeholderKey}]`);
        subject = subject.replace(new RegExp(`\\\\[${placeholderKey}\\\\]`, 'g'), replacementValue);
      }
      
      // Process body
      // Reset lastIndex for global regex
      placeholderPattern.lastIndex = 0; 
      let tempHtmlBody = "";
      let lastIndex = 0;

      while ((match = placeholderPattern.exec(htmlBody)) !== null) {
        tempHtmlBody += htmlBody.substring(lastIndex, match.index);
        const placeholderKey = match[1];
        const replacementValue = getNestedProperty(typedNotification.payload_data, placeholderKey);

        if (typeof replacementValue === 'string' && (replacementValue.startsWith('http://') || replacementValue.startsWith('https://'))) {
          // If the value is a URL, make it a clickable link
          // The placeholder in the template itself should just be [placeholderKey]
          // The HTML structure <a href="[placeholderKey]">Some text</a> should be in the template
          // This logic ensures the placeholder is replaced correctly within an href or as text.
          // For simple [placeholder_link] replacements that should become <a href="link_value">link_value</a>:
          // This part needs careful template design. The current approach replaces [key] with value.
          // If template is <a href="[signin_link]">Sign In</a>, it will correctly become <a href="ACTUAL_URL">Sign In</a>
          // If template is just [signin_link], it will become ACTUAL_URL (plain text).
          // To make a plain text URL clickable automatically if it's not already in an <a> tag is complex
          // and error-prone. It's better to enforce that links in templates are explicitly <a> tags.
          // The current replacement logic is fine if templates are designed correctly.
          tempHtmlBody += String(replacementValue);
        } else {
          tempHtmlBody += String(replacementValue !== undefined ? replacementValue : `[${placeholderKey}]`);
        }
        lastIndex = placeholderPattern.lastIndex;
      }
      tempHtmlBody += htmlBody.substring(lastIndex);
      htmlBody = tempHtmlBody;
    }
    
    // 6. Send the email via Resend
    console.log(`Sending email to: ${recipientEmail} with subject: ${subject}`);
    
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: subject,
        html: htmlBody,
      }),
    });
    
    const responseData = await resendResponse.json();
    
    // 7. Log the email attempt
    const emailLogData = {
      queue_id: typedNotification.id,
      recipient_email: recipientEmail,
      template_key: typedNotification.template_key,
      subject_sent: subject,
      payload: typedNotification.payload_data,
      attempted_at: new Date().toISOString(),
      status: resendResponse.ok ? "sent" : "failed",
      error_message: !resendResponse.ok ? JSON.stringify(responseData) : null,
      resend_message_id: resendResponse.ok && responseData.id ? responseData.id : null
    };
    
    await supabase
      .from("email_log")
      .insert(emailLogData);
    
    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log("Email sent successfully:", responseData);
    return new Response(JSON.stringify({
      success: true,
      messageId: responseData.id
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
    
  } catch (error: unknown) {
    console.error(`Error processing notification ${notificationId}:`, error);
    
    // Log the failure
    await supabase
      .from("email_log")
      .insert({
        queue_id: typedNotification.id,
        recipient_email: "unknown@example.com", // Will be updated if known
        template_key: typedNotification.template_key,
        subject_sent: "Failed to send",
        attempted_at: new Date().toISOString(),
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
      });
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

async function sendDirectEmail(to: string, subject: string, html: string, resendApiKey: string, fromEmail: string) {
  console.log(`Attempting to send direct email to: ${to}`);
  
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to], // Resend API expects 'to' to be an array of strings
      subject: subject,
      html: html,
    }),
  });
  
  const responseData = await resendResponse.json();
  
  if (!resendResponse.ok) {
    console.error("Resend API error:", responseData);
    return new Response(JSON.stringify(responseData), {
      status: resendResponse.status,
      headers: CORS_HEADERS,
    });
  }
  
  console.log("Email sent successfully via Resend:", responseData);
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Helper function to safely get nested property values
function getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
  if (!obj) return undefined;
  
  return path.split('.').reduce((previous: Record<string, unknown> | undefined, current: string) => {
    return previous && previous[current] !== undefined ? previous[current] : undefined;
  }, obj);
}
