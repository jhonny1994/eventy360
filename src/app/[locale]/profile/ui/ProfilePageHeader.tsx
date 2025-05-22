"use client";

import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineDocumentReport,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiOutlineDocumentText,
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
};

// Type for icon names
export type IconName = keyof typeof iconComponents;

interface ProfilePageHeaderProps {
  title: string;
  iconName?: IconName;
  iconBgColor?: string;
  iconTextColor?: string;
  locale?: string;
  children?: React.ReactNode;
}

/**
 * Standardized header component for profile pages
 * Provides consistent styling with icon and RTL support
 */
export default function ProfilePageHeader({
  title,
  iconName = "home",
  iconBgColor = "bg-blue-100 dark:bg-blue-900",
  iconTextColor = "text-blue-600 dark:text-blue-300",
  locale,
  children,
}: ProfilePageHeaderProps) {
  const Icon = iconComponents[iconName];
  const isRtl = locale === 'ar';

  return (
    <div className="flex items-center justify-between mb-6 w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <div className={`p-2 ${iconBgColor} rounded-full`}>
          <Icon className={`h-6 w-6 ${iconTextColor}`} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h1>
      </div>
      {children && (
        <div>{children}</div>
      )}
    </div>
  );
}