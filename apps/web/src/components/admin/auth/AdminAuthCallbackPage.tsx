'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';
import { AuthLoadingState, AuthError as AuthErrorComponent } from '@/components/admin/auth';

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('AdminAuth.CallbackPage');
  
  // Create Supabase client at component level using useMemo
  // This ensures we only create one instance per component lifecycle
  const supabase = useMemo(() => createClient(), []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [processedHash, setProcessedHash] = useState(false);
  const [attemptedMagicLinkAuth, setAttemptedMagicLinkAuth] = useState(false);

  const handleMagicLinkAuth = useCallback(async (hash: string) => {
    setIsLoading(true); 
    setRedirecting(true); 
    try {
      // No need to create client here, using the one from useMemo

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in') || '3600';
      const tokenType = hashParams.get('token_type') || 'bearer';
      
      if (!accessToken || !refreshToken) {
        throw new Error(t('invalidOrExpiredInvite'));
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
        throw new Error(t('unexpectedState'));
      }

      // Use the same client instance for this call too
      const { data: { user: verifiedUser }, error: getUserError } = await supabase.auth.getUser();

      if (getUserError || !verifiedUser) {
        throw new Error(getUserError ? (getUserError as AuthError).message : t('profileRetrievalError'));
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
  }, [router, supabase, t]);

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
  }, [processedHash, redirecting, attemptedMagicLinkAuth, searchParams, handleMagicLinkAuth]);

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

  }, [searchParams, redirecting, processedHash, attemptedMagicLinkAuth, locale, router]);


  if (isLoading && !error) {
    return <AuthLoadingState message={t('processingAuthentication')} isFullScreen />;
  }

  if (error) {
    return (
      <AuthErrorComponent
        error={error}
        title={t('errorTitle')}
        description={t('genericErrorDescription')}
        showBackToLogin={true}
        showRetry={true}
        loginPath={`/${locale}/admin/login`}
      />
    );
  }

  // Unexpected state - should never reach here under normal conditions
  return (
    <AuthErrorComponent
      error={t('unexpectedState')}
      title={t('unexpectedErrorTitle')}
      description={t('genericErrorDescription')}
      showBackToLogin={true}
      showRetry={true}
      loginPath={`/${locale}/admin/login`}
    />
  );
}