import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createServerClient, type CookieOptions } from '@supabase/ssr';


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

  
  if (pathWithoutLocale === '/redirect') {
    
    
    if (!user) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    
    if (!user.email_confirmed_at) {
      const confirmEmailUrl = new URL(`/${currentLocale}/confirm-email`, request.url);
      const redirectResponse = NextResponse.redirect(confirmEmailUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    try {
      
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

      if (profileQueryError || !profileData) {
        const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      
      if (!profileData.is_extended_profile_complete) {
        const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      
      const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
      const redirectResponse = NextResponse.redirect(profileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    } catch  {
            const completeProfileUrl = new URL(`/${currentLocale}/complete-profile`, request.url);
      const redirectResponse = NextResponse.redirect(completeProfileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
  }

  
  if (!user) {
    
    const isAllowedUnauthenticatedPath = UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedUnauthenticatedPath) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    
    return supabaseResponseAfterSessionUpdate;
  }

  

  
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    const redirectUrl = new URL(`/${currentLocale}/redirect`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
    return redirectResponse;
  }

  
  if (!user.email_confirmed_at) {
    
    const confirmEmailAppPath = `/${currentLocale}/confirm-email`;
    
    if (request.nextUrl.pathname !== confirmEmailAppPath && pathWithoutLocale !== '/auth/confirm') {
      const redirectResponse = NextResponse.redirect(new URL(confirmEmailAppPath, request.url));
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    return supabaseResponseAfterSessionUpdate;
  }

  
  
  
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

    const completeProfileAppPath = `/${currentLocale}/complete-profile`;
    const defaultProfileRedirectUrl = new URL(`/${currentLocale}/profile`, request.url);

    
    if (profileQueryError) {
      if (pathWithoutLocale !== '/complete-profile') {
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    
    if (!profileData) {
      if (pathWithoutLocale !== '/complete-profile') {
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    
    if (!profileData.is_extended_profile_complete) {
      const isAllowedDuringProfileCompletion = PROFILE_COMPLETION_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
      if (!isAllowedDuringProfileCompletion) {
        const redirectResponse = NextResponse.redirect(new URL(completeProfileAppPath, request.url));
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    
    if (pathWithoutLocale === '/complete-profile') {
      const redirectResponse = NextResponse.redirect(defaultProfileRedirectUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    
    return supabaseResponseAfterSessionUpdate;
  } catch  {
    
    return supabaseResponseAfterSessionUpdate;
  }
}


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