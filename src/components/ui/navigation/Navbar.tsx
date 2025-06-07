"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { createTheme, ThemeProvider } from "flowbite-react";

import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { useScrollEffects } from "@/hooks/useScrollEffects";
import { useUserData } from "@/hooks/useUserData";
import useReducedMotion from "@/hooks/useReducedMotion";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import UserDropdown from "./UserDropdown";

/**
 * Navbar component for the homepage with responsive and reactive behavior
 * 
 * Features:
 * - Reactive UI that changes based on authentication state
 * - Section anchor links for single-page navigation
 * - Mobile-responsive with collapsible menu
 * - RTL support for Arabic
 * - Icon-based actions: theme toggle, language switcher, user dropdown
 */
const CustomNavbar = () => {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const prefersReducedMotion = useReducedMotion();
  const { user, displayName, profilePictureUrl, handleLogout } = useUserData();
  
  const sectionLinks = useMemo(() => [
    { href: "#home", label: t("home") },
    { href: "#pathway", label: t("pathway") },
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
  ], [t]);
  
  const { isScrolled, activeSection } = useScrollEffects(sectionLinks, true);

  // Custom theme to ensure solid background for mobile menu
  const navbarTheme = createTheme({
    navbar: {
      root: {
        base: "fixed top-0 z-50 w-full text-foreground transition-all duration-300",
        bordered: {
          on: "",
          off: "",
        },
        rounded: {
          on: "rounded",
          off: "",
        },
      },
      collapse: {
        base: "w-full md:block md:w-auto",
        list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8 rtl:space-x-reverse",
        hidden: {
          on: "hidden",
          off: "",
        },
      },
    }
  });
  
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };
  
  return (
    <ThemeProvider theme={navbarTheme}>
      <Navbar 
        fluid
        rounded
        className={`${isScrolled ? "backdrop-blur-md shadow-md bg-background/90" : "bg-background/90"} 
          ${prefersReducedMotion ? "no-transition" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <NavbarBrand as={Link} href={`/${locale}`}>
          <Image
            src="/png/logo.png"
            alt="Eventy360 Logo"
            width={32}
            height={32}
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Eventy360
          </span>
        </NavbarBrand>
        <div className="flex md:order-2 items-center space-x-3 rtl:space-x-reverse">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserDropdown />
          <NavbarToggle />
        </div>
        <NavbarCollapse className="p-4 md:p-0 bg-background/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 md:border-0 md:bg-transparent md:backdrop-blur-none dark:md:bg-transparent shadow-lg md:shadow-none">
          {sectionLinks.map((link) => (
            <NavbarLink
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              active={activeSection === link.href.substring(1)}
              className={`group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                activeSection === link.href.substring(1)
                  ? "text-primary"
                  : "text-foreground/80"
              }`}
            >
              {link.label}
            </NavbarLink>
          ))}
          <div className="mt-4 md:hidden">
            {user ? (
              <div className="flex items-center border-t border-neutral-mid/20 pt-4">
                <Link
                  href={`/${locale}/profile`}
                  className="flex flex-1 items-center rounded-lg p-2 hover:bg-neutral-mid/20"
                >
                  {profilePictureUrl ? (
                    <Image
                      src={profilePictureUrl}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <span className="mx-3 font-semibold">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 hover:bg-neutral-mid/20"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="border-t border-neutral-mid/20 pt-4">
                <Link
                  href={`/${locale}/login`}
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground/80 hover:bg-neutral-mid/20"
                >
                  {t("login")}
                </Link>
              </div>
            )}
          </div>
        </NavbarCollapse>
      </Navbar>
    </ThemeProvider>
  );
};

export default CustomNavbar; 