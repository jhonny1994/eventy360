// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

// Standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const adminInviteRedirectUrl = Deno.env.get("ADMIN_INVITE_REDIRECT_URL");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase URL or Service Role Key");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing Supabase credentials.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!adminInviteRedirectUrl) {
      console.error("Missing ADMIN_INVITE_REDIRECT_URL environment variable.");
      return new Response(
        JSON.stringify({
          error:
            "Server configuration error: Missing admin invite redirect URL.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient: SupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    // Get invitedUserEmail and invitedUserName from the request body
    let invitedUserEmail: string | undefined;
    let invitedUserName: string | undefined;
    let roleName: string | undefined = "admin"; // Default role

    try {
      const body = await req.json();
      invitedUserEmail = body.invitedUserEmail;
      invitedUserName = body.invitedUserName; // This can be optional
      roleName = body.roleName || "admin";
    } catch (jsonError) {
      console.error("Error parsing JSON body:", jsonError);
      return new Response(
        JSON.stringify({ error: "Invalid request body: " + jsonError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!invitedUserEmail) {
      return new Response(
        JSON.stringify({ error: "invitedUserEmail is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format (basic validation)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedUserEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format for invitedUserEmail" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ensure invitedUserName is a string if provided, or use email prefix
    const finalInvitedUserName =
      typeof invitedUserName === "string" && invitedUserName.trim() !== ""
        ? invitedUserName.trim()
        : invitedUserEmail.split("@")[0];

    // Check if user already exists
    const { data: existingUser, error: existingUserError } =
      await supabaseClient.auth.admin.getUserByEmail(invitedUserEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUserError && existingUserError.message !== "User not found") {
      console.error("Error checking for existing user:", existingUserError);
      return new Response(
        JSON.stringify({
          error:
            "Error checking for existing user: " + existingUserError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existingUser && existingUser.user) {
      userId = existingUser.user.id;
      console.log("User already exists with ID:", userId);
      // Optional: Check if they are already an admin or have a pending invite.
      // For now, we allow re-inviting, which might refresh their magic link or update details.
    } else {
      // Create a new user
      const { data: newUser, error: createUserError } =
        await supabaseClient.auth.admin.createUser({
          email: invitedUserEmail,
          email_confirm: true, // Auto-confirm email as admin is inviting
          // password: // Let user set password via magic link flow
        });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        // Handle specific errors like "User already registered" if email_confirm was false
        if (
          createUserError.message.includes("User already registered") ||
          createUserError.message.includes("already exists")
        ) {
          return new Response(
            JSON.stringify({
              error:
                "A user with this email already exists. If they are not an admin yet, try inviting again. Technical details: " +
                createUserError.message,
            }),
            {
              status: 409,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            } // Conflict
          );
        }
        return new Response(
          JSON.stringify({
            error: "Failed to create user: " + createUserError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      userId = newUser.user.id;
      isNewUser = true;
      console.log("New user created with ID:", userId);
    }

    // Create or update profile and admin_profile records
    // Ensure profiles record exists
    const { error: profileUpsertError } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          user_type: roleName, // Set to admin or the specified role
          is_verified: true, // Admins are auto-verified
          is_extended_profile_complete: false, // They will complete this after first login
        },
        { onConflict: "id" }
      );

    if (profileUpsertError) {
      console.error("Profile upsert error:", profileUpsertError);
      // If user creation was part of this flow and profile fails, consider cleanup
      if (isNewUser) {
        await supabaseClient.auth.admin.deleteUser(userId);
        console.log(
          "Cleaned up new auth user due to profile upsert failure:",
          userId
        );
      }
      return new Response(
        JSON.stringify({
          error:
            "Failed to create/update user profile: " +
            profileUpsertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log(
      `Profile for user ${userId} ensured/updated with role ${roleName}.`
    );

    // Ensure admin_profiles record exists
    const { error: adminProfileUpsertError } = await supabaseClient
      .from("admin_profiles")
      .upsert(
        {
          profile_id: userId,
          name: finalInvitedUserName,
        },
        { onConflict: "profile_id" }
      );

    if (adminProfileUpsertError) {
      console.error("Admin profile upsert error:", adminProfileUpsertError);
      // This is less critical, so we might not want to fail the whole invitation. Log and continue.
      console.warn(
        `Failed to upsert admin_profile for ${userId}. Invitation will proceed. Error: ${adminProfileUpsertError.message}`
      );
    } else {
      console.log(`Admin profile for user ${userId} ensured/updated.`);
    }

    // Generate an invitation magic link
    const { data: linkData, error: linkError } =
      await supabaseClient.auth.admin.generateLink({
        type: "magiclink",
        email: invitedUserEmail,
        options: {
          redirectTo: adminInviteRedirectUrl, // Use the env variable
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Magic link generation error:", linkError);
      return new Response(
        JSON.stringify({
          error:
            "Failed to generate sign-in link: " +
            (linkError?.message || "Unknown error"),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const magicLink = linkData.properties.action_link;
    console.log("Magic link generated:", magicLink);

    // Call the create_admin_invitation SQL function to record invitation and queue notification
    const { error: rpcError } = await supabaseClient.rpc(
      "create_admin_invitation",
      {
        p_invited_user_email: invitedUserEmail,
        p_magic_link: magicLink,
      }
    );

    if (rpcError) {
      console.error("Error calling create_admin_invitation RPC:", rpcError);
      return new Response(
        JSON.stringify({
          error: "Failed to process admin invitation: " + rpcError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Admin invitation notification queued successfully via RPC.");

    // Return success
    return new Response(
      JSON.stringify({
        message:
          "Admin invited successfully. An email with a magic link will be sent.",
        user_id: userId,
        // No invitation_record_id to return as the SQL function is VOID
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in invite-admin function:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
