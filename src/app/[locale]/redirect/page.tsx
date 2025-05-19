'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from 'flowbite-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function RedirectPage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { user, loading: authLoading } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get auth_action from URL if present (for email confirmation)
  const authAction = searchParams?.get('auth_action');
  const isEmailConfirmed = authAction === 'email_confirmed';
  
  // Determine message based on URL parameters
  const message = isEmailConfirmed ? t('emailConfirmedRedirecting') : t('redirecting');
  
  useEffect(() => {
    // Don't redirect while still loading auth state
    if (authLoading) {
      return;
    }

    // Clear any existing timer if component re-renders
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a timeout to do the redirect
    timerRef.current = setTimeout(() => {
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
          // Email is confirmed, route to profile completion
          router.push(`/${locale}/complete-profile`);
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
  }, [user, authLoading, router, isEmailConfirmed, authAction, locale]);

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