import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import type { Database } from "@/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Cache for middleware clients to avoid creating multiple instances
const middlewareClientCache = new Map<string, SupabaseClient<Database>>();

/**
 * Creates or retrieves a Supabase client for middleware with singleton pattern
 * 
 * This function ensures we only create one Supabase client per request context,
 * helping to prevent the "Multiple Supabase clients created" warning.
 * 
 * @param request - The Next.js request object 
 * @returns A Supabase client instance (new or cached)
 */
export function createMiddlewareClient(request: NextRequest): SupabaseClient<Database> {
  // Generate a cache key based on auth cookies to ensure proper isolation
  const authCookies = request.cookies.getAll()
    .filter(cookie => cookie.name.includes('supabase') || cookie.name.includes('sb-'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(';');
  
  const cacheKey = authCookies || 'default-middleware-client';
  
  // Return cached instance if it exists
  if (middlewareClientCache.has(cacheKey)) {
    return middlewareClientCache.get(cacheKey) as SupabaseClient<Database>;
  }
  
  // Create a new client if none exists
  const client = createServerClient<Database>(
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
        },
      },
    }
  );
  
  // Cache the client for future requests
  middlewareClientCache.set(cacheKey, client);
  
  return client;
}

/**
 * Clears the middleware client cache
 * This is primarily used for testing purposes.
 */
export function clearMiddlewareClientCache(): void {
  middlewareClientCache.clear();
}
