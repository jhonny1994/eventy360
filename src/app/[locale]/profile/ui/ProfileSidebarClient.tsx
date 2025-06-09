'use client';

import { useState, useEffect } from 'react';
import { Avatar, Button, Tooltip } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import {
  HiPencil,
  HiArrowRightOnRectangle,
  HiBuildingOffice2,
  HiAcademicCap,
  HiMapPin,
  HiIdentification,
  HiCalendar,
  HiCheckCircle
} from 'react-icons/hi2';
import { HiX, HiMenuAlt2 } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { Link } from '@/i18n/navigation';


export const iconMap = {
  HiBuildingOffice2,
  HiAcademicCap,
  HiMapPin,
  HiIdentification,
  HiCalendar
};


export type IconName = keyof typeof iconMap;


export interface ProfileDetail {
  icon: IconName;
  label: string;
  value: string;
}

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

interface TranslationStrings {
  editProfile: string;
  logout: string;
  verifiedBadge: string;
  toggleSidebar: string;
  userTypeLabel: string;
  verificationLabel: string;
  notVerifiedLabel: string;
}

interface ProfileSidebarClientProps {
  profile: ProfileInfo;
  locale: string;
  translations: TranslationStrings;
}

/**
 * Client component for the profile sidebar, displaying user information and actions
 * 
 * Note: This component follows the standardized hook pattern by using:
 * - useAuth - For authentication and logout functionality
 * - Standard React hooks for UI state management
 * 
 * It receives profile data and translations as props rather than fetching them directly,
 * following the data-passing pattern for client components.
 */
export default function ProfileSidebarClient({ profile, locale, translations }: ProfileSidebarClientProps) {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const isRTL = locale === 'ar';


  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);

      if (window.innerWidth >= 768) {
        setExpanded(true);
        setMobileOpen(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
  };


  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setExpanded(!expanded);
    }
  };


  const ChevronIcon = expanded
    ? (isRTL ? HiChevronRight : HiChevronLeft)
    : (isRTL ? HiChevronLeft : HiChevronRight);


  if (isMobile) {
    return (
      <>
        {/* Mobile toggle button - Adjusted positioning for RTL layouts */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 ${isRTL ? 'end-4' : 'start-4'} z-20 p-2 rounded-full bg-white shadow-md dark:bg-gray-800 text-gray-700 dark:text-gray-200`}
          aria-label={translations.toggleSidebar}
        >
          <HiMenuAlt2 className="h-6 w-6" />
        </button>

        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-30 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileOpen(false)}
        ></div>

        {/* Mobile sidebar - increased width to w-84 */}
        <aside
          className={`fixed top-0 bottom-0 start-0 w-84 bg-white dark:bg-gray-800 shadow-xl z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Close sidebar"
              >
                <HiX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Profile content for mobile - always expanded */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {renderProfileContent(true)}
            </div>
          </div>
        </aside>
      </>
    );
  }


  return (
    <>
      <aside
        className={`h-screen bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 ${expanded ? 'w-84' : 'w-20'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          {/* Improved toggle button placement and styling */}
          <div className="flex justify-end p-3">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={translations.toggleSidebar}
            >
              <ChevronIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            {renderProfileContent(expanded)}
          </div>
        </div>
      </aside>
    </>
  );


  function renderProfileContent(isExpanded: boolean) {
    return (
      <div className="flex flex-col items-center h-full">
        {/* Profile picture - improved roundness with aspect-square and increased size */}
        <div className={`relative mb-4 ${isExpanded ? 'w-36 h-36' : 'w-14 h-14'}`}>
          <div className="rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 w-full h-full aspect-square">
            <Avatar
              img={profile.profilePictureUrl || undefined}
              alt={profile.name}
              size={isExpanded ? "xl" : "md"}
              rounded={true}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Name */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{profile.name}</h2>

            {/* Bio section */}
            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-6 line-clamp-3">
                {profile.bio}
              </p>
            )}

            {/* Profile details - including verification status and user type as regular details */}
            <div className="w-full space-y-3 mb-auto">
              {/* Add user type as a detail item */}
              <div className="flex items-center gap-3 text-sm">
                <HiIdentification className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{translations.userTypeLabel}</p>
                  <p className="text-gray-900 dark:text-white">{profile.userType}</p>
                </div>
              </div>

              {/* Add verification status as a detail item (always shown) */}
              <div className="flex items-center gap-3 text-sm">
                <HiCheckCircle className={`flex-shrink-0 h-5 w-5 ${profile.isVerified ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{translations.verificationLabel}</p>
                  <p className={profile.isVerified ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                    {profile.isVerified ? translations.verifiedBadge : translations.notVerifiedLabel}
                  </p>
                </div>
              </div>

              {/* Existing details */}
              {profile.details.map((detail, index) => {
                const Icon = iconMap[detail.icon];
                return (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <Icon className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{detail.label}</p>
                      <p className="text-gray-900 dark:text-white">{detail.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="w-full mt-6 space-y-3">
              <Link
                href={`/${locale}/profile/edit`}
                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 transition-colors"
              >
                <HiPencil className="h-5 w-5" />
                <span className="font-medium">{translations.editProfile}</span>
              </Link>

              <Button
                onClick={handleLogout}
                color="light"
                className="w-full flex items-center justify-center gap-2"
              >
                <HiArrowRightOnRectangle className="h-5 w-5" />
                <span>{translations.logout}</span>
              </Button>
            </div>
          </>
        )}

        {/* Collapsed state content */}
        {!isExpanded && (
          <div className="flex flex-col items-center mt-6 space-y-6">
            <Tooltip content={translations.editProfile} placement={isRTL ? "left" : "right"}>
              <Link
                href={`/${locale}/profile/edit`}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
              >
                <HiPencil className="h-5 w-5" />
              </Link>
            </Tooltip>

            <Tooltip content={translations.logout} placement={isRTL ? "left" : "right"}>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
              >
                <HiArrowRightOnRectangle className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
} 