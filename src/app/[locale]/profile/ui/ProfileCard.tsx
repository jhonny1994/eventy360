"use client";

import { IconName } from "./ProfilePageHeader";
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineDocumentReport,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiOutlineDocumentText,
  HiOutlineCalendar,
} from "react-icons/hi";

// Map of icon names to components
const iconComponents = {
  home: HiOutlineHome,
  user: HiOutlineUser,
  document: HiOutlineDocumentReport,
  shield: HiOutlineShieldCheck,
  creditCard: HiOutlineCreditCard,
  lock: HiOutlineLockClosed,
  id: HiOutlineIdentification,
  documentText: HiOutlineDocumentText,
  calendar: HiOutlineCalendar,
};

interface ProfileCardProps {
  title?: string;
  iconName?: IconName;
  iconBgColor?: string;
  iconTextColor?: string;
  locale?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized card component for profile pages
 * Provides consistent styling with optional icon and RTL support
 */
export default function ProfileCard({
  title,
  iconName,
  iconBgColor = "bg-gray-100 dark:bg-gray-800",
  iconTextColor = "text-gray-600 dark:text-gray-300",
  locale,
  children,
  className = "",
}: ProfileCardProps) {
  const Icon = iconName ? iconComponents[iconName] : null;
  const isRtl = locale === 'ar';

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {title && (
        <div
          className="flex items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          {Icon && (
            <div
              className={`p-2 ${isRtl ? 'ml-3' : 'mr-3'} ${iconBgColor} rounded-full`}
            >
              <Icon className={`h-5 w-5 ${iconTextColor}`} />
            </div>
          )}
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}