'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { Spinner, Alert, Button } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('AdminAuth.CallbackPage');
  const tCommon = useTranslations('Common');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [processedHash, setProcessedHash] = useState(false);
  const [attemptedMagicLinkAuth, setAttemptedMagicLinkAuth] = useState(false);

  useEffect(() => {
    if (processedHash || redirecting || attemptedMagicLinkAuth) return;
    
    const currentHash = window.location.hash;
    const hasHash = currentHash && currentHash.length > 1;
    const hasAccessTokenInHash = hasHash && currentHash.includes('access_token');

    setDebugInfo(prev => ({
      ...prev,
      initialHashCheck: {
        timestamp: new Date().toISOString(),
        hasHash,
        hasAccessTokenInHash,
        hashLength: currentHash.length,
        href: window.location.href.replace(/access_token=[^&]+/, 'access_token=REDACTED'),
        searchParamsFromPage: searchParams.toString()
      }
    }));

    if (hasAccessTokenInHash) {
      setAttemptedMagicLinkAuth(true);
      handleMagicLinkAuth(currentHash);
    } else {
      setProcessedHash(true); // No access_token in hash, proceed to other auth checks
    }
  }, [processedHash, redirecting, attemptedMagicLinkAuth, searchParams]);

  const handleMagicLinkAuth = async (hash: string) => {
    setIsLoading(true); // Ensure loading spinner is active
    setRedirecting(true); // Prevent other useEffect from running while this processes
    let stage = 'start';
    try {
      const supabase = createClient();
      stage = 'client_created';

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in') || '3600';
      const tokenType = hashParams.get('token_type') || 'bearer';
      stage = 'tokens_extracted';
      
      setDebugInfo(prev => ({ 
        ...prev, 
        handleMagicLinkAuth: {
          stage,
          accessTokenProvided: !!accessToken,
          accessTokenLength: accessToken?.length || 0,
          refreshTokenProvided: !!refreshToken,
          expiresIn,
          tokenType,
        }
      }));

      if (!accessToken || !refreshToken) {
        throw new Error('Magic link tokens (access or refresh) missing from URL hash');
      }
      
      // 1. Ensure no prior conflicting session state for THIS client instance
      await supabase.auth.signOut();
      stage = 'local_client_signed_out';
      setDebugInfo(prev => ({ ...prev, handleMagicLinkAuth: { ...prev.handleMagicLinkAuth as object, stage } }));
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause

      // 2. Attempt to set the new session
      const { data: sessionDataFromSet, error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      stage = 'set_session_attempted';
      setDebugInfo(prev => ({ 
        ...prev, 
        handleMagicLinkAuth: { 
          ...prev.handleMagicLinkAuth as object, 
          stage,
          setSessionError: setSessionError?.message || null,
          sessionUserFromSetSession: sessionDataFromSet?.user?.id || null,
          sessionExpiresAtFromSetSession: sessionDataFromSet?.session?.expires_at || null
        }
      }));

      if (setSessionError) {
        throw new Error(`Failed to set session: ${setSessionError.message}`);
      }
      if (!sessionDataFromSet?.session || !sessionDataFromSet?.user) {
        throw new Error('setSession did not return a session or user object, though no error was thrown.');
      }

      // 3. Verify user immediately after setting session
      // Use a new client instance to mimic what AuthProvider might do after a storage event
      const verificationClient = createClient();
      const { data: { user: verifiedUser }, error: getUserError } = await verificationClient.auth.getUser();
      stage = 'get_user_after_set_session';
      setDebugInfo(prev => ({ 
        ...prev, 
        handleMagicLinkAuth: { 
          ...prev.handleMagicLinkAuth as object, 
          stage, 
          getUserError: getUserError?.message || null, 
          verifiedUserId: verifiedUser?.id || null,
          verifiedUserEmail: verifiedUser?.email || null,
        }
      }));

      if (getUserError || !verifiedUser) {
        throw new Error(getUserError ? (getUserError as AuthError).message : 'Get user verification failed after setSession');
      }
      
      // 4. Manually update localStorage
      const lsKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host.split('.')[0]}-auth-token`;
      const lsSessionData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: verifiedUser, // Use the verified user data
        expires_in: parseInt(expiresIn, 10),
        expires_at: Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10),
        token_type: tokenType,
      };
      localStorage.setItem(lsKey, JSON.stringify(lsSessionData));
      stage = 'local_storage_updated';
      setDebugInfo(prev => ({ ...prev, handleMagicLinkAuth: { ...prev.handleMagicLinkAuth as object, stage, lsKeySet: lsKey } }));
      
      window.dispatchEvent(new StorageEvent('storage', { key: lsKey, newValue: JSON.stringify(lsSessionData), storageArea: localStorage }));
      stage = 'storage_event_dispatched';
      setDebugInfo(prev => ({ ...prev, handleMagicLinkAuth: { ...prev.handleMagicLinkAuth as object, stage } }));

      await new Promise(resolve => setTimeout(resolve, 300)); // Pause for event propagation
      stage = 'paused_post_storage_event';
      setDebugInfo(prev => ({ ...prev, handleMagicLinkAuth: { ...prev.handleMagicLinkAuth as object, stage } }));

      // 5. Redirect
      router.replace(`/ar/admin/redirect?auth_action=admin_invite_accepted&source=magic_link_processed&uid=${verifiedUser.id}&ts=${Date.now()}`);

    } catch (err) {
      const typedError = err as AuthError;
      setError(typedError.message || 'Error processing magic link.');
      setDebugInfo(prev => ({ 
        ...prev, 
        handleMagicLinkAuth: { 
          ...(prev.handleMagicLinkAuth || {}), 
          stage: `error_at_${stage}`,
          errorMessage: typedError.message,
          errorStack: typedError.stack 
        }
      }));
      setIsLoading(false);
      setRedirecting(false); // Allow error display
    }
    // Do not setProcessedHash here, as it might prevent retry if needed or cause loop with other useEffect
  };

  // Secondary useEffect for non-hash-based logic (e.g., from server-side redirect with params)
  useEffect(() => {
    if (redirecting || attemptedMagicLinkAuth || !processedHash ) {
      // If magic link auth was attempted, or is being attempted, or hash not yet marked processed, 
      // this effect should not run its main logic.
      return;
    }

    setIsLoading(true); // Assume loading if we reach here without prior error
    let stage = 'secondary_effect_start';
    setDebugInfo(prev => ({ ...prev, secondaryEffect: { stage } }));

    const errorParam = searchParams.get('error');
    const sourceParam = searchParams.get('source');

    if (errorParam) {
      stage = 'error_from_url';
      const errorDesc = searchParams.get('error_description') || 'Auth error from URL params';
      setError(`${errorParam}: ${errorDesc}`);
      setDebugInfo(prev => ({ ...prev, secondaryEffect: { stage, errorParam, errorDesc } }));
          setIsLoading(false);
          return;
        }

    // If this page is reached via `route_handler_pass_through` from its own route.ts,
    // it means no PKCE code was found, and it's up to this client page to check hash (which the first useEffect does).
    // If the first useEffect decided there's no magic link in hash, it sets processedHash = true.
    // So if we are here, and source is `route_handler_pass_through`, it implies no magic link, no PKCE.
    if (sourceParam === 'route_handler_pass_through') {
        stage = 'pass_through_no_magic_link';
        setError('Authentication callback received no valid method (no code, no magic link).');
        setDebugInfo(prev => ({ ...prev, secondaryEffect: { stage, sourceParam }}));
          setIsLoading(false);
          return;
        }

    // Default: if no specific errors or magic link, redirect to admin/redirect for state check.
    stage = 'default_redirect_to_admin_redirect';
    setDebugInfo(prev => ({ ...prev, secondaryEffect: { stage } }));
    router.replace('/ar/admin/redirect');

  }, [searchParams, redirecting, processedHash, attemptedMagicLinkAuth]);


  if (isLoading && !error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <Spinner aria-label={tCommon('loading')} size="xl" />
        <p className="mt-4 text-lg">{t('processingAuthentication')}...</p>
        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs max-w-lg w-full overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-4 max-w-md">
          <h3 className="text-lg font-medium">{t('errorTitle')}</h3>
          <p>{error}</p>
        </Alert>
        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 mb-4 p-3 bg-gray-100 rounded text-xs max-w-lg w-full overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <Button onClick={() => router.push('/ar/admin/login')} color="primary">
          {tCommon('goToLoginPage', { pageName: t('adminLoginPageName') })}
        </Button>
      </div>
    );
  }

  // Fallback if no loading and no error, but redirect hasn't happened (should be rare)
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <p>Finalizing authentication...</p>
       {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs max-w-lg w-full overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
    </div>
  );
} 