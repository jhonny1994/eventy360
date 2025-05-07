'use client';

import { useEffect, useState } from 'react';
import { Spinner, Alert, Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiInformationCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';

/**
 * RedirectPage
 * 
 * A central redirection component that determines where to send users based on their
 * authentication state and profile completion status.
 * 
 * The page performs the following checks in order:
 * 1. If user is not authenticated → Login page
 * 2. If email is not confirmed → Email confirmation page
 * 3. If profile is not complete → Profile completion page
 * 4. Otherwise → Profile page
 */
export default function RedirectPage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [redirectSource, setRedirectSource] = useState<string | null>(null);
  
  // Tracking state to prevent redirect loops
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Check for URL parameters that might indicate where we're coming from
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authAction = params.get('auth_action');
      const errorParam = params.get('error');
      
      if (authAction === 'email_confirmed') {
        setRedirectSource('email_confirmation');
      } else if (errorParam) {
        const errorDesc = params.get('error_description');
        setError(errorDesc || errorParam);
        setDebugInfo({ errorSource: 'url_parameter', error: errorParam, description: errorDesc });
        setIsLoading(false); // Stop loading when there's an error from URL
        setRedirectAttempted(true); // Prevent auto-redirect
      }
    }
  }, []);
  
  // Determine redirect destination based on user state
  useEffect(() => {
    // Skip if:
    // 1. We've already attempted a redirect in this session, or
    // 2. Auth is still loading, or
    // 3. There's already an error from URL parameters
    if (redirectAttempted || authLoading || error) {
      return;
    }
    
    async function handleRedirect() {
      try {
        // Not logged in → Login page
        if (!user) {
          console.log('RedirectPage: No authenticated user, redirecting to login');
          router.push('/login');
          return;
        }
        
        // Email not confirmed → Confirmation page
        if (!user.email_confirmed_at) {
          console.log('RedirectPage: Email not confirmed, redirecting to confirm-email');
          router.push('/confirm-email');
          return;
        }
        
        // Check profile completion status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_extended_profile_complete')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('RedirectPage: Error fetching profile', profileError);
          setError(profileError.message);
          setDebugInfo({ 
            error: profileError.message, 
            user: { 
              id: user.id, 
              emailConfirmed: !!user.email_confirmed_at 
            }
          });
          setIsLoading(false);
          // Do not attempt redirect when showing an error
          return;
        }
        
        // Profile not complete → Profile completion page
        if (!profile || !profile.is_extended_profile_complete) {
          console.log('RedirectPage: Profile not complete, redirecting to profile completion');
          router.push('/complete-profile');
          return;
        }
        
        // All checks passed → Profile page
        console.log('RedirectPage: All checks passed, redirecting to profile');
        router.push('/profile');
      } catch (err) {
        // Unexpected error handling
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during redirect';
        console.error('RedirectPage: Unexpected error', errorMessage);
        setError(errorMessage);
        setDebugInfo({ error: errorMessage, user: user ? { id: user.id } : null });
        setIsLoading(false);
        // Do not attempt redirect when showing an error
      } finally {
        // Mark that we've attempted a redirect
        setRedirectAttempted(true);
        
        // Only set isLoading to false when there's an error
        // For successful redirects, the loading state will be interrupted by the navigation
        if (error) {
        setIsLoading(false);
        }
      }
    }
    
    // Small delay to ensure auth state is settled - slightly longer if we're coming from email confirmation
    // since the session might take a moment to update
    const delayTime = redirectSource === 'email_confirmation' ? 1000 : 500;
    const timeoutId = setTimeout(() => {
      handleRedirect();
    }, delayTime);
    
    return () => clearTimeout(timeoutId);
  }, [user, authLoading, supabase, router, redirectAttempted, redirectSource, error]);
  
  // Function for manual redirect attempt
  const handleManualRedirect = () => {
    setRedirectAttempted(false);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
  };
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      {isLoading ? (
        <>
          <Spinner aria-label={t('redirecting')} size="xl" />
          <p className="mt-4 text-lg">
            {redirectSource === 'email_confirmation' 
              ? t('emailConfirmedRedirecting')
              : t('redirecting')}...
          </p>
        </>
      ) : (
        <>
          <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-4 max-w-lg">
            <span className="font-medium">{t('redirectFailed')}</span>
            {error && <p className="mt-2">{error}</p>}
            <p className="mt-2">{t('redirectFailedDescription')}</p>
          </Alert>
          
          {debugInfo && process.env.NODE_ENV === 'development' && (
            <Alert color="warning" icon={HiInformationCircle} className="mb-4 max-w-lg">
              <span className="font-medium">{t('debugInformation')}:</span>
              <div className="mt-3 text-xs overflow-auto max-h-32 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={handleManualRedirect} color="primary">
              {t('tryAgain')}
            </Button>
            <Button onClick={() => router.push('/login')} color="gray">
              {t('backToLogin')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 