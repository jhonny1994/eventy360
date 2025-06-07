"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { Menu, X, User, LogOut } from "lucide-react";

// Import the custom components
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

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
const Navbar = () => {
  const { supabase, user } = useAuth();
  const { profile } = useUserProfile();
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  
  // Section links (anchor links for single-page navigation)
  const sectionLinks = useMemo(() => [
    { href: "#home", label: t("home") },
    { href: "#pathway", label: t("pathway") },
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
  ], [t]);
  
  // Listen for scroll events to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Active section spy scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" } // Highlights the link when the section is roughly in the middle of the screen
    );

    // Add a small delay to ensure all sections are properly loaded in the DOM
    const setupObserver = setTimeout(() => {
    sectionLinks.forEach((link) => {
      const element = document.getElementById(link.href.substring(1));
      if (element) {
        observer.observe(element);
      }
    });
    }, 100);

    return () => {
      clearTimeout(setupObserver);
      
      sectionLinks.forEach((link) => {
        const element = document.getElementById(link.href.substring(1));
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sectionLinks]);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);
  
  // Handle smooth scrolling for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Adjust for navbar height
        behavior: "smooth"
      });
    }
    
    setIsMenuOpen(false);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  };

  // Logic from UserDropdown
  const getDisplayName = () => {
    if (!profile || !profile.profileDetails) return user?.email || t("user");
    
    if (profile.profileDetails.userType === "researcher") {
      return profile.profileDetails.profile.name || user?.email || t("user");
    } else if (profile.profileDetails.userType === "organizer") {
      return profile.profileDetails.profile.name_translations?.ar || user?.email || t("user");
    } else if (profile.profileDetails.userType === "admin") {
      return profile.profileDetails.profile.name || user?.email || t("user");
    }
    
    return user?.email || t("user");
  };
   
  const getProfilePictureUrl = () => {
    if (
      !profile || !profile.profileDetails || (
      profile.profileDetails.userType !== "researcher" &&
      profile.profileDetails.userType !== "organizer"
    )) {
      return null;
    }
    return profile.profileDetails.profile.profile_picture_url || null;
  };

  const displayName = getDisplayName();
  const profilePictureUrl = getProfilePictureUrl();
  
  return (
    <nav 
      className={`fixed top-0 z-50 w-full bg-background/90 text-foreground transition-all duration-300 ${
        isScrolled 
          ? "backdrop-blur-md shadow-md" 
          : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="flex items-center">
              <Image
                src="/png/logo.png"
                alt="Eventy360"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="mx-2 text-xl font-bold">
                Eventy360
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Center Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4 rtl:space-x-reverse">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={`group relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === link.href.substring(1)
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      activeSection === link.href.substring(1) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </a>
              ))}
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Conditional rendering based on auth state */}
            {user && profile ? (
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
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {t("signup")}
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground/70 hover:bg-neutral-mid/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">{isMenuOpen ? t("closeMenu") : t("openMenu")}</span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {sectionLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-neutral-mid/20 hover:text-primary ${
                    activeSection === link.href.substring(1)
                      ? "text-primary bg-neutral-mid/20"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Auth actions */}
              <div className="border-t border-neutral-mid/20 pt-4 mt-4">
                {user && profile ? (
                  <>
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-neutral-mid/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="me-3 h-5 w-5" />
                      {t("profile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-neutral-mid/20"
                    >
                      <LogOut className="me-3 h-5 w-5" />
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/login`}
                      className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-neutral-mid/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href={`/${locale}/register`}
                      className="block rounded-md bg-primary px-3 py-2 text-base font-medium text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("signup")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 