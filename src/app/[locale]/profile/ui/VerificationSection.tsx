'use client';

import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'flowbite-react';
import { createClient } from '@/lib/supabase/client';
import { HiExclamationCircle } from 'react-icons/hi';
import VerificationDocumentUploader from '@/components/profile/VerificationDocumentUploader';

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
  locale?: string;
}

/**
 * Client component that handles verification section in profile
 * Manages verification request status and displays the appropriate UI
 * 
 * @param props Component props
 * @returns Verification section UI
 */
export default function VerificationSection({
  isVerified,
  translations,
  userId}: VerificationSectionProps) {
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Check if user has a pending verification request
  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        const { data, error: apiError } = await supabase
          .from('latest_verification_requests')
          .select('status')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .single();
          
        if (apiError && apiError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw apiError;
        }
        
        setHasPendingRequest(!!data);
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
    // We handle the state update internally now
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <div className="p-5 flex items-center justify-center h-40">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Card className="shadow-md">
        <div className="p-5">
          <Alert color="failure" icon={HiExclamationCircle}>
            <span>{error}</span>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{translations.verifiedLabel}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isVerified
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {isVerified ? translations.verified : translations.notVerified}
            </span>
          </div>
        </div>

        {/* For users who are already verified, show verification status */}
        {isVerified ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {translations.verificationDescription.verified}
            </p>
          </div>
        ) : (
          /* For users not verified, show uploader or pending request status */
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex-1 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {translations.verificationDescription.notVerified}
              </p>
            </div>
            
            <VerificationDocumentUploader 
              isVerified={isVerified}
              hasPendingRequest={hasPendingRequest}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}
      </div>
    </Card>
  );
} 