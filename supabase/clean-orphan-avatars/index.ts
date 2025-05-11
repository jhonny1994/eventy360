import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
console.log("Function clean-orphan-avatars (v4 - CORS added) starting up...");
// Standard CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: CORS_HEADERS,
    });
  }
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables.");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
        }),
        {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const userSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization"),
        },
      },
    });
    const {
      data: { user },
      error: userError,
    } = await userSupabaseClient.auth.getUser();
    if (userError || !user) {
      console.error(
        "Error getting user or user not found:",
        userError?.message
      );
      return new Response(
        JSON.stringify({
          error: "Authentication error",
        }),
        {
          status: 401,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(`Authenticated user ID: ${user.id}`);
    let newAvatarFileName;
    if (req.body) {
      try {
        const body = await req.json();
        newAvatarFileName = body.newAvatarPath;
        if (!newAvatarFileName || typeof newAvatarFileName !== "string") {
          throw new Error(
            "Request body must contain 'newAvatarPath' as a string (e.g., 'USER_ID.ext')."
          );
        }
      } catch (jsonError) {
        console.error(
          "Error parsing JSON body or missing/invalid newAvatarPath:",
          jsonError.message
        );
        return new Response(
          JSON.stringify({
            error: `Invalid request body: ${jsonError.message}`,
          }),
          {
            status: 400,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      console.error("Request body is null.");
      return new Response(
        JSON.stringify({
          error: "Invalid request: Missing request body.",
        }),
        {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(`Received newAvatarFileName: ${newAvatarFileName}`);
    const fileNameParts = newAvatarFileName.split(".");
    const fileUserId = fileNameParts[0];
    const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop() : null;
    if (
      fileNameParts.length === 0 ||
      !fileExtension ||
      fileUserId !== user.id
    ) {
      console.error(
        `Path mismatch or format error. Expected "${user.id}.ext", got "${newAvatarFileName}".`
      );
      return new Response(
        JSON.stringify({
          error:
            "Forbidden: Avatar path is invalid or does not correspond to authenticated user.",
        }),
        {
          status: 403,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(
      `Path validation passed for user ${user.id} and file ${newAvatarFileName}`
    );
    const serviceSupabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );
    const searchPrefix = `${user.id}.`;
    console.log(
      `Listing files in 'avatars' bucket with search prefix: "${searchPrefix}"`
    );
    const { data: filesInBucket, error: listError } =
      await serviceSupabaseClient.storage.from("avatars").list("", {
        search: searchPrefix,
      });
    if (listError) {
      console.error("Error listing files from storage:", listError.message);
      return new Response(
        JSON.stringify({
          error: `Storage error when listing files: ${listError.message}`,
        }),
        {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    if (!filesInBucket || filesInBucket.length === 0) {
      console.log(
        `No existing avatars found with prefix "${searchPrefix}". No cleanup needed.`
      );
      return new Response(
        JSON.stringify({
          message: "No existing avatars to clean up for user.",
        }),
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(
      `Found ${filesInBucket.length} file(s) with prefix "${searchPrefix}":`,
      filesInBucket.map((f) => f.name)
    );
    const filesToDelete = filesInBucket
      .filter((file) => file.name !== newAvatarFileName)
      .map((file) => file.name);
    if (filesToDelete.length === 0) {
      console.log(
        `No old avatars to delete. The only file present matching the prefix is the new one or matches its name.`
      );
      return new Response(
        JSON.stringify({
          message: "No old avatars to delete.",
        }),
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log(
      `Identified ${filesToDelete.length} file(s) to delete:`,
      filesToDelete
    );
    const { data: deleteData, error: deleteError } =
      await serviceSupabaseClient.storage.from("avatars").remove(filesToDelete);
    if (deleteError) {
      console.error("Error deleting old avatars:", deleteError.message);
      return new Response(
        JSON.stringify({
          error: `Failed to delete one or more old avatars: ${deleteError.message}`,
        }),
        {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
    console.log("Old avatars cleaned up successfully:", deleteData);
    return new Response(
      JSON.stringify({
        message: "Old avatars cleaned up successfully.",
        deleted: filesToDelete,
      }),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    console.error(
      "Unexpected error in Edge Function execution:",
      e.message,
      e.stack
    );
    return new Response(
      JSON.stringify({
        error: e.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
