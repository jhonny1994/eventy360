// ============================================================================
// PURGE DELETED ITEMS - EDGE FUNCTION
// Cron Schedule: Daily (0 0 * * *)
// ============================================================================

// supabase/functions/purge-deleted-items/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async () => {
  try {
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting purge-deleted-items job");

    // Call the purge function in the database
    const { error: purgeError } = await supabase
      .rpc('purge_expired_deletions');

    if (purgeError) {
      console.error("Error executing purge_expired_deletions function:", purgeError);
      return new Response(JSON.stringify({ 
        error: "Failed to execute purge_expired_deletions", 
        details: purgeError
      }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    // Get statistics about how many items were purged
    const { data: eventStats, error: eventStatsError } = await supabase
      .from("events")
      .select("count(*)", { count: "exact" })
      .not("deleted_at", "is", null);

    if (eventStatsError) {
      console.error("Error getting event stats:", eventStatsError);
    }

    const { data: submissionStats, error: submissionStatsError } = await supabase
      .from("submissions")
      .select("count(*)", { count: "exact" })
      .not("deleted_at", "is", null);

    if (submissionStatsError) {
      console.error("Error getting submission stats:", submissionStatsError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Purged expired soft-deleted items",
      remaining_soft_deleted: {
        events: eventStats?.count || 0,
        submissions: submissionStats?.count || 0
      }
    }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error in purge-deleted-items job:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: "Failed to process purge-deleted-items job", 
      details: errorMessage
    }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}); 