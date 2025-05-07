import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Adapted Supabase middleware utility for session management.
 * Handles cookie operations and returns the user object and the response.
 *
 * @param request The incoming NextRequest.
 * @param response An optional existing NextResponse to add cookies to.
 * @returns An object containing the response (potentially modified) and the user.
 */
export async function updateSession(request: NextRequest, response?: NextResponse): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = response ?? NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request object for subsequent Supabase calls in the same middleware chain
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Set cookies on the response object to be sent back to the browser
          supabaseResponse = response ?? NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user in middleware:', error);
    // Decide how to handle the error, e.g., clear potentially invalid cookies?
    // For now, we'll proceed, but the user will be null.
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you need to create a *new* response object later in the middleware chain
  // (e.g., for redirects), make sure to copy the cookies from this response object over.

  return { response: supabaseResponse, user };
} 