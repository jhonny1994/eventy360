import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/database.types";

/**
 * Creates a server-side Supabase client with proper cookie handling for Next.js App Router
 * 
 * This function creates a fresh client instance for each request.
 * Since createServerClient is lightweight, we don't need to cache it globally,
 * which avoids potential memory leaks and cross-request contamination.
 * 
 * @returns Supabase client for server-side operations
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
}
