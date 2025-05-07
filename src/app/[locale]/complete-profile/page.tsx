'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations, useLocale } from 'next-intl';
import CompleteProfileForm from './ui/CompleteProfileForm';
import { Spinner, Alert } from 'flowbite-react';
import { UserProfile } from '@/lib/schemas/profile';

export default function CompleteProfilePage() {
  const t = useTranslations('Auth.CompleteProfilePage');
  const locale = useLocale();
  const { supabase, user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to settle

    if (!session || !user) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (!user.email_confirmed_at) {
      router.replace(`/${locale}/confirm-email`);
      return;
    }

    async function fetchProfile() {
      setProfileLoading(true);
      setProfileError(null);

      if (!user || !user.id) { // Added check for user.id for robustness
        setProfileError(t('userNotAuthenticated'));
        setProfileLoading(false);
        // router.replace(`/${locale}/login`); // Already handled by outer checks, but defensive
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_type, is_extended_profile_complete')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          if (data.is_extended_profile_complete) {
            router.replace(`/${locale}/profile`);
          } else if (!data.user_type) { // Explicitly check if user_type is missing
            console.error("Profile data is missing user_type:", data);
            setProfileError(t('missingUserType'));
            setProfile(null); // Ensure profile is null so form doesn't render
          } else {
            setProfile(data as UserProfile);
          }
        } else {
          // Specific error for profile not found
          console.warn(`Profile not found for user ID: ${user.id}`);
          setProfileError(t('profileNotFound'));
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setProfileError(err.message || t('fetchProfileError'));
      }
      setProfileLoading(false);
    }

    fetchProfile();
  }, [session, user, authLoading, supabase, router, locale, t]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="failure" className="text-lg"> {/* Added text-lg for better readability */}
          {profileError}
        </Alert>
      </div>
    );
  }
  
  if (!profile) { 
    return (
        <div className="container mx-auto p-4">
            <Alert color="warning" className="text-lg"> {/* Added text-lg */}
                {profileError || t('profileDataUnavailable')} {/* Show specific error if available */}
            </Alert> 
        </div>
    );
  }

  if (!profile.user_type) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="failure" className="text-lg">
          {t('missingUserTypeCritical')} {/* Add a new translation key for this specific scenario */}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            {t('title')}
          </h1>
        </div>
        <CompleteProfileForm userProfile={profile} />
      </div>
    </div>
  );
}
