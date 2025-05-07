import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Define explicit public-facing auth flow paths
const AUTH_SYSTEM_PATHS = [
  '/auth/callback',
  '/auth/confirm',
];

const UNAUTHENTICATED_USER_ACCESSIBLE_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/error',
];

const PROFILE_COMPLETION_ACCESSIBLE_PATHS = [
  '/complete-profile',
  '/confirm-email',
  // Add API routes essential for profile completion if any are called from client-side
  // e.g., '/api/auth/logout' or '/api/some-data-for-profile-form'
];

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const i18nResponse = handleI18nRouting(request);
  const { response: supabaseResponseAfterSessionUpdate, user } = await updateSession(request, i18nResponse);

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

  if (AUTH_SYSTEM_PATHS.includes(pathWithoutLocale)) {
    return supabaseResponseAfterSessionUpdate;
  }

  if (!user) {
    const isAllowedUnauthenticatedPath = UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedUnauthenticatedPath) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    return supabaseResponseAfterSessionUpdate;
  }

  // --- USER IS AUTHENTICATED (`user` object exists) ---

  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    const homeUrl = new URL(`/${currentLocale}/profile`, request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
    });
    return redirectResponse;
  }

  const confirmEmailAppPath = `/${currentLocale}/confirm-email`;
  if (!user.email_confirmed_at) {
    if (request.nextUrl.pathname !== confirmEmailAppPath && pathWithoutLocale !== '/auth/confirm') {
      const redirectResponse = NextResponse.redirect(new URL(confirmEmailAppPath, request.url));
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    return supabaseResponseAfterSessionUpdate;
  }

  // --- EMAIL IS CONFIRMED (`user.email_confirmed_at` exists) ---
  
  const supabaseMiddlewareClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );

  const { data: profileData, error: profileQueryError } = await supabaseMiddlewareClient
    .from('profiles')
    .select('is_extended_profile_complete')
    .eq('id', user.id)
    .single();

  const completeProfileAppPath = `/${currentLocale}/complete-profile`;
  const defaultProfileRedirectUrl = new URL(`/${currentLocale}/profile`, request.url);

  if (profileQueryError) {
    console.error(`Middleware: Error fetching profile for user ${user.id}. Message: ${profileQueryError.message}. Redirecting to ${completeProfileAppPath} as a fallback.`);
    const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
    supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
    });
    return redirectResponse;
  }

  if (!profileData) {
    console.warn(`Middleware: Profile record not found for user ${user.id}. This might indicate a data integrity issue. Redirecting to ${completeProfileAppPath}.`);
    const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
    supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
    });
    return redirectResponse;
  }

  if (!profileData.is_extended_profile_complete) {
    const isAllowedDuringProfileCompletion = PROFILE_COMPLETION_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedDuringProfileCompletion) {
      const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
      supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
      });
      return redirectResponse;
    }
    return supabaseResponseAfterSessionUpdate;
  }

  if (pathWithoutLocale === '/complete-profile') { 
    const redirectResponse = NextResponse.redirect(defaultProfileRedirectUrl);
    supabaseResponseAfterSessionUpdate.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
    });
    return redirectResponse;
  }

  return supabaseResponseAfterSessionUpdate;
}

export const config = {
  matcher: [
    '/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz).*).',
  ],
}; 