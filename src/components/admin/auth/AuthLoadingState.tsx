'use client';

import { Spinner } from 'flowbite-react';
import { useTranslations } from 'next-intl';

interface AuthLoadingStateProps {
  message?: string;
  isFullScreen?: boolean;
}

/**
 * Standardized loading component for admin authentication pages
 * Shows a spinner with a message
 */
export default function AuthLoadingState({
  message,
  isFullScreen = false,
}: AuthLoadingStateProps) {
  const t = useTranslations('Common');
  
  const loadingMessage = message || t('loading');
  const containerClass = isFullScreen 
    ? "flex h-screen w-full flex-col items-center justify-center p-6 text-center"
    : "flex w-full flex-col items-center justify-center p-6 text-center";

  return (
    <div className={containerClass}>
      <Spinner aria-label={loadingMessage} size="xl" />
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{loadingMessage}</p>
    </div>
  );
} 