import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";
import {
    UNAUTHENTICATED_USER_ACCESSIBLE_PATHS,
    PROFILE_COMPLETION_ACCESSIBLE_PATHS,
    createRedirect
} from "./urlPatterns";

/**
 * Guards for unauthenticated users
 * Returns redirect response if user needs to login, null to continue
 */
export function guardUnauthenticated(
    request: NextRequest,
    sourceResponse: NextResponse,
    pathWithoutLocale: string,
    currentLocale: string
): NextResponse | null {
    const isAllowedUnauthenticatedPath =
        UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale);

    if (!isAllowedUnauthenticatedPath) {
        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        return createRedirect(loginUrl, sourceResponse);
    }

    return null; // Allow access
}

/**
 * Redirects authenticated users away from login/register pages
 */
export function redirectFromAuthPages(
    request: NextRequest,
    sourceResponse: NextResponse,
    pathWithoutLocale: string,
    currentLocale: string
): NextResponse | null {
    if (pathWithoutLocale === "/login" || pathWithoutLocale === "/register") {
        const redirectUrl = new URL(`/${currentLocale}/redirect`, request.url);
        return createRedirect(redirectUrl, sourceResponse);
    }
    return null;
}

/**
 * Guards for email confirmation
 * Redirects to confirm-email if email not yet confirmed
 */
export function guardEmailConfirmation(
    request: NextRequest,
    sourceResponse: NextResponse,
    user: User,
    pathWithoutLocale: string,
    currentLocale: string
): NextResponse | null {
    if (!user.email_confirmed_at) {
        const confirmEmailAppPath = `/${currentLocale}/confirm-email`;

        if (
            request.nextUrl.pathname !== confirmEmailAppPath &&
            pathWithoutLocale !== "/auth/confirm"
        ) {
            return createRedirect(
                new URL(confirmEmailAppPath, request.url),
                sourceResponse
            );
        }
    }
    return null;
}

/**
 * Guards for profile completion status
 * Returns redirect response or source response based on profile state
 */
export async function guardProfileCompletion(
    request: NextRequest,
    sourceResponse: NextResponse,
    user: User,
    pathWithoutLocale: string,
    currentLocale: string
): Promise<NextResponse> {
    const supabaseMiddlewareClient = createMiddlewareClient(request);
    const completeProfileAppPath = `/${currentLocale}/complete-profile`;
    const defaultProfileRedirectUrl = new URL(
        `/${currentLocale}/profile`,
        request.url
    );

    try {
        const { data: profileData, error: profileQueryError } =
            await supabaseMiddlewareClient
                .from("profiles")
                .select("is_extended_profile_complete")
                .eq("id", user.id)
                .single();

        // Error or no profile - redirect to complete profile
        if (profileQueryError || !profileData) {
            if (pathWithoutLocale !== "/complete-profile") {
                return createRedirect(
                    new URL(completeProfileAppPath, request.url),
                    sourceResponse
                );
            }
            return sourceResponse;
        }

        // Profile not complete - check if on allowed path
        if (!profileData.is_extended_profile_complete) {
            const isAllowedDuringProfileCompletion =
                PROFILE_COMPLETION_ACCESSIBLE_PATHS.includes(pathWithoutLocale);
            if (!isAllowedDuringProfileCompletion) {
                return createRedirect(
                    new URL(completeProfileAppPath, request.url),
                    sourceResponse
                );
            }
            return sourceResponse;
        }

        // Profile complete - redirect away from complete-profile page
        if (pathWithoutLocale === "/complete-profile") {
            return createRedirect(defaultProfileRedirectUrl, sourceResponse);
        }

        return sourceResponse;
    } catch {
        return sourceResponse;
    }
}

/**
 * Guards admin routes - checks if user is admin
 * Returns redirect to profile if user is not admin
 */
export async function guardAdminRoutes(
    request: NextRequest,
    sourceResponse: NextResponse,
    user: User,
    pathWithoutLocale: string,
    currentLocale: string
): Promise<NextResponse | null> {
    // Admin login redirect for authenticated users
    if (pathWithoutLocale === "/admin/login") {
        const redirectUrl = new URL(
            `/${currentLocale}/admin/redirect`,
            request.url
        );
        return createRedirect(redirectUrl, sourceResponse);
    }

    // Check admin access for other admin paths
    if (pathWithoutLocale.startsWith('/admin/') &&
        !UNAUTHENTICATED_USER_ACCESSIBLE_PATHS.includes(pathWithoutLocale)) {
        try {
            const supabaseMiddlewareClient = createMiddlewareClient(request);

            const { data: profileData } = await supabaseMiddlewareClient
                .from('profiles')
                .select('user_type')
                .eq('id', user.id)
                .single();

            if (!profileData || ((profileData as { user_type?: string })?.user_type !== 'admin')) {
                const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
                return createRedirect(profileUrl, sourceResponse);
            }
        } catch {
            const loginUrl = new URL(`/${currentLocale}/login`, request.url);
            return createRedirect(loginUrl, sourceResponse);
        }
    }

    return null; // Continue to next guard
}
