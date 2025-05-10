import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { cookies as getRequestCookies } from "next/headers";

import type { Database } from "@/database.types";

export async function createServerSupabaseClient() {
  const cookieStore = await getRequestCookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (_error) {
            console.warn(
              "Supabase server client setAll cookie error (often ignorable):",
              _error
            );
          }
        },
      },
    }
  );
}
