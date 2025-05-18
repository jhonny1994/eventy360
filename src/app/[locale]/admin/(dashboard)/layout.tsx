import React from "react";
import { getTranslations } from "next-intl/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Get translations using the locale from params
  const t = await getTranslations("AdminDashboard.Layout");

  // Initialize Supabase client using the SSR client
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;

  // Fetch admin profile
  let adminName = "Admin"; // Default fallback
  if (userId) {
    const { data: adminProfile, error } = await supabase
      .from("admin_profiles")
      .select("name")
      .eq("profile_id", userId)
      .single();

    if (adminProfile && !error) {
      adminName = adminProfile.name;
    }
  }

  const sidebarTranslations = {
    dashboard: t("sidebar.dashboard"),
    users: t("sidebar.users"),
    payments: t("sidebar.payments"),
    events: t("sidebar.events"),
    submissions: t("sidebar.submissions"),
    topics: t("sidebar.topics"),
    emailTemplates: t("sidebar.emailTemplates"),
    emailLogs: t("sidebar.emailLogs"),
    logout: t("sidebar.logout"),
    verifications: t("sidebar.verifications"),
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navbar */}
      <AdminNavbar
        siteName={t("siteName")}
        locale={locale}
        adminName={adminName}
      />

      {/* Sidebar with Flowbite Sidebar component */}
      <div className="flex flex-1 pt-16">
        <AdminSidebar translations={sidebarTranslations} locale={locale} />

        {/* Main content area */}
        <div className="p-4 sm:mr-64 flex-1 overflow-y-auto">
          <div className="p-4 rounded-lg mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
