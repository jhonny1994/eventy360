import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { z } from "https://deno.land/x/zod@v3.23.3/mod.ts";
// Define the expected structure of the request body
const RequestSchema = z.object({
  target_user_id: z.string().uuid(),
  new_is_verified_status: z.boolean(),
});
Deno.serve(async (req) => {
  // Create a Supabase client authenticated with the user's JWT
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization"),
        },
      },
    }
  );
  try {
    // 1. Authenticate and verify admin status
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Authentication error:", userError?.message);
      return new Response(
        JSON.stringify({
          error: "Authentication failed",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();
    if (profileError || profile?.user_type !== "admin") {
      console.error(
        "Authorization error: User is not an admin or profile not found."
      );
      return new Response(
        JSON.stringify({
          error: "Permission denied",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // 2. Validate request body
    const json = await req.json();
    const validationResult = RequestSchema.safeParse(json);
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const { target_user_id, new_is_verified_status } = validationResult.data;
    // Prevent changing own badge via this function (admins can do it via SQL if needed)
    if (target_user_id === user.id) {
      return new Response(
        JSON.stringify({
          error:
            "Admins cannot manage their own verification badge via this function",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // 3. Fetch current status for logging (optional but good practice)
    const { data: targetProfile, error: fetchTargetProfileError } =
      await supabaseClient
        .from("profiles")
        .select("is_verified")
        .eq("id", target_user_id)
        .single();
    if (fetchTargetProfileError) {
      console.error(
        "Error fetching target profile status:",
        fetchTargetProfileError
      );
      // Decide if this should be a hard error or just skip logging previous state
      // For now, we'll proceed with the update but log the error
    }
    const old_is_verified_status = targetProfile?.is_verified ?? null;
    // 4. Update the is_verified status
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        is_verified: new_is_verified_status,
        updated_at: new Date().toISOString(),
      }) // Also update updated_at
      .eq("id", target_user_id);
    if (updateError) {
      console.error("Error updating user verification status:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update user verification status",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // 5. Log the action
    const action_type = new_is_verified_status
      ? "awarded_badge"
      : "removed_badge";
    const logDetails = {
      previous_status: old_is_verified_status,
      new_status: new_is_verified_status,
      target_user_id: target_user_id,
    };
    const { error: logError } = await supabaseClient
      .from("admin_actions_log")
      .insert({
        admin_user_id: user.id,
        action_type: action_type,
        target_user_id: target_user_id,
        details: logDetails,
      });
    if (logError) {
      console.error("Error logging admin action:", logError);
      // Decide if logging failure should prevent the update success response
      // For now, we'll just log the error and still report update success
    }
    // 6. Return success response
    return new Response(
      JSON.stringify({
        message:
          "User verification status updated and action logged successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
