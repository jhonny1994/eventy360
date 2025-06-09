'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, Button } from 'flowbite-react';
import { 
  HiUser, 
  HiHome, 
  HiLockClosed, 
  HiCreditCard, 
  HiOutlineShieldCheck,
  HiMenuAlt2, 
  HiX,
  HiChevronRight,
  HiChevronLeft,
  HiLogout,
  HiAcademicCap,
  HiOfficeBuilding,
  HiCalendar,
  HiIdentification,
  HiLocationMarker,
  HiDocumentText,
  HiBookmark,
  HiLibrary
} from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { IconType } from 'react-icons';
import type { AppSettings } from '@/lib/appConfig';

// Map of icon names to icon components for profile details
const iconMap = {
  HiUser,
  HiAcademicCap,
  HiOfficeBuilding,
  HiCalendar,
  HiIdentification,
  HiLocationMarker
};

export type IconName = keyof typeof iconMap;

export interface ProfileDetail {
  icon: IconName;
  label: string;
  value: string;
}

/**
 * Profile information structure used by the sidebar
 */
export interface ProfileInfo {
  name: string;
  email: string;
  userType: string;
  isVerified: boolean;
  profilePictureUrl: string | null;
  bio: string;
  details: ProfileDetail[];
  joinedDate: string;
}

/**
 * Navigation item structure for sidebar links
 */
interface NavigationItem {
  name: string;
  href: string;
  icon: IconType;
}

/**
 * Translation strings used in the sidebar
 */
interface TranslationStrings {
  // Existing translations
  editProfile: string;
  logout: string;
  verifiedBadge: string;
  toggleSidebar: string;
  userTypeLabel: string;
  verificationLabel: string;
  notVerifiedLabel: string;
  
  // New navigation translations
  dashboard: string;
  profile: string;
  events?: string;
  verification: string;
  subscriptions: string;
  security: string;
  topics?: string;
  submissions?: string;
  bookmarks?: string;
  researchRepository?: string;
}

/**
 * ProfileSidebar props
 */
interface ProfileSidebarProps {
  profile: ProfileInfo;
  locale: string;
  translations: TranslationStrings;
  userId?: string;
  userType?: "researcher" | "organizer" | "admin";
  appSettings?: AppSettings | null;
}

/**
 * ProfileSidebar component
 * 
 * Displays user profile information and navigation links
 * Supports mobile and desktop layouts with responsive behavior
 * 
 * @param profile - User profile information
 * @param locale - Current locale
 * @param translations - Translation strings
 */
