import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";
import { createRedirect } from "./urlPatterns";

/**
 * Handles the /redirect route for regular users
 * Checks email confirmation and profile completion status
 */
export async function handleUserRedirect(
    request: NextRequest,
    sourceResponse: NextResponse,
    user: User | null,
    currentLocale: string
): Promise<NextResponse> {
    // Check for email confirmation URL parameter
    const urlParams = new URL(request.url).searchParams;
    const authAction = urlParams.get('auth_action');
    const isEmailJustConfirmed = authAction === 'email_confirmed';

    // Let client-side handle email confirmation redirect
    if (isEmailJustConfirmed) {
        return sourceResponse;
    }

    // No user - redirect to login
    if (!user) {
        const loginUrl = new URL(`/${currentLocale}/login`, request.url);
        return createRedirect(loginUrl, sourceResponse);
    }

    // Email not confirmed - redirect to confirm email
    if (!user.email_confirmed_at) {
        const confirmEmailUrl = new URL(
            `/${currentLocale}/confirm-email`,
            request.url
        );
        return createRedirect(confirmEmailUrl, sourceResponse);
    }

    // Check profile completion status
    try {
        const supabaseMiddlewareClient = createMiddlewareClient(request);

        const { data: profileData, error: profileQueryError } =
            await supabaseMiddlewareClient
                .from("profiles")
                .select("is_extended_profile_complete")
                .eq("id", user.id)
                .single();

        // No profile or error - redirect to complete profile
        if (profileQueryError || !profileData) {
            const completeProfileUrl = new URL(
                `/${currentLocale}/complete-profile`,
                request.url
            );
            return createRedirect(completeProfileUrl, sourceResponse);
        }

        // Profile not complete - redirect to complete profile
        if (!profileData.is_extended_profile_complete) {
            const completeProfileUrl = new URL(
                `/${currentLocale}/complete-profile`,
                request.url
            );
            return createRedirect(completeProfileUrl, sourceResponse);
        }

        // All checks passed - redirect to profile
        const profileUrl = new URL(`/${currentLocale}/profile`, request.url);
        return createRedirect(profileUrl, sourceResponse);
    } catch {
        // Error - redirect to complete profile as safe fallback
        const completeProfileUrl = new URL(
            `/${currentLocale}/complete-profile`,
            request.url
        );
        return createRedirect(completeProfileUrl, sourceResponse);
    }
}
