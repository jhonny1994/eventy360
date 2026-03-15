import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server-side admin logout handler
 * 
 * This component:
 * 1. Uses server-side Supabase client to ensure proper token handling
 * 2. Signs out the user from Supabase auth
 * 3. Redirects to the login page with the correct locale
 * 4. Runs on the server side to avoid client-side auth state conflicts
 * 
 * @param params - Parameters from the dynamic route including locale
 * @returns Nothing - redirects to login page
 */
export default async function LogoutPage({ params }: { params: Promise<{ locale: string }> }) {
  // Extract locale parameter first
  const { locale } = await params;

  try {
    // Create server-side Supabase client for secure operations
    const supabase = await createServerSupabaseClient();

    // Sign the user out, clearing auth cookies and session
    await supabase.auth.signOut();

    // Use the Next.js redirect function to redirect to login page
    // This preserves the locale in the URL
  } catch {
    // Even if there's an error, redirect to login page
  }

  // Always redirect to login page as the final action
  redirect(`/${locale}/admin/login`);
} 