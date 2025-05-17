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
  HiLogout 
} from 'react-icons/hi';

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
  };
  locale: string;
}

export default function AdminSidebar({ translations, locale }: AdminSidebarProps) {
  const addLocaleToPath = (path: string) => `/${locale}${path}`;
  
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
          active
        >
          {translations.dashboard}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/users')}
          icon={HiUsers}
        >
          {translations.users}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/payments')}
          icon={HiCash}
        >
          {translations.payments}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/events')}
          icon={HiCollection}
        >
          {translations.events}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/submissions')}
          icon={HiDocumentText}
        >
          {translations.submissions}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/topics')}
          icon={HiTag}
        >
          {translations.topics}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/email-templates')}
          icon={HiMail}
        >
          {translations.emailTemplates}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/admin/email-logs')}
          icon={HiClipboardList}
        >
          {translations.emailLogs}
        </SidebarItem>
        <SidebarItem 
          href={addLocaleToPath('/logout')}
          icon={HiLogout}
        >
          {translations.logout}
        </SidebarItem>
      </SidebarItemGroup>
    </Sidebar>
  );
} 