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
 * - Fixed dimensions to prevent layout shifts
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
        base: "fixed top-0 z-50 w-full text-foreground transition-all duration-300 max-w-[100vw] overflow-x-hidden",
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
      toggle: {
        base: "inline-flex items-center rounded-lg p-2 text-sm text-foreground hover:bg-neutral-mid/20 focus:outline-none focus:ring-2 focus:ring-primary md:hidden",
        icon: "h-5 w-5",
      },
      brand: {
        base: "flex items-center"
      },
      link: {
        base: "block py-2 px-3 md:p-0",
        active: {
          on: "bg-primary text-white dark:text-white md:bg-transparent md:text-primary",
          off: "text-foreground hover:bg-neutral-mid/20 md:hover:bg-transparent md:hover:text-primary"
        },
        disabled: {
          on: "text-gray-400 hover:cursor-not-allowed",
          off: ""
        }
      }
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
          ${prefersReducedMotion ? "no-transition" : ""} max-w-[100vw] overflow-x-hidden`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <NavbarBrand as={Link} href={`/${locale}`}>
          <Image
            src="/png/logo.png"
            alt="Eventy360 Logo"
            width={32}
            height={32}
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Eventy360
          </span>
        </NavbarBrand>
        <div className="flex md:order-2 items-center space-x-3 rtl:space-x-reverse">
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <UserDropdown />
          <NavbarToggle className="ml-2" />
        </div>
        <NavbarCollapse className="p-4 md:p-0 bg-background/85 dark:bg-gray-900/85 backdrop-blur-lg md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none border-b border-gray-200 dark:border-gray-700 md:border-0 shadow-lg md:shadow-none max-w-full overflow-x-hidden">
          <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center md:space-x-6 rtl:md:space-x-reverse">
            {sectionLinks.map((link) => (
              <NavbarLink
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                active={activeSection === link.href.substring(1)}
                className={`group relative my-1 md:my-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === link.href.substring(1)
                    ? "text-white bg-primary/90 dark:bg-primary/90 dark:text-white md:bg-transparent md:text-primary md:border-b-2 md:border-primary"
                    : "text-foreground dark:text-white hover:bg-neutral-mid/30 dark:hover:bg-gray-800/70 md:hover:bg-transparent"
                } ${
                  // Add extra space for features and pricing in Arabic (3rd and 4th items)
                  (link.href === "#features" || link.href === "#pricing") 
                    ? "rtl:md:px-4 rtl:md:mx-1" 
                    : ""
                }`}
              >
                {link.label}
              </NavbarLink>
            ))}
          </div>
          <div className="mt-4 md:hidden">
            <div className="mb-4 flex items-center justify-start space-x-4 rtl:space-x-reverse bg-neutral-mid/20 dark:bg-gray-800/60 p-2 rounded-md">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {user ? (
              <div className="flex items-center border-t border-neutral-mid/30 dark:border-gray-700 pt-4 mt-2">
                <Link
                  href={`/${locale}/profile`}
                  className="flex flex-1 items-center rounded-lg p-2 hover:bg-neutral-mid/20 dark:hover:bg-gray-800"
                >
                  {profilePictureUrl ? (
                    <Image
                      src={profilePictureUrl}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                      style={{ width: '2rem', height: '2rem' }}
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                  <span className="mx-3 font-semibold">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 hover:bg-neutral-mid/20 dark:hover:bg-gray-800"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="border-t border-neutral-mid/30 dark:border-gray-700 pt-4 mt-2">
                <Link
                  href={`/${locale}/login`}
                  className="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground dark:text-white hover:bg-neutral-mid/20 dark:hover:bg-gray-800"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="mt-2 block rounded-lg bg-primary px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-primary/90"
                >
                  {t("register")}
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