'use client';

import { useState } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarToggle 
} from 'flowbite-react';

/**
 * Props for the AdminNavbar component
 */
interface AdminNavbarProps {
  /** Site name to display in the navbar */
  siteName: string;
  /** Current locale for internationalization */
  locale: string;
  /** Optional admin name to display in the navbar */
  adminName?: string;
}

/**
 * Admin dashboard navbar component with responsive design
 * Supports RTL layouts and integrates with the sidebar
 * 
 * @param props - Component props
 * @returns Admin navbar component
 */
export default function AdminNavbar({
  siteName,
  locale,
  adminName,
}: AdminNavbarProps) {
  // State to track sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle sidebar and update its CSS class
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // Update sidebar element's CSS class via DOM
    const sidebarElement = document.getElementById('sidebar-multi-level-sidebar');
    if (sidebarElement) {
      if (newState) {
        sidebarElement.classList.remove('-translate-x-full', 'rtl:translate-x-full');
        sidebarElement.classList.add('translate-x-0');
      } else {
        sidebarElement.classList.remove('translate-x-0');
        sidebarElement.classList.add('-translate-x-full', 'rtl:translate-x-full');
      }
    }
  };

  return (
    <Navbar
      fluid
      className="fixed w-full z-50 border-b dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="flex md:order-2 rtl:me-auto rtl:ms-0 ltr:ml-auto ltr:mr-0">
        {adminName && (
          <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {adminName}
          </div>
        )}
      </div>
      <div className="flex items-center rtl:me-2 ltr:ml-2">
        <NavbarToggle
          className="md:hidden me-2"
          onClick={toggleSidebar}
          aria-controls="sidebar-multi-level-sidebar"
        />
        <NavbarBrand href={`/${locale}/admin/dashboard`}>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {siteName}
          </span>
        </NavbarBrand>
      </div>
    </Navbar>
  );
} 