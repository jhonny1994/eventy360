'use client';

import { 
  Sidebar,
  SidebarItem,
  SidebarItemGroup
} from 'flowbite-react';
import { 
  HiChartPie, 
  HiUsers, 
  HiCash, 
  HiDocumentText, 
  HiCollection, 
  HiTag, 
  HiMail, 
  HiClipboardList, 
  HiLogout,
  HiShieldCheck 
} from 'react-icons/hi';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  translations: {
    dashboard: string;
    users: string;
    payments: string;
    events: string;
    submissions: string;
    topics: string;
    emailTemplates: string;
    emailLogs: string;
    logout: string;
    verifications: string;
  };
  locale: string;
}

export default function AdminSidebar({ translations, locale }: AdminSidebarProps) {
  const pathname = usePathname();
  const addLocaleToPath = (path: string) => `/${locale}${path}`;

  // Helper function to check if the current path matches a given route
  const isActive = (route: string): boolean => {
    const fullPath = addLocaleToPath(route);
    // Check if the current path starts with the route (to handle nested routes)
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };
  
  return (
    <Sidebar 
      aria-label="Admin Sidebar" 
      id="admin-sidebar"
      className="fixed top-0 right-0 z-40 h-screen pt-20 w-64 transition-transform border-l border-gray-200 dark:border-gray-700 translate-x-full sm:translate-x-0"
    >
      <SidebarItemGroup>
        <SidebarItem 
          href={addLocaleToPath('/admin/dashboard')} 
          icon={HiChartPie}
          active={isActive('/admin/dashboard')}
        >
          {translations.dashboard}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/users')}
          icon={HiUsers}
          active={isActive('/admin/users')}
        >
          {translations.users}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/verifications')}
          icon={HiShieldCheck}
          active={isActive('/admin/verifications')}
        >
          {translations.verifications}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/payments')}
          icon={HiCash}
          active={isActive('/admin/payments')}
        >
          {translations.payments}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/events')}
          icon={HiCollection}
          active={isActive('/admin/events')}
        >
          {translations.events}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/submissions')}
          icon={HiDocumentText}
          active={isActive('/admin/submissions')}
        >
          {translations.submissions}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/topics')}
          icon={HiTag}
          active={isActive('/admin/topics')}
        >
          {translations.topics}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/email-templates')}
          icon={HiMail}
          active={isActive('/admin/email-templates')}
        >
          {translations.emailTemplates}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/email-logs')}
          icon={HiClipboardList}
          active={isActive('/admin/email-logs')}
        >
          {translations.emailLogs}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/logout')}
          icon={HiLogout}
          active={isActive('/logout')}
        >
          {translations.logout}
        </SidebarItem>
      </SidebarItemGroup>
    </Sidebar>
  );
} 