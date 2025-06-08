"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import ReactCountryFlag from "react-country-flag";

import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";

// Define language interface
interface Language {
  code: string;
  name: string;
  countryCode: string;
}

// Define dropdown position interface
interface DropdownPosition {
  top: number;
  left?: number;
  right?: number;
}

// Languages available in the application
const languages: Language[] = [
  { code: "en", name: "English", countryCode: "GB" },
  { code: "ar", name: "العربية", countryCode: "DZ" },
  { code: "fr", name: "Français", countryCode: "FR" },
];

// Helper function to get available languages
export const getLanguages = (): Language[] => {
  return languages;
};

export default function LanguageSwitcher() {
  const t = useTranslations("Navigation");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<DropdownPosition>({ top: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === "ar";

  // Get current language
  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  // Update dropdown position based on button position
  const updateDropdownPosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Account for mobile viewport and fixed position elements
      if (isRTL) {
        setPosition({
          top: rect.bottom + scrollY,
          right: window.innerWidth - rect.right - scrollX
        });
      } else {
        setPosition({
          top: rect.bottom + scrollY,
          left: rect.left + scrollX
        });
      }
    }
  };

  // Handle client-side mounting for portal
  useEffect(() => {
    setIsMounted(true);

    // Initial position update when mounting
    if (btnRef.current && isOpen) {
      updateDropdownPosition();
    }
  }, []);

  // Add scroll and resize listeners to update position
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && btnRef.current) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen && btnRef.current) {
        updateDropdownPosition();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      // Update position immediately before opening
      setTimeout(updateDropdownPosition, 0);
    }
    setIsOpen(!isOpen);
  };

  const getBaseUrl = (path = pathname) => {
    // Remove current locale from the pathname
    const segments = path.split("/");
    segments.splice(1, 1);
    return segments.join("/") || "/";
  };

  const formatLocaleUrl = (locale: string) => {
    const baseUrl = getBaseUrl();
    return `/${locale}${baseUrl}`;
  };

  const dropdownMenu =
    isOpen && isMounted
      ? createPortal(
          <div
            ref={dropdownRef}
            className={`fixed z-100 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 w-40 ${
              isRTL ? "origin-top-right" : "origin-top-left"
            }`}
            style={{
              top: `${position.top}px`,
              left: isRTL ? undefined : `${position.left}px`,
              right: isRTL ? `${position.right}px` : undefined,
              maxHeight: "200px",
              overflowY: "auto",
              animation: "dropdown-in 0.2s ease-out",
            }}
          >
            <div className="py-1">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={formatLocaleUrl(lang.code)}
                  locale={lang.code}
                  className={`flex items-center px-4 py-2 text-sm ${
                    locale === lang.code
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <ReactCountryFlag
                    countryCode={lang.countryCode}
                    svg
                    style={{
                      width: "1em",
                      height: "1em",
                      marginRight: isRTL ? 0 : "0.5rem",
                      marginLeft: isRTL ? "0.5rem" : 0,
                    }}
                    aria-label={`Flag of ${lang.name}`}
                    title={lang.name}
                  />
                  {lang.name}
                </Link>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-neutral-mid/20 dark:text-white dark:hover:bg-gray-700/30 ${
          isOpen ? "bg-neutral-mid/20 dark:bg-gray-700/50" : ""
        }`}
      >
        <ReactCountryFlag
          countryCode={currentLanguage.countryCode}
          svg
          style={{
            width: "1.25em",
            height: "1.25em",
          }}
          aria-label={`Current language: ${currentLanguage.name}`}
          title={currentLanguage.name}
        />
        <span className="sr-only">{t("changeLang")}</span>
      </button>
      {dropdownMenu}
    </>
  );
}
