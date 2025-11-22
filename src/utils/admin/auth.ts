/**
 * Utility functions for admin authentication and access control
 */
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Middleware to require admin authentication for protected routes
 * Redirects to login if user is not authenticated or not an admin
 *
 * @param locale - Current locale for internationalization
 * @returns The authenticated admin user object
 */
export async function requireAdmin(locale: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    // Log the user out first since they're not an admin
    await supabase.auth.signOut();
    redirect(`/${locale}/admin/login`);
  }

  return user;
}

/**
 * Get current admin profile with name
 *
 * @param userId - The admin user ID
 * @returns Admin profile data with name
 */
export async function getAdminProfile(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("name")
    .eq("profile_id", userId)
    .single();

  return {
    id: userId,
    name: adminProfile!.name,
  };
}
