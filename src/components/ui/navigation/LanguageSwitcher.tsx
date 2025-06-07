"use client";

import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { useRouter } from "@/i18n/navigation";
import useLocale from "@/hooks/useLocale";
import useTranslations from "@/hooks/useTranslations";
import { Globe } from "lucide-react";

/**
 * Language flags with emoji representation
 */
const languageFlags: Record<string, { countryCode: string, name: string }> = {
  ar: { countryCode: "DZ", name: "العربية" },
  // Prepared for future language additions
  // en: { countryCode: "GB", name: "English" },
  // fr: { countryCode: "FR", name: "Français" },
};

/**
 * LanguageSwitcher - A dropdown component for switching between available languages
 * 
 * Features:
 * - Icon-based dropdown with emoji flags
 * - Smooth reveal animation for the dropdown
 * - Uses useLocale hook to get current locale
 * - Globe rotation animation on hover
 */
const LanguageSwitcher = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleLanguageChange = (newLocale: string) => {
    // Use the current path with new locale
    router.push("/", { locale: newLocale });
    setIsOpen(false);
  };
  
  const handleButtonHover = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleButtonHover}
        className="flex items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-neutral-mid/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={t("switchLanguage")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe 
          className={`h-5 w-5 transition-transform duration-700 ${isRotating ? "rotate-180" : ""}`}
        />
      </button>
      
      {/* Dropdown menu with staggered animation */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.entries(languageFlags).map(([langCode, { countryCode, name }], index) => (
              <button
                key={langCode}
                className={`flex w-full items-center px-4 py-2 text-left text-sm text-foreground transition-all duration-200 hover:bg-neutral-mid/20 ${
                  locale === langCode ? "bg-neutral-mid/20" : ""
                } animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleLanguageChange(langCode)}
                role="menuitem"
              >
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  className="me-3 text-xl"
                  aria-label={name}
                />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 