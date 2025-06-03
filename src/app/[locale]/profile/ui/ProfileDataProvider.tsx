'use client';

import { ReactNode } from 'react';
import { useUserProfile, CompleteUserProfile } from '@/hooks/useUserProfile';
import { Spinner } from 'flowbite-react';
import useTranslations from '@/hooks/useTranslations';

interface ProfileDataProviderProps {
  children: (profileData: CompleteUserProfile) => ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * A client component that provides profile data to its children using the useUserProfile hook
 * This standardizes profile data access across the profile section
 * 
 * @example
 * ```tsx
 * <ProfileDataProvider>
 *   {(profile) => (
 *     <div>
 *       <h1>{profile.baseProfile.user_type}</h1>
 *       {// Use profile data here}
 *     </div>
 *   )}
 * </ProfileDataProvider>
 * ```
 */
export default function ProfileDataProvider({
  children,
  fallback,
  errorFallback
}: ProfileDataProviderProps) {
  const { profile, loading, error } = useUserProfile();
  const t = useTranslations('ProfilePage');
  
  if (loading) {
    return fallback || (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-500">{t('loading')}</span>
      </div>
    );
  }
  
  if (error || !profile) {
    return errorFallback || (
      <div className="p-4 text-center text-red-500">
        {t('errorLoadingProfile')}
      </div>
    );
  }
  
  return <>{children(profile)}</>;
} 