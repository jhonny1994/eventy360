import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Added for profile fetching

// Define explicit public-facing auth flow paths
// These are pages an unauthenticated user might need to access, or Supabase needs for its flow.
const AUTH_SYSTEM_PATHS = [
  '/auth/callback', // Supabase OAuth callback
  '/auth/confirm',  // Supabase email link processing endpoint
];

const UNAUTHENTICATED_USER_ACCESSIBLE_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password', // Assumes token validation is handled by the page itself
  '/error',         // Next.js error page
];

// Create the i18n middleware instance
const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Step 1: Handle i18n routing first
  const i18nResponse = handleI18nRouting(request);

  // Step 2: Update Supabase session
  const { response: supabaseResponseAfterSessionUpdate, user } = await updateSession(request, i18nResponse);

  // Step 3: Determine current path without locale for logic
  let pathWithoutLocale = pathname;
  const localePattern = new RegExp(`^/(${routing.locales.join('|')})(.*)`);
  const pathMatch = pathname.match(localePattern);
  const currentLocale = pathMatch ? pathMatch[1] : routing.defaultLocale;
  if (pathMatch && pathMatch[2]) {
    pathWithoutLocale = pathMatch[2] || '/';
  }
  if (!pathWithoutLocale.startsWith('/')) {
    pathWithoutLocale = '/' + pathWithoutLocale;
  }

  // Step 4: Allow Supabase's own auth system paths to pass through early
  if (AUTH_SYSTEM_PATHS.includes(pathWithoutLocale)) {
    return supabaseResponseAfterSessionUpdate;
  }

  // Step 5: Handle UNauthenticated users
  if (!user) {
    const isAllowedUnauthenticatedPath = UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedUnauthenticatedPath) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      // loginUrl.searchParams.set('next', pathname); // Optional: redirect back after login
      console.log(`Middleware: Redirecting unauthenticated user from ${pathname} to ${loginUrl.toString()}`);
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    // User is not authenticated but is on an allowed path (e.g., /login)
    return supabaseResponseAfterSessionUpdate;
  }

  // --- USER IS AUTHENTICATED (`user` object exists) ---

  // Step 6: Redirect authenticated users away from login/register pages
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    const homeUrl = new URL(`/${currentLocale}/profile`, request.url); // Default redirect for logged-in users
    console.log(`Middleware: Redirecting authenticated user from ${pathname} to ${homeUrl.toString()}`);
    const redirectResponse = NextResponse.redirect(homeUrl);
    supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
    });
    return redirectResponse;
  }

  // Step 7: Handle email confirmation
  const confirmEmailAppPath = `/${currentLocale}/confirm-email`;
  if (!user.email_confirmed_at) {
    if (request.nextUrl.pathname !== confirmEmailAppPath) {
      console.log(`Middleware: Redirecting unconfirmed user from ${pathname} to ${confirmEmailAppPath}`);
      const redirectResponse = NextResponse.redirect(new URL(confirmEmailAppPath, request.url));
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    // User's email is not confirmed, but they are on the confirm-email page. Allow.
    return supabaseResponseAfterSessionUpdate;
  }

  // --- EMAIL IS CONFIRMED (`user.email_confirmed_at` exists) ---

  // Step 8: Handle profile completion
  // Create a new Supabase client instance for fetching profile data
  const supabaseMiddlewareClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          // Note: This setAll is for the client instance.
          // The actual response cookies are managed by supabaseResponseAfterSessionUpdate
          // and copied to redirect responses.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );

  const { data: profile, error: profileError } = await supabaseMiddlewareClient
    .from('profiles')
    .select('is_extended_profile_complete')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error(`Middleware: Error fetching profile for user ${user.id}:`, profileError.message);
    // Potentially redirect to an error page or allow access but log,
    // returning supabaseResponseAfterSessionUpdate might be safest if profile check is not absolutely critical for all paths post-email-confirmation.
    // For now, let's allow them to proceed but this path might need more robust error handling.
    // Consider if public.profiles RLS allows this read. Default service_role should.
  }

  const completeProfileAppPath = `/${currentLocale}/complete-profile`;
  if (profile && !profile.is_extended_profile_complete) {
    if (request.nextUrl.pathname !== completeProfileAppPath) {
      console.log(`Middleware: Redirecting confirmed user with incomplete profile from ${pathname} to ${completeProfileAppPath}`);
      const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    // Email confirmed, profile incomplete, but they are on the complete-profile page. Allow.
    return supabaseResponseAfterSessionUpdate;
  }

  // --- USER IS AUTHENTICATED, EMAIL CONFIRMED, AND PROFILE IS COMPLETE (or profile fetch failed) ---
  // Allow access to the originally requested path.
  return supabaseResponseAfterSessionUpdate;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - trpc (tRPC routes)
     * - Health check paths
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz).*).',
  ],
}; 