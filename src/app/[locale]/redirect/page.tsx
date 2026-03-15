'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from 'flowbite-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

function RedirectPageContent() {
  const t = useTranslations('Common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { user, loading: authLoading, supabase } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  
  // Get auth_action from URL if present (for email confirmation)
  const authAction = searchParams?.get('auth_action');
  const isEmailConfirmed = authAction === 'email_confirmed';
  
  // Determine message based on URL parameters
  const message = isEmailConfirmed ? t('emailConfirmedRedirecting') : t('redirecting');
  
  useEffect(() => {
    // Don't redirect while still loading auth state
    if (authLoading || isCheckingProfile) {
      return;
    }

    // Clear any existing timer if component re-renders
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a timeout to do the redirect
    timerRef.current = setTimeout(async () => {
      if (user) {
        // User is logged in, route based on profile completion
        if (!user.email_confirmed_at) {
          // If email was just confirmed in this session but Supabase hasn't
          // updated the user object yet, go to complete-profile
          if (isEmailConfirmed) {
            router.push(`/${locale}/complete-profile`);
          } else {
            router.push(`/${locale}/confirm-email`);
          }
        } else {
          // Email is confirmed, check if profile is complete
          setIsCheckingProfile(true);
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('is_extended_profile_complete')
              .eq('id', user.id)
              .single();
            
            if (error) throw error;
            
            if (data && data.is_extended_profile_complete) {
              // Profile is complete, go directly to profile page
              router.push(`/${locale}/profile`);
            } else {
              // Profile needs completion
              router.push(`/${locale}/complete-profile`);
            }
          } catch (err) {
            console.error('Error checking profile:', err);
            // If error occurs, default to complete-profile
          router.push(`/${locale}/complete-profile`);
          } finally {
            setIsCheckingProfile(false);
          }
        }
      } else {
        // No user, redirect to login
        router.push(`/${locale}/login`);
      }
    }, 1500); // Wait 1.5 seconds before redirecting
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, authLoading, router, isEmailConfirmed, authAction, locale, supabase, isCheckingProfile]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">{message}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEmailConfirmed 
            ? t('emailConfirmedRedirectingDescription') 
            : t('redirectingToLogin')}
        </p>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
        </div>
      </div>
    }>
      <RedirectPageContent />
    </Suspense>
  );
}