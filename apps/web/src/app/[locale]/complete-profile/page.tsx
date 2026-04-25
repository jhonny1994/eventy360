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

  
  
  const profileFetchedRef = React.useRef(false);

  
  const fetchProfile = useCallback(async () => {
    
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
            setProfileError(t('missingUserType'));
          setProfile(null);
          } else {
            setProfile(data as UserProfile);
          }
        } else {
          setProfileError(t('profileNotFound'));
        }
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : t('fetchProfileError'));
    } finally {
      setProfileLoading(false);
    }
  }, [user, supabase, router, t]);

  
  useEffect(() => {
    if (authLoading) return;

    
    if (!session || !user) {
      router.replace('/redirect');
      return;
    }
    
    
    if (!user.email_confirmed_at) {
      router.replace('/confirm-email');
      return;
    }
    
    
    fetchProfile();
  }, [session, user, authLoading, router, fetchProfile]);

  
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

  
  if (authLoading || profileLoading) {
    return LoadingSpinner;
  }

  if (profileError) {
    return ErrorAlert;
  }
  
  if (!profile) { 
    
    return <div></div>;
  }

  if (!profile.user_type) {
    return MissingUserTypeAlert;
  }

  return FormContainer;
}
