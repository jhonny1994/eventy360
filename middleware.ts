import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type CookieOptions } from "@supabase/ssr";
import { createMiddlewareClient } from "@/utils/supabase/middleware-client";
import { applySubscriptionGuard } from "@/middleware/applySubscriptionGuard";
import { SubscriptionRestriction } from "@/middleware/subscriptionMiddleware";

const AUTH_SYSTEM_PATHS = [
  "/auth/callback",
  "/auth/confirm",
  "/admin/auth/magic-callback",
  "/callback"
];

const UNAUTHENTICATED_USER_ACCESSIBLE_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/error",
  "/admin/login",
];

const PROFILE_COMPLETION_ACCESSIBLE_PATHS = [
  "/complete-profile",
  "/confirm-email",
  "/admin/create-account",
];

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const i18nResponse = handleI18nRouting(request);
  const { response: supabaseResponseAfterSessionUpdate, user } =
    await updateSession(request, i18nResponse);
  
  let pathWithoutLocale = pathname;
  const localePattern = new RegExp(`^/(${routing.locales.join("|")})(.*)`);
  const pathMatch = pathname.match(localePattern);
  const currentLocale = pathMatch ? pathMatch[1] : routing.defaultLocale;
  
  if (pathMatch && pathMatch[2]) {
    pathWithoutLocale = pathMatch[2] || "/";
  }
  if (!pathWithoutLocale.startsWith("/")) {
    pathWithoutLocale = "/" + pathWithoutLocale;
  }
  
  // Custom redirect for submissions page to manage page
  // This matches URLs like /ar/profile/events/123-456/submissions
  const submissionsUrlPattern = new RegExp(`^/(${routing.locales.join("|")})/profile/events/([^/]+)/submissions$`);
  const submissionsMatch = pathname.match(submissionsUrlPattern);
  if (submissionsMatch) {
    const locale = submissionsMatch[1];
    const eventId = submissionsMatch[2];
    const redirectUrl = new URL(`/${locale}/profile/events/${eventId}/manage`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
    return redirectResponse;
  }
  
  // Handle URLs like /ar/profile/events/123-456/submissions/abc-def that aren't review pages
  const submissionDetailPattern = new RegExp(`^/(${routing.locales.join("|")})/profile/events/([^/]+)/submissions/([^/]+)$`);
  const submissionDetailMatch = pathname.match(submissionDetailPattern);
  if (submissionDetailMatch && !pathname.includes('/review-')) {
    // Keep this URL as is, it will be handled by the page
    return supabaseResponseAfterSessionUpdate;
  }
  
  if (AUTH_SYSTEM_PATHS.includes(pathWithoutLocale)) {
    return supabaseResponseAfterSessionUpdate;
  }

  if (pathWithoutLocale === "/redirect") {
    // Check for email confirmation URL parameter
    const urlParams = new URL(request.url).searchParams;
    const authAction = urlParams.get('auth_action');
    const isEmailJustConfirmed = authAction === 'email_confirmed';
    
    // If this is an email confirmation redirect, don't redirect again
    // Let the client-side redirect page handle it with proper UI
    if (isEmailJustConfirmed) {
      return supabaseResponseAfterSessionUpdate;
    }
    
    if (!user) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    if (!user.email_confirmed_at) {
      const confirmEmailUrl = new URL(
        `/${currentLocale}/confirm-email`,
        request.url
      );
      const redirectResponse = NextResponse.redirect(confirmEmailUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    try {
      const supabaseMiddlewareClient = createMiddlewareClient(request);
      
      const { data: profileData, error: profileQueryError } =
        await supabaseMiddlewareClient
          .from("profiles")
          .select("is_extended_profile_complete")
          .eq("id", user.id)
        .single();

      if (profileQueryError || !profileData) {
        const completeProfileUrl = new URL(
          `/${currentLocale}/complete-profile`,
          request.url
        );
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      if (!profileData.is_extended_profile_complete) {
        const completeProfileUrl = new URL(
          `/${currentLocale}/complete-profile`,
          request.url
        );
        const redirectResponse = NextResponse.redirect(completeProfileUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      
      const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
      const redirectResponse = NextResponse.redirect(profileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    } catch {
      const completeProfileUrl = new URL(
        `/${currentLocale}/complete-profile`,
        request.url
      );
      const redirectResponse = NextResponse.redirect(completeProfileUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
  }

  if (pathWithoutLocale === "/admin/redirect") {
    if (!user) {
      const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }

    if (!user.email_confirmed_at) {
      const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }

    try {
      const supabaseMiddlewareClient = createMiddlewareClient(request);

      // First, check if the user has a record in profiles
      const { data: profileData, error: profileQueryError } =
        await supabaseMiddlewareClient
          .from("profiles")
          .select("user_type, is_extended_profile_complete")
          .eq("id", user.id)
          .single();

      if (profileQueryError || !profileData) {
        const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }

      if (profileData.user_type !== "admin") {
        await supabaseMiddlewareClient.auth.signOut();
        const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }

      // Check if the admin profile exists
      const { data: adminProfileData } = 
        await supabaseMiddlewareClient
          .from("admin_profiles")
          .select("name")
          .eq("profile_id", user.id)
          .maybeSingle();

      // If no admin profile or incomplete profile, direct to create-account
      // This ensures invited admins set up their account properly
      if (!profileData.is_extended_profile_complete || 
          !adminProfileData || 
          !adminProfileData.name) {
        const createAccountUrl = new URL(
          `/${currentLocale}/admin/create-account`,
          request.url
        );
        const redirectResponse = NextResponse.redirect(createAccountUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }

      const dashboardUrl = new URL(
        `/${currentLocale}/admin/dashboard`,
        request.url
      );
      const redirectResponse = NextResponse.redirect(dashboardUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    } catch (error) {
      console.error("Error in admin redirect middleware:", error);
      const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
  }
  
  if (!user) {
    const isAllowedUnauthenticatedPath =
      UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
    if (!isAllowedUnauthenticatedPath) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    return supabaseResponseAfterSessionUpdate;
  }

  if (pathWithoutLocale === "/login" || pathWithoutLocale === "/register") {
    const redirectUrl = new URL(`/${currentLocale}/redirect`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
    return redirectResponse;
  }
  
  if (!user.email_confirmed_at) {
    const confirmEmailAppPath = `/${currentLocale}/confirm-email`;
    
    if (
      request.nextUrl.pathname !== confirmEmailAppPath &&
      pathWithoutLocale !== "/auth/confirm"
    ) {
      const redirectResponse = NextResponse.redirect(
        new URL(confirmEmailAppPath, request.url)
      );
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    return supabaseResponseAfterSessionUpdate;
  }
  
  const supabaseMiddlewareClient = createMiddlewareClient(request);

  try {
    const { data: profileData, error: profileQueryError } =
      await supabaseMiddlewareClient
        .from("profiles")
        .select("is_extended_profile_complete")
        .eq("id", user.id)
      .single();

    const completeProfileAppPath = `/${currentLocale}/complete-profile`;
    const defaultProfileRedirectUrl = new URL(
      `/${currentLocale}/profile`,
      request.url
    );
    
    if (profileQueryError) {
      if (pathWithoutLocale !== "/complete-profile") {
        const redirectResponse = NextResponse.redirect(
          new URL(completeProfileAppPath, request.url)
        );
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }
    
    if (!profileData) {
      if (pathWithoutLocale !== "/complete-profile") {
        const redirectResponse = NextResponse.redirect(
          new URL(completeProfileAppPath, request.url)
        );
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }
    
    if (!profileData.is_extended_profile_complete) {
      const isAllowedDuringProfileCompletion =
        PROFILE_COMPLETION_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
      if (!isAllowedDuringProfileCompletion) {
        const redirectResponse = NextResponse.redirect(
          new URL(completeProfileAppPath, request.url)
        );
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
      return supabaseResponseAfterSessionUpdate;
    }

    if (pathWithoutLocale === "/complete-profile") {
      const redirectResponse = NextResponse.redirect(defaultProfileRedirectUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }
    
    // Admin login/register should redirect to admin redirect if user is already authenticated
    if (pathWithoutLocale === "/admin/login" && user) {
      const redirectUrl = new URL(
        `/${currentLocale}/admin/redirect`,
        request.url
      );
      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
      return redirectResponse;
    }

    // Check if user is trying to access admin paths but is not an admin
    if (user && pathWithoutLocale.startsWith('/admin/') && 
        !UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale)) {
      try {
        const supabaseMiddlewareClient = createMiddlewareClient(request);
        
        // Since we've checked that user is not null above, we can use non-null assertion (!) here
        const { data: profileData } = await supabaseMiddlewareClient
          .from('profiles')
          .select('user_type')
          .eq('id', user!.id)
          .single();

        // Handle the profileData potentially being null with proper type checking
        if (!profileData || ((profileData as { user_type?: string })?.user_type !== 'admin')) {
          // Not an admin, redirect to regular profile
          const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
          const redirectResponse = NextResponse.redirect(profileUrl);
          copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
          return redirectResponse;
        }
      } catch {
        // Error checking admin status, redirect to login for safety
        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);
        copyAllCookies(supabaseResponseAfterSessionUpdate, redirectResponse);
        return redirectResponse;
      }
    }
    
    // Apply subscription guards for premium routes
    // This should run after authentication checks but before returning the final response
    if (user && user.email_confirmed_at) {      // Configure subscription-protected routes
      const subscriptionGuardsConfig = [
        // Premium features routes
        {
          pathPattern: /^\/[a-z]{2}\/premium-features.*/,
          restriction: SubscriptionRestriction.REQUIRE_PAID
        },
        // Researcher-specific premium routes
        {
          pathPattern: /^\/[a-z]{2}\/researcher\/advanced.*/,
          restriction: SubscriptionRestriction.REQUIRE_RESEARCHER
        },
        // Organizer-specific premium routes
        {
          pathPattern: /^\/[a-z]{2}\/organizer\/manage.*/,
          restriction: SubscriptionRestriction.REQUIRE_ORGANIZER
        },
        // Routes that also accept trial subscriptions
        {
          pathPattern: /^\/[a-z]{2}\/trial-features.*/,
          restriction: SubscriptionRestriction.ACCEPT_TRIAL
        },
        // Event creation - requires organizer subscription (paid or trial)
        {
          pathPattern: /^\/[a-z]{2}\/events\/create.*/,
          restriction: SubscriptionRestriction.ACCEPT_TRIAL
        },
        // Event management - requires organizer subscription (paid or trial)
        {
          pathPattern: /^\/[a-z]{2}\/events\/manage.*/,
          restriction: SubscriptionRestriction.ACCEPT_TRIAL
        },
        // Event editing - requires organizer subscription (paid or trial)
        {
          pathPattern: /^\/[a-z]{2}\/events\/[a-zA-Z0-9-_]+\/edit.*/,
          restriction: SubscriptionRestriction.ACCEPT_TRIAL
        }
      ];
      
      // Apply subscription guards
      const guardedResponse = await applySubscriptionGuard(
        request, 
        supabaseResponseAfterSessionUpdate, 
        subscriptionGuardsConfig
      );
      
      // If a route matched and was guarded, return that response
      if (guardedResponse) {
        return guardedResponse;
      }
    }
    
    return supabaseResponseAfterSessionUpdate;
  } catch {
    return supabaseResponseAfterSessionUpdate;
  }
}

function copyAllCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
  });
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz|robots.txt).*).",
  ],
}; 