export default function ProfileSidebar({ 
  profile, 
  locale, 
  translations,
  userType
}: ProfileSidebarProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { supabase } = useAuth();
  const isRtl = locale === 'ar';

  // Handle window resize to determine if mobile view
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    }

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle logout action
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  };
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Navigation items for sidebar
  const navigationItems: NavigationItem[] = [
    { name: translations.dashboard, href: `/${locale}/profile`, icon: HiHome },
    { name: translations.profile, href: `/${locale}/profile/edit`, icon: HiUser },
    { name: translations.events || 'Events', href: `/${locale}/profile/events`, icon: HiCalendar },
    // Only show submissions and bookmarks for researchers
    ...(userType === 'researcher' ? [
      { name: translations.submissions || 'Submissions', href: `/${locale}/profile/submissions`, icon: HiDocumentText },
      { name: translations.bookmarks || 'Bookmarks', href: `/${locale}/profile/bookmarks`, icon: HiBookmark },
    ] : []),
    // Show repository for both researchers and organizers
    { name: translations.researchRepository || 'Research Repository', href: `/${locale}/profile/repository`, icon: HiLibrary },
    { name: translations.verification, href: `/${locale}/profile/verification`, icon: HiOutlineShieldCheck },
    { name: translations.subscriptions, href: `/${locale}/profile/subscriptions`, icon: HiCreditCard },
    { name: translations.topics || 'Topics', href: `/${locale}/profile/topics`, icon: HiAcademicCap },
    { name: translations.security, href: `/${locale}/profile/security`, icon: HiLockClosed },
  ];

  // Check if a navigation link is active
  const isActive = (href: string): boolean => {
    if (href === `/${locale}/profile`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header with toggle button */}
      {isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 z-30" dir={isRtl ? 'rtl' : 'ltr'}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
            aria-label={translations.toggleSidebar}
          >
            {isMobileSidebarOpen ? <HiX size={24} /> : <HiMenuAlt2 size={24} />}
          </button>
          <h1 className="flex-1 text-xl font-semibold text-center text-gray-800 dark:text-white">
            {translations.dashboard}
          </h1>
        </div>
      )}
      {/* Sidebar - mobile (overlay) or desktop (fixed) */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-40 w-80 transition-transform duration-300 ease-in-out ${
                isMobileSidebarOpen 
                  ? 'translate-x-0' 
                  : `${isRtl ? 'translate-x-full' : '-translate-x-full'}`
              }`
            : 'hidden md:block w-80 flex-shrink-0'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Sidebar content with better spacing and structure */}
        <div className="flex flex-col h-full">
          {/* Profile header section */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            {renderProfileContent(true)}
          </div>

          {/* Navigation Links with improved spacing and active indicators */}
          <nav className="flex-grow p-4 space-y-1.5">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-2.5 rounded-lg ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                } transition-colors duration-200`}
              >
                <>
                  <span className={`flex-shrink-0 ${isRtl ? 'ml-3' : 'mr-3'}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span className="flex-grow text-sm font-medium">{item.name}</span>
                  {isActive(item.href) && (
                    <span className="flex-shrink-0">
                      {isRtl ? <HiChevronLeft className="w-5 h-5" /> : <HiChevronRight className="w-5 h-5" />}
                    </span>
                  )}
                </>
              </Link>
            ))}
          </nav>

          {/* Logout button with consistent styling */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleLogout}
              color="light"
              className="w-full flex items-center justify-center py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <HiLogout className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              <span>{translations.logout}</span>
            </Button>
          </div>
        </div>
      </aside>
      {/* Dark overlay when mobile sidebar is open */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 z-30 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        />
      )}
      {/* Push content down in mobile view to accommodate fixed header */}
      {isMobile && <div className="h-16 md:hidden" />}
    </>
  );

  /**
   * Render the profile content section of the sidebar with improved styling
   * @param isExpanded Whether the sidebar is expanded
   * @returns JSX Element
   */
  function renderProfileContent(isExpanded: boolean) {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Profile picture with proper spacing and sizing */}
        <div className="relative mb-4">
          {profile.profilePictureUrl ? (
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={profile.profilePictureUrl}
                alt={profile.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="mx-auto">
              <Avatar
                size="lg"
                rounded
              />
            </div>
          )}
          {/* Elegant verification checkmark */}
          {profile.isVerified && (
            <div className={`absolute -bottom-1 ${isRtl ? '-right-1' : '-left-1'} bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 rounded-full p-1 shadow-sm border border-blue-100 dark:border-blue-900`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Profile info with improved typography and spacing */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 line-clamp-1">
            {profile.name}
          </h3>
          
          {/* Profile details including user type and verification status */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <ul className="space-y-3">
                {/* User type */}
                <li className="flex items-center">
                  {isRtl ? (
                    <>
                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 mr-3">
                        <HiUser size={16} />
                      </span>
                      <span className="flex-grow text-sm text-right">
                        <span className="font-medium text-gray-900 dark:text-white">{translations.userTypeLabel}: </span>
                        <span className="text-gray-700 dark:text-gray-300">{profile.userType}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex-grow text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{translations.userTypeLabel}: </span>
                        <span className="text-gray-700 dark:text-gray-300">{profile.userType}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-3">
                        <HiUser size={16} />
                      </span>
                    </>
                  )}
                </li>

                {/* Verification status */}
                <li className="flex items-center">
                  {isRtl ? (
                    <>
                      <span className={`flex-shrink-0 mr-3 ${profile.isVerified ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'}`}>
                        <HiOutlineShieldCheck size={16} />
                      </span>
                      <span className="flex-grow text-sm text-right">
                        <span className="font-medium text-gray-900 dark:text-white">{translations.verificationLabel}: </span>
                        <span className={`${profile.isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {profile.isVerified ? translations.verifiedBadge : translations.notVerifiedLabel}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex-grow text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{translations.verificationLabel}: </span>
                        <span className={`${profile.isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {profile.isVerified ? translations.verifiedBadge : translations.notVerifiedLabel}
                        </span>
                      </span>
                      <span className={`flex-shrink-0 ml-3 ${profile.isVerified ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'}`}>
                        <HiOutlineShieldCheck size={16} />
                      </span>
                    </>
                  )}
                </li>

                {/* Other profile details */}
                {profile.details.map((detail, index) => {
                  const Icon = iconMap[detail.icon];
                  return (
                    <li key={index} className="flex items-center">
                      {isRtl ? (
                        <>
                          {Icon && (
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 mr-3">
                              <Icon size={16} />
                            </span>
                          )}
                          <span className="flex-grow text-sm text-right">
                            <span className="font-medium text-gray-900 dark:text-white">{detail.label}: </span>
                            <span className="text-gray-700 dark:text-gray-300">{detail.value}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex-grow text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">{detail.label}: </span>
                            <span className="text-gray-700 dark:text-gray-300">{detail.value}</span>
                          </span>
                          {Icon && (
                            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-3">
                              <Icon size={16} />
                            </span>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}