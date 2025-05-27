'use client';

import { useState, useEffect } from 'react';
import { Spinner, Alert, Badge } from 'flowbite-react';
import { createClient } from '@/lib/supabase/client';
import { HiExclamationCircle, HiShieldCheck, HiShieldExclamation } from 'react-icons/hi';
import VerificationDocumentUploader from '@/components/profile/VerificationDocumentUploader';
import { useLocale } from 'next-intl';

interface VerificationSectionProps {
  isVerified: boolean;
  translations: {
    verified: string;
    notVerified: string;
    verifiedLabel: string;
    verificationDescription: {
      verified: string;
      notVerified: string;
    };
    requestVerification: string;
    verificationStatusError?: string;
  };
  userId: string;
  locale?: string; // Kept for backward compatibility
}

/**
 * Client component that handles verification section in profile
 * Manages verification request status and displays the appropriate UI
 * Enhanced with RTL support and improved styling
 * Uses the application's locale context for consistent RTL behavior
 * 
 * @param props Component props
 * @returns Verification section UI
 */
export default function VerificationSection({
  isVerified,
  translations,
  userId,
}: VerificationSectionProps) {
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appLocale = useLocale();
  const isRtl = appLocale === 'ar';
  
  const supabase = createClient();

  // Check if user has a pending verification request
  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        const { data, error: apiError } = await supabase
          .from('latest_verification_requests')
          .select('id, status') // Keep this selection
          .eq('user_id', userId)
          .eq('status', 'pending'); // Removed .single()
          
        if (apiError) { // No need to check for PGRST116 specifically if not using .single()
          throw apiError;
        }
        
        // If data is an array, check if it's not empty
        setHasPendingRequest(Array.isArray(data) && data.length > 0);
      } catch (err) {
        console.error('Error checking pending verification request:', err);
        setError(translations.verificationStatusError || 'Failed to check verification status');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!isVerified) {
      checkPendingRequest();
    } else {
      setIsLoading(false);
    }
  }, [supabase, userId, isVerified, translations]);

  // Internal handler for upload success - no need for external callback
  const handleUploadSuccess = () => {
    setHasPendingRequest(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="lg" aria-label="Loading verification status..." />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        <span>{error}</span>
      </Alert>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{translations.verifiedLabel}</h2>
          {isVerified ? (
            <Badge color="success" className="px-3 py-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <HiShieldCheck className="h-4 w-4" />
                <span>{translations.verified}</span>
              </div>
            </Badge>
          ) : (
            <Badge color="warning" className="px-3 py-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <HiShieldExclamation className="h-4 w-4" />
                <span>{translations.notVerified}</span>
              </div>
            </Badge>
          )}
        </div>
      </div>
      {/* For users who are already verified, show verification status */}
      {isVerified ? (
        <div className={`bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800`}>
          <p className="text-green-700 dark:text-green-300">
            {translations.verificationDescription.verified}
          </p>
        </div>
      ) : (
        /* For users not verified, show uploader or pending request status */
        (<div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700`}>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {translations.verificationDescription.notVerified}
            </p>
          </div>
          <VerificationDocumentUploader 
            isVerified={isVerified}
            hasPendingRequest={hasPendingRequest}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>)
      )}
    </div>
  );
}