"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
};

/**
 * LanguageSwitcher - A dropdown component for switching between available languages
 */
const LanguageSwitcher = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
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
    router.push("/", { locale: newLocale });
    setIsOpen(false);
  };
  
  const handleButtonHover = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 800);
  };
  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      const focusableElements = Array.from(
        dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[role="menuitem"]'
        ) || []
      );

      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
          } else {
            const currentIndex = focusableElements.findIndex(
              (el) => el === document.activeElement
            );
            focusableElements[currentIndex - 1].focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
          } else {
            const currentIndex = focusableElements.findIndex(
              (el) => el === document.activeElement
            );
            focusableElements[currentIndex + 1].focus();
          }
        }
        return;
      }

      const currentIndex = focusableElements.findIndex(
        (el) => el === document.activeElement
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          (currentIndex - 1 + focusableElements.length) %
          focusableElements.length;
        focusableElements[prevIndex].focus();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const firstItem = dropdownRef.current?.querySelector<HTMLButtonElement>(
        'button[role="menuitem"]'
      );
      firstItem?.focus();
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleButtonHover}
        className="flex items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-neutral-mid/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={t("switchLanguage")}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="language-menu"
      >
        <Globe 
          className={`h-5 w-5 transition-transform duration-700 ${isRotating ? "rotate-180" : ""}`}
        />
      </button>
      
      {isOpen && (
        <div
          id="language-menu"
          className="absolute right-0 mt-2 w-40 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
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