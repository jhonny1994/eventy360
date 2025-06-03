'use client';

import { ReactNode } from 'react';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { Spinner } from 'flowbite-react';
import useTranslations from '@/hooks/useTranslations';

interface PremiumFeatureGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectOnFailure?: boolean;
  redirectPath?: string;
  showToastOnRedirect?: boolean;
}

/**
 * A client component that protects premium features using the useSubscriptionCheck hook
 * This standardizes subscription checks across the profile section
 * 
 * @example
 * ```tsx
 * <PremiumFeatureGuard>
 *   <PremiumFeatureComponent />
 * </PremiumFeatureGuard>
 * ```
 */
export default function PremiumFeatureGuard({
  children,
  fallback,
  redirectOnFailure = true,
  redirectPath,
  showToastOnRedirect = true
}: PremiumFeatureGuardProps) {
  const t = useTranslations('ProfilePage');
  
  const { hasAccess, loading } = useSubscriptionCheck({
    redirectOnFailure,
    redirectPath,
    showToastOnRedirect
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-500">{t('loading')}</span>
      </div>
    );
  }
  
  if (!hasAccess) {
    return fallback || (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-yellow-700">{t('subscriptionRequired')}</p>
      </div>
    );
  }
  
  return <>{children}</>;
} 