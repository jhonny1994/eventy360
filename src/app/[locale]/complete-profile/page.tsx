'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import CompleteProfileForm from './ui/CompleteProfileForm';
import { Spinner, Alert } from 'flowbite-react';
import { UserProfile } from '@/lib/schemas/profile';
import React from 'react';

export default function CompleteProfilePage() {
  const t = useTranslations('Auth.CompleteProfilePage');
  const { supabase, user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // We'll use a ref instead of state to track profile fetch attempts
  // This avoids the dependency cycle that causes the infinite loop
  const profileFetchedRef = React.useRef(false);

  // Memoize fetch profile function to prevent recreating on every render
  const fetchProfile = useCallback(async () => {
    // Only fetch if we haven't already and user exists
    if (profileFetchedRef.current || !user || !user.id) return;
    
      setProfileLoading(true);
      setProfileError(null);
    profileFetchedRef.current = true;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_type, is_extended_profile_complete')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          if (data.is_extended_profile_complete) {
          router.replace('/profile');
        } else if (!data.user_type) {
            console.error("Profile data is missing user_type:", data);
            setProfileError(t('missingUserType'));
          setProfile(null);
          } else {
            setProfile(data as UserProfile);
          }
        } else {
          console.warn(`Profile not found for user ID: ${user.id}`);
          setProfileError(t('profileNotFound'));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileError(err instanceof Error ? err.message : t('fetchProfileError'));
    } finally {
      setProfileLoading(false);
    }
  }, [user, supabase, router, t]);

  // Handle auth state changes and redirects
  useEffect(() => {
    if (authLoading) return;

    // Handle unauthenticated users
    if (!session || !user) {
      router.replace('/redirect');
      return;
    }
    
    // Handle unconfirmed email
    if (!user.email_confirmed_at) {
      router.replace('/confirm-email');
      return;
    }
    
    // Fetch profile data once auth is settled
    fetchProfile();
  }, [session, user, authLoading, router, fetchProfile]);

  // Extract common UI elements to reduce complexity
  const LoadingSpinner = useMemo(() => (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
  ), []);

  const ErrorAlert = useMemo(() => (
      <div className="container mx-auto p-4">
      <Alert color="failure" className="text-lg">
          {profileError}
        </Alert>
      </div>
  ), [profileError]);
  
  const MissingUserTypeAlert = useMemo(() => (
      <div className="container mx-auto p-4">
        <Alert color="failure" className="text-lg">
        {t('missingUserTypeCritical')}
        </Alert>
      </div>
  ), [t]);

  const FormContainer = useMemo(() => profile && (
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
  ), [profile, t]);

  // Determine what to render based on current state
  if (authLoading || profileLoading) {
    return LoadingSpinner;
  }

  if (profileError) {
    return ErrorAlert;
  }
  
  if (!profile) { 
    // Return empty div instead of warning alert to keep page blank during redirect
    return <div></div>;
  }

  if (!profile.user_type) {
    return MissingUserTypeAlert;
  }

  return FormContainer;
}
