'use client';

import { useState } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarToggle 
} from 'flowbite-react';

interface AdminNavbarProps {
  siteName: string;
  locale: string;
  adminName?: string;
}

export default function AdminNavbar({ siteName, locale, adminName = 'Admin' }: AdminNavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    
    // Find the sidebar element and toggle its class
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('translate-x-full');
    }
  };

  return (
    <Navbar fluid className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="w-full flex items-center justify-between px-3">
        {/* Mobile toggle */}
        <div className="flex items-center md:hidden">
          <NavbarToggle 
            onClick={toggleSidebar}
            className="mr-3" 
          />
        </div>
        
        {/* Center logo/site name */}
        <div className="flex-1 flex justify-center md:justify-start">
          <a href={`/${locale}/admin/dashboard`} className="flex items-center"> 
            <NavbarBrand as="div">
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">{siteName}</span>
            </NavbarBrand>
          </a>
        </div>
        
        {/* Admin name display */}
        <div className="flex items-center">
          <span className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {adminName}
          </span>
        </div>
      </div>
    </Navbar>
  );
} 