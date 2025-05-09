import { createServerClient, type CookieOptions } from '@supabase/ssr';
// Renaming import to avoid confusion if cookies() is treated as async by the linter
import { cookies as getRequestCookies } from 'next/headers';
// Updated import path to match the filename
import type { Database } from '@/database.types'; 

// Making the function async to await cookies() if the linter insists it's a Promise
export async function createServerSupabaseClient() {
  // Awaiting getRequestCookies() based on persistent linter feedback suggesting it's a Promise
  const cookieStore = await getRequestCookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Now cookieStore is the resolved ReadonlyRequestCookies object
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (_error) {
            // Using console.warn to address the unused variable linter error
            console.warn('Supabase server client setAll cookie error (often ignorable):', _error);
          }
        },
      },
    }
  );
} 