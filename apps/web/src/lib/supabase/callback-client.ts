import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from "@/database.types";
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

// Store auth callback client instances by cache key
const callbackClientInstances = new Map<string, SupabaseClient<Database>>();

/**
 * Creates a singleton Supabase client for auth callback routes
 * 
 * This implementation is specialized for the callback route that handles
 * OAuth and email confirmation callbacks. It ensures proper cookie handling
 * for the NextResponse instance.
 * 
 * @param request - The Next.js request
 * @param response - The Next.js response to update with cookies
 * @returns A Supabase client instance (cached when possible)
 */
export function createCallbackClient(
  request: NextRequest,
  response: NextResponse
): SupabaseClient<Database> {
  // Generate a cache key based on the request URL and cookies
  // For auth callbacks, we typically want a fresh client each time
  // but we'll still cache based on the code parameter
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const authCookies = request.cookies.getAll()
    .filter(cookie => cookie.name.includes('supabase') || cookie.name.includes('sb-'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(';');
    
  const cacheKey = `${code}:${authCookies}`;
  
  // For auth callbacks, we might want a fresh client each time
  // Uncomment this to clear the cache for each new request
  // callbackClientInstances.clear();
  
  // Return cached instance if it exists
  if (callbackClientInstances.has(cacheKey)) {
    return callbackClientInstances.get(cacheKey) as SupabaseClient<Database>;
  }
  
  // Create a new client with cookie handling for the callback
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ 
            name,
            path: options.path,
            domain: options.domain,
          });
        },
      },
    }
  );
  
  // Cache the client
  callbackClientInstances.set(cacheKey, client);
  
  return client;
}

/**
 * Clears the callback client cache
 * 
 * This is primarily useful for testing purposes.
 */
export function clearCallbackClientCache(): void {
  callbackClientInstances.clear();
}
