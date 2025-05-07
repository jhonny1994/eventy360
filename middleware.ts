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

// Handle i18n routing
const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  console.log(`Middleware: Processing ${request.nextUrl.pathname}`);
  
  const { pathname } = request.nextUrl;
  
  // Prepare i18n response
  const i18nResponse = handleI18nRouting(request);
  const { response: supabaseResponseAfterSessionUpdate, user } = await updateSession(request, i18nResponse);

  // Extract locale from path
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

  console.log(`Middleware: Path without locale: ${pathWithoutLocale}, Current locale: ${currentLocale}`);

  // Allow auth system paths
  if (AUTH_SYSTEM_PATHS.includes(pathWithoutLocale)) {
    console.log(`Middleware: Allowing auth system path: ${pathWithoutLocale}`);
    return supabaseResponseAfterSessionUpdate;
  }

  // Handle /redirect path which should always redirect
  if (pathWithoutLocale === '/redirect') {
    console.log(`Middleware: Processing redirect path, user exists: ${!!user}`);
    
    // For unauthenticated users, redirect to login
    if (!user) {
      console.log('Middleware: Redirecting unauthenticated user to login');
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    // For authenticated but not email verified users
    if (!user.email_confirmed_at) {
      console.log('Middleware: Redirecting to confirm-email (from redirect path)');
      const confirmEmailUrl = new URL(`/${currentLocale}/confirm-email`, request.url);
      const redirectResponse = NextResponse.redirect(confirmEmailUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    try {
      // Check profile completion status
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
        
      console.log(`Middleware: Profile query results:`, { 
        profileData, 
        hasError: !!profileQueryError,
        errorMessage: profileQueryError?.message 
      });
      
      // If error or profile not found, redirect to complete profile
      if (profileQueryError || !profileData) {
        console.log('Middleware: Redirecting to complete-profile due to error or missing profile');
        const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      // If profile not complete, redirect to complete profile
      if (!profileData.is_extended_profile_complete) {
        console.log('Middleware: Redirecting to complete-profile (incomplete profile)');
        const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      // All checks passed, redirect to profile
      console.log('Middleware: All checks passed, redirecting to profile');
      const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
      const redirectResponse = NextResponse.redirect(profileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    } catch (err) {
      // Log any errors and fall back to profile completion
      console.error('Middleware: Unexpected error in redirect handler:', err);
      const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
      const redirectResponse = NextResponse.redirect(completeProfileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
  }

  // Handle unauthenticated users
  if (!user) {
    console.log(`Middleware: User not authenticated, path: ${pathWithoutLocale}`);
    
    const isAllowedUnauthenticatedPath = UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedUnauthenticatedPath) {
      console.log(`Middleware: Redirecting unauthenticated user to login from ${pathWithoutLocale}`);
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    // Allow access to unauthenticated-accessible paths
    return supabaseResponseAfterSessionUpdate;
  }

  // --- USER IS AUTHENTICATED (`user` object exists) ---
  console.log(`Middleware: User authenticated (${user.id}), path: ${pathWithoutLocale}`);

  // Redirect authenticated users away from login/register
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    console.log('Middleware: Redirecting authenticated user from login/register to redirect path');
    const redirectUrl = new URL(`/${currentLocale}/redirect`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
    return redirectResponse;
  }

  // Check if email is confirmed
  if (!user.email_confirmed_at) {
    console.log(`Middleware: Email not confirmed for ${user.id}, current path: ${pathWithoutLocale}`);
    
    const confirmEmailAppPath = `/${currentLocale}/confirm-email`;
    // Allow access to confirm-email path and auth/confirm
    if (request.nextUrl.pathname !== confirmEmailAppPath && pathWithoutLocale !== '/auth/confirm') {
      console.log(`Middleware: Redirecting to confirm-email from ${pathWithoutLocale}`);
      const redirectResponse = NextResponse.redirect(new URL(confirmEmailAppPath, request.url));
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    return supabaseResponseAfterSessionUpdate;
  }

  // --- EMAIL IS CONFIRMED (`user.email_confirmed_at` exists) ---
  console.log(`Middleware: Email confirmed for ${user.id}`);
  
  // Get profile data
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

  try {
    const { data: profileData, error: profileQueryError } = await supabaseMiddlewareClient
      .from('profiles')
      .select('is_extended_profile_complete')
      .eq('id', user.id)
      .single();
      
    console.log(`Middleware: Profile check for ${user.id}:`, { 
      profileData, 
      hasError: !!profileQueryError,
      path: pathWithoutLocale
    });

    const completeProfileAppPath = `/${currentLocale}/complete-profile`;
    const defaultProfileRedirectUrl = new URL(`/${currentLocale}/profile`, request.url);

    // Handle profile query errors
    if (profileQueryError) {
      console.error(`Middleware: Error fetching profile: ${profileQueryError.message}`);
      if (pathWithoutLocale !== '/complete-profile') {
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    // Handle missing profile data
    if (!profileData) {
      console.warn(`Middleware: Profile record not found for user ${user.id}`);
      if (pathWithoutLocale !== '/complete-profile') {
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    // Handle incomplete profile
    if (!profileData.is_extended_profile_complete) {
      console.log(`Middleware: Profile not complete for ${user.id}`);
      const isAllowedDuringProfileCompletion = PROFILE_COMPLETION_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
      if (!isAllowedDuringProfileCompletion) {
        console.log(`Middleware: Redirecting to complete-profile from ${pathWithoutLocale}`);
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    // Redirect from complete-profile to profile if profile is already complete
    if (pathWithoutLocale === '/complete-profile') {
      console.log('Middleware: Redirecting from complete-profile to profile (already complete)');
      const redirectResponse = NextResponse.redirect(defaultProfileRedirectUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    // Profile is complete and user is on a valid path - allow access
    return supabaseResponseAfterSessionUpdate;
  } catch (err) {
    // Handle unexpected errors gracefully
    console.error('Middleware: Unexpected error in profile check:', err);
    return supabaseResponseAfterSessionUpdate;
  }
}

// Helper function to copy cookies from one response to another
function copyAllCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach(cookie => {
    destination.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
  });
}

export const config = {
  matcher: [
    '/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz|robots.txt).*).',
  ],
}; 