import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { applySubscriptionGuard } from "@/middleware/applySubscriptionGuard";
import { SubscriptionRestriction } from "@/middleware/subscriptionMiddleware";
import {
  AUTH_SYSTEM_PATHS,
  extractPathInfo,
  handleUrlRedirects
} from "@/middleware/urlPatterns";
import { handleUserRedirect } from "@/middleware/userRedirect";
import { handleAdminRedirect } from "@/middleware/adminRedirect";
import {
  guardUnauthenticated,
  redirectFromAuthPages,
  guardEmailConfirmation,
  guardProfileCompletion,
  guardAdminRoutes
} from "@/middleware/authGuards";

const handleI18nRouting = createIntlMiddleware(routing);

/**
 * Main middleware entry point
 * Orchestrates modular auth, routing, and subscription checks
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle i18n and session
  const i18nResponse = handleI18nRouting(request);
  const { response: sessionResponse, user } = await updateSession(request, i18nResponse);

  // 2. Extract path info
  const { pathWithoutLocale, currentLocale } = extractPathInfo(pathname);

  // 3. Handle URL redirects (submissions -> manage)
  const urlRedirect = handleUrlRedirects(request, sessionResponse);
  if (urlRedirect) return urlRedirect;

  // 4. Allow auth system paths
  if (AUTH_SYSTEM_PATHS.includes(pathWithoutLocale)) {
    return sessionResponse;
  }

  // 5. Handle /redirect route
  if (pathWithoutLocale === "/redirect") {
    return handleUserRedirect(request, sessionResponse, user, currentLocale);
  }

  // 6. Handle /admin/redirect route
  if (pathWithoutLocale === "/admin/redirect") {
    return handleAdminRedirect(request, sessionResponse, user, currentLocale);
  }

  // 7. Guard unauthenticated users
  if (!user) {
    const guard = guardUnauthenticated(request, sessionResponse, pathWithoutLocale, currentLocale);
    return guard ?? sessionResponse;
  }

  // 8. Redirect from login/register if authenticated
  const authPageRedirect = redirectFromAuthPages(request, sessionResponse, pathWithoutLocale, currentLocale);
  if (authPageRedirect) return authPageRedirect;

  // 9. Guard email confirmation
  const emailGuard = guardEmailConfirmation(request, sessionResponse, user, pathWithoutLocale, currentLocale);
  if (emailGuard) return emailGuard;
  if (!user.email_confirmed_at) return sessionResponse;

  // 10. Guard profile completion
  const profileResponse = await guardProfileCompletion(
    request, sessionResponse, user, pathWithoutLocale, currentLocale
  );
  // If redirected, return that response
  if (profileResponse !== sessionResponse) return profileResponse;

  // 11. Guard admin routes
  const adminGuard = await guardAdminRoutes(
    request, sessionResponse, user, pathWithoutLocale, currentLocale
  );
  if (adminGuard) return adminGuard;

  // 12. Apply subscription guards for premium routes
  if (user.email_confirmed_at) {
    const subscriptionGuardsConfig = [
      { pathPattern: /^\/[a-z]{2}\/premium-features.*/, restriction: SubscriptionRestriction.REQUIRE_PAID },
      { pathPattern: /^\/[a-z]{2}\/researcher\/advanced.*/, restriction: SubscriptionRestriction.REQUIRE_RESEARCHER },
      { pathPattern: /^\/[a-z]{2}\/organizer\/manage.*/, restriction: SubscriptionRestriction.REQUIRE_ORGANIZER },
      { pathPattern: /^\/[a-z]{2}\/trial-features.*/, restriction: SubscriptionRestriction.ACCEPT_TRIAL },
      { pathPattern: /^\/[a-z]{2}\/events\/create.*/, restriction: SubscriptionRestriction.ACCEPT_TRIAL },
      { pathPattern: /^\/[a-z]{2}\/events\/manage.*/, restriction: SubscriptionRestriction.ACCEPT_TRIAL },
      { pathPattern: /^\/[a-z]{2}\/events\/[a-zA-Z0-9-_]+\/edit.*/, restriction: SubscriptionRestriction.ACCEPT_TRIAL }
    ];

    const guardedResponse = await applySubscriptionGuard(request, sessionResponse, subscriptionGuardsConfig);
    if (guardedResponse) return guardedResponse;
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|healthz|readyz|robots.txt|illustrations|png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|webmanifest)$).*)",
  ],
};
