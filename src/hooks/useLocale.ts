import { useLocale as useNextIntlLocale } from 'next-intl';

/**
 * Hook for accessing the current locale
 * 
 * This is a standardized wrapper around the next-intl useLocale hook,
 * providing a consistent API for accessing the current locale throughout the application.
 * 
 * @returns {string} The current locale string (e.g., 'en', 'ar', 'fr')
 */
export default function useLocale(): string {
  return useNextIntlLocale();
} 