'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * A custom hook that provides translations for client components
 * 
 * @param namespace The translation namespace
 * @returns Translation function
 */
export default function useTranslations(namespace: string) {
  return useNextIntlTranslations(namespace);
} 