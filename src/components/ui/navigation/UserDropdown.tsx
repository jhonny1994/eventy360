"use client";

import { memo } from "react";
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

  return (
    <div className="relative">
      {user && profile ? (
        <div className="flex items-center space-x-2">
          <Link
            href={`/${locale}/profile`}
            className="flex items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-neutral-mid/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
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
              <User className="h-5 w-5" />
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-neutral-mid/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={t("logout")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="hidden space-x-2 rtl:space-x-reverse md:flex">
          <Link
            href={`/${locale}/login`}
            className="rounded-md border border-transparent px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-neutral-mid/20"
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