'use client';

import { useEffect, useState } from 'react';
import { Spinner, Alert, Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiInformationCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';

export default function RedirectPage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();


  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [redirectSource, setRedirectSource] = useState<string | null>(null);


  const [redirectAttempted, setRedirectAttempted] = useState(false);


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
        setIsLoading(false);
        setRedirectAttempted(true);
      }
    }
  }, []);


  useEffect(() => {




    if (redirectAttempted || authLoading || error) {
      return;
    }

    async function handleRedirect() {
      try {

        if (!user) {
          router.push('/login');
          return;
        }


        if (!user.email_confirmed_at) {
          router.push('/confirm-email');
          return;
        }


        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_extended_profile_complete')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
          setDebugInfo({
            error: profileError.message,
            user: {
              id: user.id,
              emailConfirmed: !!user.email_confirmed_at
            }
          });
          setIsLoading(false);

          return;
        }


        if (!profile || !profile.is_extended_profile_complete) {
          router.push('/complete-profile');
          return;
        }


        router.push('/profile');
      } catch (err) {

        const errorMessage = err instanceof Error ? err.message : 'Unknown error during redirect';
        setError(errorMessage);
        setDebugInfo({ error: errorMessage, user: user ? { id: user.id } : null });
        setIsLoading(false);

      } finally {

        setRedirectAttempted(true);



        if (error) {
          setIsLoading(false);
        }
      }
    }



    const delayTime = redirectSource === 'email_confirmation' ? 1000 : 500;
    const timeoutId = setTimeout(() => {
      handleRedirect();
    }, delayTime);

    return () => clearTimeout(timeoutId);
  }, [user, authLoading, supabase, router, redirectAttempted, redirectSource, error]);


  const handleManualRedirect = () => {
    setRedirectAttempted(false);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-6">
      {isLoading ? (
        <>
          <Spinner aria-label={t('redirecting')} size="xl" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {redirectSource === 'email_confirmation'
              ? t('emailConfirmedRedirecting')
              : t('redirecting')}...
          </p>
        </>
      ) : (
        <>
          <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-6 w-full max-w-lg">
            <h3 className="text-lg font-medium">
              {t('redirectFailedTitle') || t('redirectFailed')} 
            </h3>
            {error && <p className="mt-1 text-sm">{error}</p>}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('redirectFailedDescription') || "Please try again or return to the login page."}
            </p>
          </Alert>

          {debugInfo && process.env.NODE_ENV === 'development' && (
            <Alert color="warning" icon={HiInformationCircle} className="mb-4 max-w-lg">
              <span className="font-medium">{t('debugInformation')}:</span>
              <div className="mt-3 text-xs overflow-auto max-h-32 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </Alert>
          )}

          <div className="mt-4 flex w-full max-w-xs flex-col gap-3 sm:flex-row">
            <Button onClick={handleManualRedirect} color="primary" fullSized>
              {t('tryAgain')}
            </Button>
            <Button onClick={() => router.push('/login')} color="gray" fullSized>
              {t('backToLogin')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 