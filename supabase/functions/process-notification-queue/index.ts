// eslint-disable @typescript-eslint/ban-ts-comment */
// ============================================================================
// PROCESS NOTIFICATION QUEUE - EDGE FUNCTION
// Cron Schedule: Every 15 minutes (*/15 * * * *)
// ============================================================================

// @ts-nocheck
// supabase/functions/process-notification-queue/index.ts

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// --- BEGIN INLINED TYPES ---
type QueueStatusEnum = "pending" | "processing" | "completed" | "failed";
type NotificationType = "immediate" | "scheduled";

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
// --- END INLINED TYPES ---

Deno.serve(async () => {
  try {
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Processing configuration
    const PROCESSING_BATCH_SIZE = 10;
    const MAX_RETRIES = 3;

    console.log("Starting notification queue processing job");

    // STEP 1: First prioritize immediate notifications
    const { data: immediateNotifications, error: immediateError } = await supabase
      .from("notification_queue")
      .select("*")
      .in("status", ["pending"])
      .eq("notification_type", "immediate")
      .is("last_error", null)
      .order("created_at", { ascending: true })
      .limit(PROCESSING_BATCH_SIZE);

    if (immediateError) {
      console.error("Error fetching immediate notifications:", immediateError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch immediate notifications", 
        details: immediateError 
      }), {
          status: 500,
          headers: CORS_HEADERS,
      });
    }

    // Process immediate notifications first
    if (immediateNotifications && immediateNotifications.length > 0) {
      console.log(`Processing ${immediateNotifications.length} immediate notifications`);
      await processNotificationBatch(supabase, immediateNotifications);
    }

    // STEP 2: Then process scheduled/standard notifications
    const { data: pendingNotifications, error: pendingError } = await supabase
        .from("notification_queue")
      .select("*")
        .eq("status", "pending")
      .not("notification_type", "eq", "immediate") // Skip immediate ones that were already processed
      .is("last_error", null)
      .or(`process_after.is.null,process_after.lte.${new Date().toISOString()}`)
      .order("created_at", { ascending: true })
      .limit(PROCESSING_BATCH_SIZE - (immediateNotifications?.length || 0)); // Adjust batch size

    if (pendingError) {
      console.error("Error fetching pending notifications:", pendingError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch pending notifications", 
        details: pendingError 
      }), {
          status: 500,
          headers: CORS_HEADERS,
      });
    }

    if (pendingNotifications && pendingNotifications.length > 0) {
      console.log(`Processing ${pendingNotifications.length} scheduled/standard notifications`);
      await processNotificationBatch(supabase, pendingNotifications);
    }

    // STEP 3: Check for retry-able failed notifications
    const { data: retryNotifications, error: retryError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "failed")
      .lt("attempts", MAX_RETRIES)
      .or(`last_attempt_at.is.null,last_attempt_at.lte.${new Date(Date.now() - 15 * 60000).toISOString()}`) // 15 min backoff
      .order("created_at", { ascending: true })
      .limit(PROCESSING_BATCH_SIZE - 
        (immediateNotifications?.length || 0) - 
        (pendingNotifications?.length || 0)); // Adjust batch size

    if (retryError) {
      console.error("Error fetching retry notifications:", retryError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch retry notifications", 
        details: retryError 
      }), {
        status: 500,
          headers: CORS_HEADERS,
      });
    }

    if (retryNotifications && retryNotifications.length > 0) {
      console.log(`Processing ${retryNotifications.length} retry notifications`);
      await processNotificationBatch(supabase, retryNotifications);
    }

    const totalProcessed = 
      (immediateNotifications?.length || 0) + 
      (pendingNotifications?.length || 0) + 
      (retryNotifications?.length || 0);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: totalProcessed,
      message: `Processed ${totalProcessed} notifications` 
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error processing notification queue:", err);
    return new Response(JSON.stringify({ 
      error: "Failed to process notification queue", 
      details: err.message 
    }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});

async function processNotificationBatch(supabase: SupabaseClient, notifications: NotificationQueueItem[]) {
  for (const notification of notifications) {
      try {
        // Mark as processing
      await supabase
          .from("notification_queue")
          .update({
            status: "processing",
            last_attempt_at: new Date().toISOString(),
          attempts: notification.attempts + 1,
          })
        .eq("id", notification.id);

      // Send the notification via email
      const sendResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ notification_id: notification.id }),
        }
      );

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        throw new Error(`Failed to send email: ${errorText}`);
        }

      // Mark as completed if successful
      await supabase
          .from("notification_queue")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", notification.id);

      console.log(`Successfully processed notification ${notification.id}`);
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);

      // For critical notifications, attempt an immediate retry once
      if (notification.attempts === 1 && // Only retry once immediately
          ['payment_received_pending_verification', 
           'payment_verified_notification',
           'payment_rejected_notification',
           'subscription_activated', 
           'admin_invitation'].includes(notification.template_key || '')) {
        
        console.log(`Immediate retry for critical notification ${notification.id} - ${notification.template_key}`);
        
        try {
          // Short delay before retry (3 seconds)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Retry sending
          const retryResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({ notification_id: notification.id }),
            }
          );
          
          if (retryResponse.ok) {
            // Update to completed if successful
            await supabase
              .from("notification_queue")
              .update({
                status: "completed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", notification.id);
              
            console.log(`Immediate retry succeeded for notification ${notification.id}`);
            continue; // Skip the failed status update
          }
        } catch (retryError) {
          console.error(`Immediate retry failed for notification ${notification.id}:`, retryError);
        }
      }

      // Update notification status to failed with error message
      await supabase
          .from("notification_queue")
        .update({
          status: "failed",
          last_error: error.message,
          updated_at: new Date().toISOString(),
          // Calculate exponential backoff for retries based on notification type
          process_after: notification.notification_type === 'immediate'
            ? new Date(Date.now() + Math.min(5 * 60000, Math.pow(2, notification.attempts) * 30000)).toISOString() // Fast retry for immediate
            : new Date(Date.now() + Math.min(60 * 60000, Math.pow(2, notification.attempts) * 60000)).toISOString() // Slower retry for others
        })
        .eq("id", notification.id);
    }
  }
}
