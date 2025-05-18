/**
 * Admin Authentication Navigation Utilities
 * Functions for handling redirects and navigation in admin auth flows
 */
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";

/**
 * Redirects authenticated admin users to dashboard
 * and non-admin users to login page
 * 
 * @param locale Current locale for internationalization
 */
export async function redirectAuthenticatedAdmin(locale: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return; // User is not authenticated, stay on current page
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type === "admin") {
    // User is authenticated and is an admin, redirect to dashboard
    redirect(`/${locale}/admin/dashboard`);
  } else {
    // User is authenticated but not an admin, sign them out and stay on page
    await supabase.auth.signOut();
  }
}

/**
 * Gets the redirect URL for admin authentication, defaulting to dashboard
 * 
 * @param locale Current locale for internationalization
 * @param defaultRedirect Default redirect path if none specified in URL
 * @returns The redirect URL to use after authentication
 */
export function getAdminRedirectUrl(locale: string, defaultRedirect = "/admin/dashboard") {
  if (typeof window === "undefined") {
    return `/${locale}${defaultRedirect}`; // Server-side default
  }

  // Client-side: check for redirect in URL params
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo");
  
  if (redirectTo && redirectTo.startsWith("/admin") && !redirectTo.includes("//")) {
    // Validate redirect is to admin area and doesn't contain double slashes
    return `/${locale}${redirectTo}`;
  }

  return `/${locale}${defaultRedirect}`;
}

/**
 * Builds URL search params for redirect
 * 
 * @param redirectPath Optional redirect path
 * @returns URLSearchParams object with redirectTo param if provided
 */
export function buildRedirectParams(redirectPath?: string) {
  if (!redirectPath) {
    return "";
  }
  
  const params = new URLSearchParams();
  params.set("redirectTo", redirectPath);
  return `?${params.toString()}`;
} 