'use client';

import { 
  Sidebar,
  SidebarItem,
  SidebarItemGroup
} from 'flowbite-react';
import { 
  HiChartPie, 
  HiUsers, 
  HiCurrencyDollar, 
  HiDocumentDuplicate, 
  HiCollection, 
  HiTag, 
  HiTemplate, 
  HiMail, 
  HiLogout,
  HiShieldCheck,
  HiUser,
  HiUserGroup
} from 'react-icons/hi';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Props for the AdminSidebar component
 */
interface AdminSidebarProps {
  /** Translations for sidebar menu items */
  translations: {
    dashboard: string;
    users: string;
    admins: string;
    payments: string;
    events: string;
    submissions: string;
    topics: string;
    emailTemplates: string;
    emailLogs: string;
    logout: string;
    verifications: string;
  };
  /** Current locale for link generation */
  locale: string;
  /** Admin name to display at top of sidebar */
  adminName?: string;
}

/**
 * Admin sidebar navigation component
 * Provides navigation to all admin sections with appropriate icons
 * Supports RTL layouts and responsive design
 * 
 * @param props - Component props
 * @returns Admin sidebar component
 */
export default function AdminSidebar({ translations, locale, adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Generate URLs with locale
  const addLocaleToPath = (path: string) => `/${locale}/admin${path}`;

  // Helper function to check if the current path matches a given route
  const isActive = (route: string): boolean => {
    const fullPathForMatching = `/${locale}/admin${route}`;
    // Check if the current path starts with the route (to handle nested routes)
    return pathname === fullPathForMatching || pathname?.startsWith(`${fullPathForMatching}/`);
  };
  
  // Handle logout action
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    // Redirect to the server-side logout handler
    router.push(`/${locale}/admin/logout`);
  };
  
  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="fixed top-16 left-0 bottom-0 z-40 w-64 transition-transform -translate-x-full rtl:translate-x-full rtl:right-0 rtl:left-auto md:translate-x-0 md:block bg-white border-r rtl:border-l rtl:border-r-0 border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-y-auto"
      aria-label="Admin sidebar"
    >
      <Sidebar className="w-full border-none pt-2" aria-label="Admin sidebar">
        <SidebarItemGroup>
          {/* Admin profile section - non-clickable */}
          {adminName && (
            <div className="flex items-center px-3 py-2 text-base font-normal text-gray-900 rounded-lg dark:text-white mb-2 border-b border-gray-200 dark:border-gray-700">
              <HiUser className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400" />
              <span className="flex-1 ms-3 whitespace-nowrap rtl:text-right">{adminName}</span>
            </div>
          )}
          
          <SidebarItem 
            href={addLocaleToPath('/dashboard')} 
            icon={HiChartPie}
            active={isActive('/dashboard')}
            className="rtl:text-right"
          >
            {translations.dashboard}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/users')}
            icon={HiUsers}
            active={isActive('/users')}
            className="rtl:text-right"
          >
            {translations.users}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/admins')}
            icon={HiUserGroup}
            active={isActive('/admins')}
            className="rtl:text-right"
          >
            {translations.admins}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/verifications')}
            icon={HiShieldCheck}
            active={isActive('/verifications')}
            className="rtl:text-right"
          >
            {translations.verifications}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/payments')}
            icon={HiCurrencyDollar}
            active={isActive('/payments')}
            className="rtl:text-right"
          >
            {translations.payments}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/events')}
            icon={HiCollection}
            active={isActive('/events')}
            className="rtl:text-right"
          >
            {translations.events}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/submissions')}
            icon={HiDocumentDuplicate}
            active={isActive('/submissions')}
            className="rtl:text-right"
          >
            {translations.submissions}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/topics')}
            icon={HiTag}
            active={isActive('/topics')}
            className="rtl:text-right"
          >
            {translations.topics}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/email-templates')}
            icon={HiTemplate}
            active={isActive('/email-templates')}
            className="rtl:text-right"
          >
            {translations.emailTemplates}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/email-logs')}
            icon={HiMail}
            active={isActive('/email-logs')}
            className="rtl:text-right"
          >
            {translations.emailLogs}
          </SidebarItem>
          
          <SidebarItem 
            href={addLocaleToPath('/logout')}
            icon={HiLogout}
            onClick={handleLogout}
            className={`rtl:text-right ${isLoggingOut ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {translations.logout}
          </SidebarItem>
        </SidebarItemGroup>
      </Sidebar>
    </aside>
  );
} 