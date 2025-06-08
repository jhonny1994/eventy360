"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUserData } from "@/hooks/useUserData";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { User, LogOut } from "lucide-react";

const UserDropdown = () => {
  const { user, profile, displayName, profilePictureUrl, handleLogout } = useUserData();
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder with consistent width for server-side rendering
  if (!mounted) {
    return (
      <div className="hidden md:block min-w-[160px] h-9"></div>
    );
  }

  return (
    <div className="relative min-w-[160px]">
      {user && profile ? (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Link
            href={`/${locale}/profile`}
            className="flex items-center justify-center rounded-full p-2 h-9 w-9 bg-neutral-mid/20 dark:bg-gray-700/50 transition-all duration-300 hover:bg-neutral-mid/30 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={t("userMenu")}
          >
            {profilePictureUrl ? (
              <Image
                src={profilePictureUrl}
                alt={displayName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-foreground dark:text-white" />
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center justify-center rounded-full p-2 h-9 w-9 bg-neutral-mid/20 dark:bg-gray-700/50 transition-all duration-300 hover:bg-neutral-mid/30 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={t("logout")}
          >
            <LogOut className="h-5 w-5 text-foreground dark:text-white" />
          </button>
        </div>
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