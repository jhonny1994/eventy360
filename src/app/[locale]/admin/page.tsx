import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function AdminIndexPage({ params }: { params: { locale: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect unauthenticated users to login
    redirect(`/${params.locale}/admin/login`);
  }
  
  // Check if the user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    // User is authenticated but not an admin, sign them out and redirect to login
    await supabase.auth.signOut();
    redirect(`/${params.locale}/admin/login`);
  }
  
  // User is authenticated and is an admin, redirect to dashboard
  redirect(`/${params.locale}/admin/dashboard`);
} 