import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/database.types";
import type { SupabaseClient } from '@supabase/supabase-js';

// Store a single instance of the Supabase client
let supabaseClientInstance: SupabaseClient<Database> | null = null;

/**
 * Creates a singleton Supabase client instance for browser use
 * 
 * This implementation ensures only one Supabase client is created
 * throughout the application lifecycle, preventing duplicate instances
 * and potential performance/memory issues.
 * 
 * @returns The singleton Supabase client instance
 */
export function createClient(): SupabaseClient<Database> {
  // If the instance already exists, return it
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Otherwise, create a new instance, store it, and return it
  supabaseClientInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClientInstance;
}

/**
 * Resets the Supabase client instance
 * 
 * This is primarily used for testing or when you need to force
 * a fresh instance of the client. In most cases, you don't need to call this.
 */
export function resetClient(): void {
  supabaseClientInstance = null;
}
