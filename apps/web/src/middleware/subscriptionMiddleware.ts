import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware-client';
import { routing } from '@/i18n/routing';
import type { UserSubscriptionData } from '@/hooks/useSubscription';
import { type CookieOptions } from "@supabase/ssr";

/**
 * Utility function to copy all cookies from source response to destination response
 */
function copyAllCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, cookie as CookieOptions);
  });
}

/**
 * Types of restrictions for subscription-protected routes
 */
export enum SubscriptionRestriction {
  /** Requires any active paid subscription (paid_researcher or paid_organizer) */
  REQUIRE_PAID = 'require_paid',
  /** Requires an active paid researcher subscription specifically */
  REQUIRE_RESEARCHER = 'require_researcher',
  /** Requires an active paid organizer subscription specifically */
  REQUIRE_ORGANIZER = 'require_organizer',
  /** Accepts either an active paid subscription or an active trial */
  ACCEPT_TRIAL = 'accept_trial'
}

/**
 * Configuration for subscription middleware
 */
interface SubscriptionMiddlewareConfig {
  /** The type of subscription restriction to enforce */
  restriction: SubscriptionRestriction;
  /** Whether to redirect on failure (true) or just modify the request for client handling (false) */
  redirectOnFailure?: boolean;
  /** Custom redirect path if redirectOnFailure is true */
  redirectPath?: string;
}

/**
 * Middleware that checks if a user has the required subscription to access a route
 * 
 * @param request - The incoming request
 * @param response - The current response
 * @param config - Subscription middleware configuration
 * @returns Modified response with subscription check
 */
export async function subscriptionMiddleware(
  request: NextRequest,
  response: NextResponse,
  config: SubscriptionMiddlewareConfig
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Extract locale information
  const localePattern = new RegExp(`^/(${routing.locales.join("|")})(.*)`);
  const pathMatch = pathname.match(localePattern);
  const currentLocale = pathMatch ? pathMatch[1] : routing.defaultLocale;

  // Create middleware client using the singleton pattern
  const supabaseMiddlewareClient = createMiddlewareClient(request);

  // Get user session
  const { data: { user } } = await supabaseMiddlewareClient.auth.getUser();

  if (!user) {
    // If no user, redirect to login
    if (config.redirectOnFailure !== false) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyAllCookies(response, redirectResponse);
      return redirectResponse;
    }

    // Add header for client-side handling
    return NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-subscription-check': 'failed-no-user'
        })
      }
    });
  }

  try {
    // Get subscription details using RPC function
    const { data: subscriptionData, error: subscriptionError } =
      await supabaseMiddlewareClient.rpc('get_subscription_details') as
      { data: UserSubscriptionData | null, error: Error | null };

    if (subscriptionError || !subscriptionData) {

      // Handle subscription query error
      if (config.redirectOnFailure !== false) {
        const redirectPath = config.redirectPath || `/${currentLocale}/profile?tab=subscription`;
        const redirectUrl = new URL(redirectPath, request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        copyAllCookies(response, redirectResponse);
        return redirectResponse;
      }

      return NextResponse.next({
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            'x-subscription-check': 'failed-error'
          })
        }
      });
    }

    // Check if user has required subscription
    let hasRequiredSubscription = false;

    if (subscriptionData.has_subscription && subscriptionData.subscription?.is_active) {
      const { tier, status } = subscriptionData.subscription;

      switch (config.restriction) {
        case SubscriptionRestriction.REQUIRE_PAID:
          hasRequiredSubscription =
            ['paid_researcher', 'paid_organizer'].includes(tier) && status === 'active';
          break;

        case SubscriptionRestriction.REQUIRE_RESEARCHER:
          hasRequiredSubscription = tier === 'paid_researcher' && status === 'active';
          break;

        case SubscriptionRestriction.REQUIRE_ORGANIZER:
          hasRequiredSubscription = tier === 'paid_organizer' && status === 'active';
          break;

        case SubscriptionRestriction.ACCEPT_TRIAL:
          hasRequiredSubscription =
            (['paid_researcher', 'paid_organizer'].includes(tier) && status === 'active') ||
            (status === 'trial');
          break;

        default:
          hasRequiredSubscription = false;
      }
    }

    if (!hasRequiredSubscription) {
      // User does not have required subscription
      if (config.redirectOnFailure !== false) {
        const redirectPath = config.redirectPath || `/${currentLocale}/profile?tab=subscription`;
        const redirectUrl = new URL(redirectPath, request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        copyAllCookies(response, redirectResponse);
        return redirectResponse;
      }

      // Add header for client-side handling
      return NextResponse.next({
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            'x-subscription-check': 'failed-insufficient'
          })
        }
      });
    }

    // User has required subscription, continue
    return NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-subscription-check': 'passed'
        })
      }
    });

  } catch {
    // Subscription middleware error - redirect to subscription page

    // Handle unexpected errors
    if (config.redirectOnFailure !== false) {
      const redirectPath = config.redirectPath || `/${currentLocale}/profile?tab=subscription`;
      const redirectUrl = new URL(redirectPath, request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyAllCookies(response, redirectResponse);
      return redirectResponse;
    }

    return NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers),
          'x-subscription-check': 'failed-unknown'
        })
      }
    });
  }
} 