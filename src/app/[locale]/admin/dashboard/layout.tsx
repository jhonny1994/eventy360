import React from 'react';
import { getTranslations } from 'next-intl/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import type { Database } from '@/database.types';

export default async function AdminDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Get translations using the locale from params
  const t = await getTranslations('AdminDashboard.Layout');
  
  // Get the locale after translations to ensure params is resolved
  const locale = params.locale;
  
  // Initialize Supabase client with awaited cookies
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // Get authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id;
  
  // Fetch admin profile
  let adminName = 'Admin'; // Default fallback
  if (userId) {
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('name')
      .eq('profile_id', userId)
      .single();
    
    if (adminProfile?.name) {
      adminName = adminProfile.name;
    }
  }

  const sidebarTranslations = {
    dashboard: t('sidebar.dashboard'),
    users: t('sidebar.users'),
    payments: t('sidebar.payments'),
    events: t('sidebar.events'),
    submissions: t('sidebar.submissions'),
    topics: t('sidebar.topics'),
    emailTemplates: t('sidebar.emailTemplates'),
    emailLogs: t('sidebar.emailLogs'),
    logout: t('sidebar.logout')
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navbar */}
      <AdminNavbar 
        siteName={t('siteName')}
        locale={locale}
        adminName={adminName}
      />

      {/* Sidebar with Flowbite Sidebar component */}
      <div className="flex flex-1 pt-16">
        <AdminSidebar translations={sidebarTranslations} locale={locale} />

        {/* Main content area */}
        <div className="p-4 sm:mr-64 flex-1 overflow-y-auto">
          <div className="p-4 rounded-lg mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 