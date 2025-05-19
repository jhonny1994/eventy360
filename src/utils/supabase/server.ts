import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/database.types";
import type { SupabaseClient } from '@supabase/supabase-js';

// Store server client instances by cache key (each cookie context needs its own instance)
const serverClientInstances = new Map<string, SupabaseClient<Database>>();

/**
 * Creates a server-side Supabase client with proper cookie handling for Next.js App Router
 * 
 * This implementation maintains a cache of client instances to avoid creating
 * multiple clients for the same cookie context, while still ensuring proper
 * cookie handling in server components.
 * 
 * @returns Supabase client for server-side operations
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  // Generate a cache key based on available cookies relevant to auth
  // This is necessary because each unique cookie context needs its own client
  const authCookies = cookieStore.getAll()
    .filter(cookie => cookie.name.includes('supabase') || cookie.name.includes('sb-'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(';');
  
  const cacheKey = authCookies || 'default-server-client';
  
  // Return cached instance if it exists
  if (serverClientInstances.has(cacheKey)) {
    return serverClientInstances.get(cacheKey) as SupabaseClient<Database>;
  }
  
  // Create a new client instance if none exists for this context
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Silently handle cookie errors in server components
          }
        },
      },
    }
  );
  
  // Cache the new instance
  serverClientInstances.set(cacheKey, client);
  
  return client;
}

/**
 * Clears the server client cache
 * 
 * This is primarily used for testing purposes or when you need to
 * force new client instances to be created.
 */
export function clearServerClientCache(): void {
  serverClientInstances.clear();
}
