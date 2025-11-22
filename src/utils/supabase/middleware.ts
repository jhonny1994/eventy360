import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/database.types";
import type { User, SupabaseClient } from "@supabase/supabase-js";

// Cache for middleware clients to avoid creating multiple instances
const middlewareClientCache = new Map<string, SupabaseClient<Database>>();

/**
 * Updates the session and returns the user and modified response
 * 
 * This implementation uses a singleton pattern to cache Supabase clients
 * based on the request's auth cookies, reducing unnecessary client creations.
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
  
  // Generate a cache key based on auth cookies
  const authCookies = request.cookies.getAll()
    .filter(cookie => cookie.name.includes('supabase') || cookie.name.includes('sb-'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(';');
  
  const cacheKey = authCookies || 'default-middleware-client';
  
  // Get cached client or create a new one
  let supabase: SupabaseClient<Database>;
  
  if (middlewareClientCache.has(cacheKey)) {
    supabase = middlewareClientCache.get(cacheKey) as SupabaseClient<Database>;
  } else {
    supabase = createServerClient<Database>(
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
    
    // Cache the client for future use
    middlewareClientCache.set(cacheKey, supabase);
  }

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

/**
 * Clears the middleware client cache
 * This is primarily used for testing purposes.
 */
export function clearMiddlewareClientCache(): void {
  middlewareClientCache.clear();
}