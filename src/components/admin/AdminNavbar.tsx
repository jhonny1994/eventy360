'use client';

import { useState, useEffect } from 'react';
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
}: AdminNavbarProps) {
  // State to track sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Function to check if current screen is mobile
  const isMobile = () => window.innerWidth < 768;
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    const sidebarElement = document.getElementById('sidebar-multi-level-sidebar');
    if (sidebarElement) {
      if (isMobile()) {
        // On mobile, sidebar starts closed
        sidebarElement.classList.add('-translate-x-full', 'rtl:translate-x-full');
        sidebarElement.classList.remove('translate-x-0');
      } else {
        // On desktop, sidebar starts open
        sidebarElement.classList.remove('-translate-x-full', 'rtl:translate-x-full');
        sidebarElement.classList.add('translate-x-0');
      }
    }
    
    // Update sidebar state when window resizes
    const handleResize = () => {
      if (sidebarElement) {
        if (isMobile()) {
          // When resizing to mobile, close sidebar
          sidebarElement.classList.add('-translate-x-full', 'rtl:translate-x-full');
          sidebarElement.classList.remove('translate-x-0');
          setIsSidebarOpen(false);
        } else {
          // When resizing to desktop, show sidebar
          sidebarElement.classList.remove('-translate-x-full', 'rtl:translate-x-full');
          sidebarElement.classList.add('translate-x-0');
          setIsSidebarOpen(true);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to toggle sidebar and update its CSS class
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // Only toggle on mobile screens
    if (isMobile()) {
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
    }
  };

  return (
    <Navbar
      fluid
      className="fixed w-full z-50 border-b dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center">
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
        
        <div className="flex rtl:me-2 ltr:ml-2">
          {/* Right side content if needed */}
        </div>
      </div>
    </Navbar>
  );
} 