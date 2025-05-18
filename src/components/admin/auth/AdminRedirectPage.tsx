'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLoadingState, AuthError } from '@/components/admin/auth';

export default function AdminRedirectPage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectSource, setRedirectSource] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authAction = params.get('auth_action');
      const errorParam = params.get('error');

      if (authAction === 'admin_invite_accepted') {
        setRedirectSource('admin_invite');
      } else if (errorParam) {
        const errorDesc = params.get('error_description');
        setError(errorDesc || errorParam);
        setIsLoading(false);
        setRedirectAttempted(true);
      }
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const directClient = createClient();
        const { data: sessionData, error: sessionError } = await directClient.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (sessionData.session?.user && !user && !authLoading) {
          window.location.reload();
          return;
        }
        
        setSessionChecked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error checking session state');
        setSessionChecked(true);
      }
    };
    
    if (!sessionChecked && !redirectAttempted) {
      checkSession();
    }
  }, [user, authLoading, sessionChecked, redirectAttempted]);

  useEffect(() => {
    if (redirectAttempted || authLoading || error || !sessionChecked) {
      return;
    }

    async function handleRedirect() {
      try {
        if (redirectSource === 'admin_invite') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!user) {
          setError('No authenticated user found. Please sign in again.');
          setIsLoading(false);
          return;
        }

        if (!user.email_confirmed_at) {
          setError('Email not confirmed. Please check your email and confirm your account.');
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, is_extended_profile_complete')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Could not retrieve your profile. ' + profileError.message);
          setIsLoading(false);
          return;
        }

        if (!profile || profile.user_type !== 'admin') {
          await supabase.auth.signOut();
          setError('Access denied. Your account does not have administrator privileges.');
          setIsLoading(false);
          return;
        }

        if (!profile.is_extended_profile_complete) {
          router.push('/admin/create-account');
          return;
        }

        router.push('/admin/dashboard');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during redirect';
        setError(errorMessage);
        setIsLoading(false);
      } finally {
        setRedirectAttempted(true);
      }
    }

    const delayTime = redirectSource === 'admin_invite' ? 1500 : 500;
    const timeoutId = setTimeout(() => {
      handleRedirect();
    }, delayTime);

    return () => clearTimeout(timeoutId);
  }, [user, authLoading, supabase, router, redirectAttempted, redirectSource, error, sessionChecked]);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    const MAX_RETRIES = 2;

    if (
      error === 'No authenticated user found. Please sign in again.' && 
      redirectSource === 'admin_invite' && 
      autoRetryCount < MAX_RETRIES
    ) {
      retryTimeout = setTimeout(() => {
        setError(null);
        setSessionChecked(false);
        setRedirectAttempted(false);
        setAutoRetryCount(prev => prev + 1);
      }, 2000 * (autoRetryCount + 1));
    }
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [error, redirectSource, autoRetryCount]);

  if (isLoading && !error && !redirectAttempted) {
    return <AuthLoadingState message={redirectAttempted ? t('redirecting') : t('loadingProcessing')} isFullScreen />;
  }

  if (error) {
    return (
      <AuthError
        error={error}
        title={t('redirectFailedTitle') || "Redirection Failed"}
        description={t('redirectFailedDescription')}
        showBackToLogin={true}
        showRetry={true}
        loginPath="/admin/login"
      />
    );
  }

  // Default loading state
  return <AuthLoadingState message={t('redirecting')} isFullScreen />;
} 