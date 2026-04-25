import { type NextRequest, NextResponse } from "next/server";
import { type User } from "@supabase/supabase-js";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";
import { createRedirect } from "./urlPatterns";

/**
 * Handles the /admin/redirect route for admin users
 * Checks admin status, email confirmation, and profile completion
 */
export async function handleAdminRedirect(
    request: NextRequest,
    sourceResponse: NextResponse,
    user: User | null,
    currentLocale: string
): Promise<NextResponse> {
    const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url);

    // No user - redirect to admin login
    if (!user) {
        return createRedirect(loginUrl, sourceResponse);
    }

    // Email not confirmed - redirect to admin login
    if (!user.email_confirmed_at) {
        return createRedirect(loginUrl, sourceResponse);
    }

    try {
        const supabaseMiddlewareClient = createMiddlewareClient(request);

        // Check if user has a profile
        const { data: profileData, error: profileQueryError } =
            await supabaseMiddlewareClient
                .from("profiles")
                .select("user_type, is_extended_profile_complete")
                .eq("id", user.id)
                .single();

        if (profileQueryError || !profileData) {
            return createRedirect(loginUrl, sourceResponse);
        }

        // Not an admin - sign out and redirect
        if (profileData.user_type !== "admin") {
            await supabaseMiddlewareClient.auth.signOut();
            return createRedirect(loginUrl, sourceResponse);
        }

        // Check admin profile exists
        const { data: adminProfileData } =
            await supabaseMiddlewareClient
                .from("admin_profiles")
                .select("name")
                .eq("profile_id", user.id)
                .maybeSingle();

        // Incomplete admin profile - redirect to create account
        if (!profileData.is_extended_profile_complete ||
            !adminProfileData ||
            !adminProfileData.name) {
            const createAccountUrl = new URL(
                `/${currentLocale}/admin/create-account`,
                request.url
            );
            return createRedirect(createAccountUrl, sourceResponse);
        }

        // All checks passed - redirect to dashboard
        const dashboardUrl = new URL(
            `/${currentLocale}/admin/dashboard`,
            request.url
        );
        return createRedirect(dashboardUrl, sourceResponse);
    } catch {
        // Error - redirect to login for safety
        return createRedirect(loginUrl, sourceResponse);
    }
}
