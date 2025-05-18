import React from "react";
import { getTranslations } from "next-intl/server";
import { AdminNavbar, AdminSidebar } from "@/components/admin";
import { requireAdmin, getAdminProfile } from "@/utils/admin/auth";

/**
 * Layout component for admin dashboard section
 * Includes sidebar navigation and navbar
 * Enforces admin authentication
 *
 * @param props - Component props including children and locale
 * @returns Layout component with navbar, sidebar and main content area
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Ensure the user is authenticated and has admin rights
  const user = await requireAdmin(locale);

  // Get translations using the locale from params
  const t = await getTranslations("AdminDashboard.Layout");

  // Fetch admin profile with name
  const adminProfile = await getAdminProfile(user.id);

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
      />

      {/* Sidebar and main content */}
      <div className="flex flex-1 pt-16">
        <AdminSidebar 
          translations={sidebarTranslations} 
          locale={locale} 
          adminName={adminProfile.name}
        />

        {/* Main content area */}
        <div className="p-4 md:ms-64 flex-1 overflow-y-auto">
          <div className="p-4 rounded-lg mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
