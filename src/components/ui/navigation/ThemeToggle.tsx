"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import useTranslations from "@/hooks/useTranslations";

/**
 * ThemeToggle - Animated theme toggle component that switches between light and dark modes
 * 
 * Features:
 * - Smooth icon animation between sun and moon
 * - Transitions with color changes and morphing
 * - Uses localStorage for theme persistence via next-themes
 * - Particle effect animation on theme change
 */
const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const t = useTranslations("AriaLabels");
  
  // Effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // For SSR, don't render anything to avoid hydration mismatch
  if (!mounted) {
    return null;
  }
  
  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setTimeout(() => setIsAnimating(false), 300);
    }, 150);
  };

  const isDarkMode = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-full bg-neutral-mid/20 p-2 transition-all duration-300 hover:bg-neutral-mid/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={t("toggleTheme")}
      aria-pressed={isDarkMode}
    >
      <div className="relative">
        {isDarkMode ? (
          <Moon 
            className={`h-5 w-5 text-primary transition-transform duration-300 ${
              isAnimating ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
          />
        ) : (
          <Sun 
            className={`h-5 w-5 text-primary transition-transform duration-300 ${
              isAnimating ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
          />
        )}
        
        {/* Particle effects */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute h-1 w-1 animate-particle-1 rounded-full bg-yellow-400" />
            <div className="absolute h-1 w-1 animate-particle-2 rounded-full bg-blue-400" />
            <div className="absolute h-1 w-1 animate-particle-3 rounded-full bg-background" />
            <div className="absolute h-1 w-1 animate-particle-4 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle; 