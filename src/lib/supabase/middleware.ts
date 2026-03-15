
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/database.types";
import type { User } from "@supabase/supabase-js";

/**
 * Updates the session and returns the user and modified response
 * 
 * This function creates a fresh client instance for each request.
 * Since createServerClient is lightweight, we don't need to cache it globally,
 * which avoids potential memory leaks and cross-request contamination.
 * 
 * @param request - The Next.js request object
 * @param response - Optional response to update with cookies
 * @returns Updated response and user
 */
export async function updateSession(
  request: NextRequest,
  response?: NextResponse
): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = response ?? NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = response ?? NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Ignore "Auth session missing" error as it just means the user is not logged in
  if (error && !error.message.includes("Auth session missing")) {
    console.error("Error fetching user in middleware:", error);
  }

  return { response: supabaseResponse, user };
}

