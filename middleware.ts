import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware'; // Import the adapted utility
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Define public paths (accessible without authentication)
const publicPaths = [
  '/login',
  '/register',
  '/auth/callback', // Supabase redirects here
  '/auth/confirm',  // Supabase redirects here
  '/error'           // Next.js error page
];

// Create the i18n middleware instance
const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Step 1: Handle i18n routing first
  // This might return a redirect or rewrite response, or null/undefined if it doesn't handle the path
  const i18nResponse = handleI18nRouting(request);

  // Step 2: Update Supabase session, potentially adding cookies to the i18n response
  // updateSession needs the response object from the previous step to add cookies if needed
  const { response: supabaseResponse, user } = await updateSession(request, i18nResponse);

  // Step 3: Determine if the current path (without locale prefix) is public or protected
  // Remove locale prefix for matching purposes if it exists
  let pathWithoutLocale = pathname;
  const localePattern = new RegExp(`^/(${routing.locales.join('|')})(.*)`);
  const match = pathname.match(localePattern);
  const currentLocale = match ? match[1] : routing.defaultLocale;
  if (match && match[2]) {
    pathWithoutLocale = match[2] || '/'; // Use the part after locale, or root if only locale exists
  }

  // Ensure root path starts with / for matching
  if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
  }

  const isPublic = publicPaths.some((path) => pathWithoutLocale === path);

  // Step 4: Implement redirect logic
  if (!user && !isPublic) {
    // Not logged in and trying to access a protected path
    // Redirect to login page, preserving the locale prefix
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    // loginUrl.searchParams.set('next', pathname); // Optionally add redirect path
    console.log(`Redirecting unauthenticated user from ${pathname} to ${loginUrl.toString()}`);

    // Create a new redirect response, but copy necessary cookies from supabaseResponse
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;

  } else if (user && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
    // Logged in user trying to access login/register page
    // Redirect to a default authenticated page (e.g., profile), preserving locale
    const homeUrl = new URL(`/${currentLocale}/`, request.url); // Adjust to your home path if different
    console.log(`Redirecting authenticated user from ${pathname} to ${homeUrl.toString()}`);

    // Create a new redirect response, copying cookies
    const redirectResponse = NextResponse.redirect(homeUrl);
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Step 5: Return the Supabase response (which includes i18n modifications and session cookies)
  return supabaseResponse;
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
    '/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz).*)',
  ],
}; 