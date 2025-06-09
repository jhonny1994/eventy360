"use client";

import { memo } from "react";
import Link from "next/link";
import { useUserData } from "@/hooks/useUserData";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { User, LogOut } from "lucide-react";
import { 
  Dropdown, 
  DropdownItem, 
  DropdownHeader, 
  DropdownDivider,
  Avatar
} from "flowbite-react";

/**
 * UserDropdown - Displays either a user dropdown with profile info and options
 * or login/register buttons based on authentication state
 * 
 * Features:
 * - Authenticated state: Avatar dropdown with profile link and logout option
 * - Unauthenticated state: Login and Register buttons
 * - RTL support for Arabic
 * - Consistent styling with other navigation components
 */
const UserDropdown = () => {
  const { user, displayName, profilePictureUrl, handleLogout } = useUserData();
  const t = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <div className="relative z-50">
      {user ? (
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <div className="flex items-center justify-center rounded-full p-1 cursor-pointer hover:bg-neutral-mid/20 dark:hover:bg-gray-700/30">
              {profilePictureUrl ? (
                <Avatar 
                  img={profilePictureUrl} 
                  rounded 
                  alt={displayName}
                  size="sm"
                  placeholderInitials={displayName ? displayName.charAt(0) : "U"} 
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          }
          dismissOnClick={true}
          placement="bottom"
          theme={{
            floating: {
              style: {
                auto: "border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              },
              base: "absolute z-[60] w-fit divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg outline-none dark:divide-gray-600 dark:border-gray-700 dark:bg-gray-800",
              content: "py-1 text-sm text-gray-700 dark:text-gray-200",
              item: {
                base: "flex w-full cursor-pointer items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white"
              }
            }
          }}
          className="z-[9999]"
        >
          <DropdownHeader>
            <span className="block text-sm font-medium truncate max-w-[200px]">{displayName}</span>
          </DropdownHeader>
          <DropdownItem as={Link} href={`/${locale}/profile`} icon={User}>
            {t("profile")}
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} onClick={handleLogout}>
            {t("logout")}
          </DropdownItem>
        </Dropdown>
      ) : (
        <div className="hidden space-x-2 rtl:space-x-reverse md:flex">
          <Link
            href={`/${locale}/login`}
            className="rounded-md border border-neutral-mid/30 dark:border-gray-700 px-3 py-2 text-sm font-medium text-foreground dark:text-white transition-colors hover:bg-neutral-mid/20 dark:hover:bg-gray-800"
          >
            {t("login")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("register")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default memo(UserDropdown); 