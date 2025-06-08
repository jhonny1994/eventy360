"use client";

import Image from "next/image";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarCollapse, 
  NavbarLink, 
  NavbarToggle,
  Dropdown,
  Avatar
} from "flowbite-react";
import { createTheme, ThemeProvider } from "flowbite-react";

import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { useScrollEffects } from "@/hooks/useScrollEffects";
import { useUserData } from "@/hooks/useUserData";
import useReducedMotion from "@/hooks/useReducedMotion";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

// Define section link type
interface SectionLink {
  href: string;
  label: string;
}

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
  const prefersReducedMotion = useReducedMotion();
  const { user, displayName, profilePictureUrl, handleLogout } = useUserData();
  
  const sectionLinks: SectionLink[] = [
    { href: "#home", label: t("home") },
    { href: "#pathway", label: t("pathway") },
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
  ];
  
  const { activeSection } = useScrollEffects(sectionLinks, true);

  // Custom theme for the navbar
  const navbarTheme = createTheme({
    navbar: {
      root: {
        base: "fixed top-0 z-40 w-full border-b border-gray-200 dark:border-gray-700 bg-background/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 max-w-[100vw] overflow-hidden",
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
          on: "bg-primary/90 text-white dark:text-white md:bg-transparent md:text-primary md:border-b-2 md:border-primary",
          off: "text-foreground hover:bg-neutral-mid/20 md:hover:bg-transparent md:hover:text-primary"
        },
        disabled: {
          on: "text-gray-400 hover:cursor-not-allowed",
          off: ""
        }
      }
    },
    dropdown: {
      floating: {
        base: "z-50 my-1 w-fit rounded-lg border border-gray-200 bg-white shadow-lg outline-none dark:border-gray-700 dark:bg-gray-800",
        content: "py-1 text-sm text-gray-700 focus:outline-none dark:text-gray-200",
        target: "w-fit",
        item: {
          base: "flex items-center justify-start py-2 px-4 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white focus:bg-gray-100 dark:focus:bg-gray-600 dark:focus:text-white",
          icon: "mr-2 h-4 w-4"
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
      <Navbar fluid>
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
          
          {user ? (
            <div className="hidden md:block">
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="flex items-center">
                    {profilePictureUrl ? (
                      <Avatar 
                        img={profilePictureUrl} 
                        rounded 
                        alt={displayName}
                        size="sm" 
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                }
              >
                <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span className="block text-sm">{displayName}</span>
                </div>
                <a href={`/${locale}/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  {t("profile")}
                </a>
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  {t("logout")}
                </button>
              </Dropdown>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
              <Link
                href={`/${locale}/login`}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/90"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {t("register")}
              </Link>
            </div>
          )}
          
          <NavbarToggle />
        </div>
        
        <NavbarCollapse className="backdrop-blur-lg">
          <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center md:space-x-6 rtl:md:space-x-reverse">
            {sectionLinks.map((link, index) => (
              <NavbarLink
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                active={activeSection === link.href.substring(1)}
                className={`my-1 md:my-0 ${index > 0 ? 'md:rtl:mr-6 md:ltr:ml-6' : ''}`}
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