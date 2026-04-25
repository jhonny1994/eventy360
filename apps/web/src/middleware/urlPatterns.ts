import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

/**
 * Path constants for middleware routing decisions
 */
export const AUTH_SYSTEM_PATHS = [
    "/auth/callback",
    "/auth/confirm",
    "/admin/auth/magic-callback",
    "/callback"
];

export const UNAUTHENTICATED_USER_ACCESSIBLE_PATHS = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/error",
    "/admin/login",
];

export const PROFILE_COMPLETION_ACCESSIBLE_PATHS = [
    "/complete-profile",
    "/confirm-email",
    "/admin/create-account",
];

/**
 * Extracts the path without locale prefix and determines current locale
 */
export function extractPathInfo(pathname: string): {
    pathWithoutLocale: string;
    currentLocale: string
} {
    let pathWithoutLocale = pathname;
    const localePattern = new RegExp(`^/(${routing.locales.join("|")})(.*)`);
    const pathMatch = pathname.match(localePattern);
    const currentLocale = pathMatch ? pathMatch[1] : routing.defaultLocale;

    if (pathMatch) {
        pathWithoutLocale = pathMatch[2] || "/";
    }
    if (!pathWithoutLocale.startsWith("/")) {
        pathWithoutLocale = "/" + pathWithoutLocale;
    }

    return { pathWithoutLocale, currentLocale };
}

/**
 * Creates a redirect response and copies cookies from source
 */
export function createRedirect(
    url: URL,
    sourceResponse: NextResponse
): NextResponse {
    const redirectResponse = NextResponse.redirect(url);
    copyAllCookies(sourceResponse, redirectResponse);
    return redirectResponse;
}

/**
 * Copies all cookies from source response to destination response
 */
export function copyAllCookies(source: NextResponse, destination: NextResponse) {
    source.cookies.getAll().forEach((cookie) => {
        destination.cookies.set(cookie.name, cookie.value, cookie);
    });
}

/**
 * Handles special URL pattern redirects (e.g., submissions to manage)
 * Returns response if redirect occurred, null otherwise
 */
export function handleUrlRedirects(
    request: NextRequest,
    sourceResponse: NextResponse
): NextResponse | null {
    const { pathname } = request.nextUrl;

    // Redirect submissions list to manage page
    const submissionsUrlPattern = new RegExp(
        `^/(${routing.locales.join("|")})/profile/events/([^/]+)/submissions$`
    );
    const submissionsMatch = pathname.match(submissionsUrlPattern);
    if (submissionsMatch) {
        const locale = submissionsMatch[1];
        const eventId = submissionsMatch[2];
        const redirectUrl = new URL(
            `/${locale}/profile/events/${eventId}/manage`,
            request.url
        );
        return createRedirect(redirectUrl, sourceResponse);
    }

    // Allow submission detail pages (not review pages)
    const submissionDetailPattern = new RegExp(
        `^/(${routing.locales.join("|")})/profile/events/([^/]+)/submissions/([^/]+)$`
    );
    const submissionDetailMatch = pathname.match(submissionDetailPattern);
    if (submissionDetailMatch && !pathname.includes('/review-')) {
        // Let page handle it - return source response
        return sourceResponse;
    }

    return null;
}
