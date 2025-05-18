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
  // Generate URLs without the route group name
  const addLocaleToPath = (path: string) => `/${locale}/admin${path}`;

  // Helper function to check if the current path matches a given route
  const isActive = (route: string): boolean => {
    const fullPathForMatching = `/${locale}/admin${route}`;
    // Check if the current path starts with the route (to handle nested routes)
    return pathname === fullPathForMatching || pathname.startsWith(`${fullPathForMatching}/`);
  };
  
  return (
    <Sidebar 
      aria-label="Admin Sidebar" 
      id="admin-sidebar"
      className="fixed top-0 right-0 z-40 h-screen pt-20 w-64 transition-transform border-l border-gray-200 dark:border-gray-700 translate-x-full sm:translate-x-0"
    >
      <SidebarItemGroup>
        <SidebarItem 
          href={addLocaleToPath('/dashboard')} 
          icon={HiChartPie}
          active={isActive('/dashboard')}
        >
          {translations.dashboard}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/users')}
          icon={HiUsers}
          active={isActive('/users')}
        >
          {translations.users}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/verifications')}
          icon={HiShieldCheck}
          active={isActive('/verifications')}
        >
          {translations.verifications}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/payments')}
          icon={HiCash}
          active={isActive('/payments')}
        >
          {translations.payments}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/events')}
          icon={HiCollection}
          active={isActive('/events')}
        >
          {translations.events}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/submissions')}
          icon={HiDocumentText}
          active={isActive('/submissions')}
        >
          {translations.submissions}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/topics')}
          icon={HiTag}
          active={isActive('/topics')}
        >
          {translations.topics}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/email-templates')}
          icon={HiMail}
          active={isActive('/email-templates')}
        >
          {translations.emailTemplates}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/email-logs')}
          icon={HiClipboardList}
          active={isActive('/email-logs')}
        >
          {translations.emailLogs}
        </SidebarItem>
        <SidebarItem 
          href={`/${locale}/logout`}
          icon={HiLogout}
          active={isActive('/logout')}
        >
          {translations.logout}
        </SidebarItem>
      </SidebarItemGroup>
    </Sidebar>
  );
} 