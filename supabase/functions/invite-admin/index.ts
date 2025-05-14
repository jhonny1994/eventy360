// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2";

// Define CORS headers within the function (no external dependencies)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // For production, restrict to specific domains
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simplified admin invitation function - no auth checks on invoker
Deno.serve(async (req: Request) => {
  // Handle OPTIONS for CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Parse request body
    let invitedUserEmail, invitedUserName;
    try {
      const body = await req.json();
      invitedUserEmail = body.invitedUserEmail;
      invitedUserName = body.invitedUserName;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload: " + (e as Error).message }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!invitedUserEmail) {
      return new Response(
        JSON.stringify({ error: "invitedUserEmail is required." }),
        {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
        }
      );
    }

    console.log("Creating admin user for:", invitedUserEmail);
    
    // Create auth user with email confirmation
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email: invitedUserEmail,
      email_confirm: true,
      user_metadata: { 
        user_type: "admin",
        full_name: invitedUserName || ""
      }
    });

    if (userError) {
      console.error("Error creating user:", userError);
      // Check if the error is because the user already exists
      if (userError.message.includes("already") || userError.message.includes("exist")) {
        return new Response(
          JSON.stringify({
            error: `User with email ${invitedUserEmail} already exists. Admin role cannot be assigned via invite to an existing account.`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409, // Conflict
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create user: " + userError.message }),
        {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        }
      );
    }
    
    if (!userData || !userData.user) {
      return new Response(
        JSON.stringify({ error: "User created but no data returned" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
      }

    const userId = userData.user.id;
    console.log("User created with ID:", userId);
    
    // Check if a profile already exists for this user ID
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from("profiles")
      .select("id, user_type")
      .eq("id", userId)
      .maybeSingle();
      
    if (profileCheckError) {
      console.error("Error checking for existing profile:", profileCheckError);
        }
    
    // If profile exists, verify it's set to admin type
    if (existingProfile) {
      console.log("Profile already exists for this user ID:", existingProfile);
      
      // If profile exists but is not admin type, update it
      if (existingProfile.user_type !== "admin") {
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ user_type: "admin" })
          .eq("id", userId);

        if (updateError) {
          console.error("Failed to update profile to admin type:", updateError);
          return new Response(
            JSON.stringify({
              error: `Failed to update user profile to admin type: ${updateError.message}`
            }),
            {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500
            }
          );
        }
        
        console.log("Updated profile user_type to admin");
      } else {
        // Profile exists and is already admin type
        return new Response(
          JSON.stringify({
            message: "User is already an admin",
            user_id: userId
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
    }
    } else {
      // Create a new profile record with admin user_type
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
          id: userId,
        user_type: "admin",
          is_verified: false,
          is_extended_profile_complete: false
      });

    if (profileError) {
        console.error("Profile creation error:", profileError);
        console.error("Error details:", JSON.stringify(profileError));
        
        // Clean up the user if profile creation fails
        try {
          await supabaseClient.auth.admin.deleteUser(userId);
          console.log("Cleaned up auth user after profile creation failure:", userId);
        } catch (cleanupError) {
          console.error("Failed to clean up auth user:", cleanupError);
        }
        
        // Check for specific constraint violations
        if (profileError.message.includes("duplicate key") || profileError.code === "23505") {
          return new Response(
            JSON.stringify({
              error: `Conflict: A profile with ID ${userId} already exists. The user may have been created but the profile creation failed.`,
              details: profileError.message
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409, // Conflict
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Profile creation failed: " + profileError.message,
            details: JSON.stringify(profileError)
          }),
          {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
          }
        );
      }
    }

    // Check if admin_profile already exists
    const { data: existingAdminProfile, error: adminProfileCheckError } = await supabaseClient
      .from("admin_profiles")
      .select("profile_id, name")
      .eq("profile_id", userId)
      .maybeSingle();
      
    if (adminProfileCheckError) {
      console.error("Error checking for existing admin profile:", adminProfileCheckError);
    }
    
    // Create or update admin_profile record if name was provided
    if (invitedUserName) {
      if (existingAdminProfile) {
        // Update existing admin profile
        const { error: updateAdminProfileError } = await supabaseClient
          .from("admin_profiles")
          .update({ name: invitedUserName })
          .eq("profile_id", userId);
          
        if (updateAdminProfileError) {
          console.error("Admin profile update error:", updateAdminProfileError);
          // We don't fail the whole operation if admin_profile update fails
        } else {
          console.log("Updated existing admin profile");
        }
      } else {
        // Create new admin profile
        const { error: adminProfileError } = await supabaseClient
        .from("admin_profiles")
        .insert({
            profile_id: userId,
            name: invitedUserName
        });

        if (adminProfileError) {
          console.error("Admin profile creation error:", adminProfileError);
          // We don't fail the whole operation if admin_profile creation fails
        } else {
          console.log("Created new admin profile");
        }
      }
    }
    
    // Generate an invitation link
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: "magiclink",
      email: invitedUserEmail,
        options: {
        // IMPORTANT: ADMIN_INVITE_REDIRECT_URL should be set in your Supabase project's environment variables
        // to point to your deployed server-side admin auth callback endpoint.
        // Example: https://yourdomain.com/api/auth/callback (if your route.ts is served at /api/auth/callback)
        // The fallback below is for local development and assumes the server-side callback is at /admin/auth/callback
        redirectTo: Deno.env.get("ADMIN_INVITE_REDIRECT_URL") || 
                   "/admin/auth/magic-callback", // Using the working magic-callback path
      },
    });

    if (linkError) {
      console.error("Magic link generation error:", linkError);
      
      // More specific error handling based on the error content
      if (linkError.message.includes("already") || linkError.message.includes("exist")) {
        return new Response(
          JSON.stringify({ 
            error: "Error creating admin invitation: User was created but we couldn't generate a sign-in link. Please try again or contact support.",
            technical_details: linkError.message
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
    }

      // Generic error for other cases
      return new Response(
        JSON.stringify({ error: "Failed to generate sign-in link: " + linkError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Add to notification queue if it exists
    try {
    const { error: queueError } = await supabaseClient
      .from("notification_queue")
      .insert({
          recipient_profile_id: userId,
        template_key: "admin_invitation",
        payload_data: {
            admin_name: invitedUserName || invitedUserEmail,
            signin_link: linkData?.properties?.action_link,
        },
        status: "pending",
      });

    if (queueError) {
        console.error("Error queueing notification:", queueError);
        // Don't fail the whole operation
      }
    } catch (queueError) {
      console.error("Notification queueing failed:", queueError);
      // Don't fail if the table doesn't exist or there's an issue
    }
    
    // Return success with the invite link
    return new Response(
      JSON.stringify({
        message: "Admin invited successfully",
        user_id: userId,
        signin_link: linkData?.properties?.action_link || "No link generated"
      }),
      {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unexpected error occurred", 
        details: error instanceof Error ? error.message : String(error)
      }),
      {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
      }
    );
  }
}); 
