'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { Spinner, Alert, Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('AdminAuth.CallbackPage');
  const tCommon = useTranslations('Common');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [processedHash, setProcessedHash] = useState(false);
  const [attemptedMagicLinkAuth, setAttemptedMagicLinkAuth] = useState(false);

  useEffect(() => {
    if (processedHash || redirecting || attemptedMagicLinkAuth) return;
    
    const currentHash = window.location.hash;
    const hasHash = currentHash && currentHash.length > 1;
    const hasAccessTokenInHash = hasHash && currentHash.includes('access_token');

    if (hasAccessTokenInHash) {
      setAttemptedMagicLinkAuth(true);
      handleMagicLinkAuth(currentHash);
    } else {
      setProcessedHash(true); 
    }
  }, [processedHash, redirecting, attemptedMagicLinkAuth, searchParams]);

  const handleMagicLinkAuth = async (hash: string) => {
    setIsLoading(true); 
    setRedirecting(true); 
    try {
      const supabase = createClient();

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in') || '3600';
      const tokenType = hashParams.get('token_type') || 'bearer';
      
      if (!accessToken || !refreshToken) {
        throw new Error('Magic link tokens (access or refresh) missing from URL hash');
      }
      
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: sessionDataFromSet, error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (setSessionError) {
        throw new Error(`Failed to set session: ${setSessionError.message}`);
      }
      if (!sessionDataFromSet?.session || !sessionDataFromSet?.user) {
        throw new Error('setSession did not return a session or user object, though no error was thrown.');
      }

      const verificationClient = createClient();
      const { data: { user: verifiedUser }, error: getUserError } = await verificationClient.auth.getUser();

      if (getUserError || !verifiedUser) {
        throw new Error(getUserError ? (getUserError as AuthError).message : 'Get user verification failed after setSession');
      }
      
      const lsKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host.split('.')[0]}-auth-token`;
      const lsSessionData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: verifiedUser, 
        expires_in: parseInt(expiresIn, 10),
        expires_at: Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10),
        token_type: tokenType,
      };
      localStorage.setItem(lsKey, JSON.stringify(lsSessionData));
      
      window.dispatchEvent(new StorageEvent('storage', { key: lsKey, newValue: JSON.stringify(lsSessionData), storageArea: localStorage }));

      await new Promise(resolve => setTimeout(resolve, 300)); 

      router.replace({
        pathname: `/admin/redirect`,
        query: { 
          auth_action: 'admin_invite_accepted',
          source: 'magic_link_processed',
          uid: verifiedUser.id,
          ts: Date.now().toString()
        }
      });

    } catch (err) {
      const typedError = err as AuthError;
      setError(typedError.message || 'Error processing magic link.');
      setIsLoading(false);
      setRedirecting(false); 
    }
  };

  useEffect(() => {
    if (redirecting || attemptedMagicLinkAuth || !processedHash ) {
      return;
    }
    
    setIsLoading(true); 

    const errorParam = searchParams.get('error');
    const sourceParam = searchParams.get('source');

    if (errorParam) {
      const errorDesc = searchParams.get('error_description') || 'Auth error from URL params';
      setError(`${errorParam}: ${errorDesc}`);
      setIsLoading(false);
      return;
    }
    
    if (sourceParam === 'route_handler_pass_through') {
        setError('Authentication callback received no valid method (no code, no magic link).');
        setIsLoading(false);
        return;
    }

    router.replace(`/admin/redirect`);

  }, [searchParams, redirecting, processedHash, attemptedMagicLinkAuth, locale]);


  if (isLoading && !error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
        <Spinner aria-label={tCommon('loading')} size="xl" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t('processingAuthentication')}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
        <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-6 w-full max-w-lg">
          <h3 className="text-lg font-medium">
            {t('errorTitle') || "Authentication Failed"}
          </h3>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('genericErrorDescription') || "Please try again or return to the login page."}
          </p>
        </Alert>
        <div className="flex w-full max-w-xs flex-col gap-3 sm:flex-row">
          <Button onClick={() => window.location.reload()} color="primary" fullSized>
            {tCommon('tryAgain')}
          </Button>
          <Button onClick={() => router.push('/admin/login')} color="gray" fullSized> 
            {tCommon('backToAdminLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
      <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-6 w-full max-w-lg">
        <h3 className="text-lg font-medium">
          {t('unexpectedErrorTitle') || "An Unexpected Error Occurred"}
        </h3>
        <p className="mt-1 text-sm">{t('unexpectedState')}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('genericErrorDescription') || "Please try again or return to the login page."}
        </p>
      </Alert>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:flex-row">
        <Button onClick={() => window.location.reload()} color="primary" fullSized>
          {tCommon('tryAgain')}
        </Button>
        <Button onClick={() => router.push('/admin/login')} color="gray" fullSized>
          {tCommon('backToAdminLogin')}
        </Button>
      </div>
    </div>
  );
} 