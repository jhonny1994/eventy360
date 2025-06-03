/**
 * PaymentProofUpload
 * 
 * This component provides functionality for uploading payment proof documents.
 * It handles file selection, validation, and uploading to the server.
 * 
 * Features:
 * - File type and size validation
 * - Progress indication during upload
 * - Error and success messaging
 * - Integration with subscription cache for status updates
 * - Full RTL support
 * 
 * Standardized Patterns Used:
 * - useAuth: For Supabase client access and user information
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and rendering
 */

'use client';

import { useState, useRef } from 'react';
import { Button, Alert } from 'flowbite-react';
import { HiExclamationCircle, HiUpload } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import { clearSubscriptionCache } from '@/hooks/useSubscription';
import { useAuth } from '@/components/providers/AuthProvider';

interface PaymentProofUploadProps {
  paymentData: {
    amount: number;
    billing_period: string;
    payment_method_reported: string;
    reference_number?: string;
    payer_notes?: string;
  };
  onUploadSuccess?: (paymentId: string) => void;
  locale?: string; // Kept for backward compatibility but no longer used
}

export default function PaymentProofUpload({
  paymentData,
  onUploadSuccess
}: PaymentProofUploadProps) {
  const t = useTranslations('PaymentSection.PaymentProof');
  const actualLocale = useLocale();
  const isRtl = actualLocale === 'ar';
  const { supabase, user } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setError(null);
    setSuccessMessage(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(t('fileTypeError'));
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError(t('fileSizeError', { maxSize: 10 }));
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(t('noFileSelectedError'));
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('paymentData', JSON.stringify(paymentData));
      
      // Get auth token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setError(t('authError'));
        setUploading(false);
        return;
      }
      
      // Call the Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: formData,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Check for storage policy errors
        if (responseData.details?.includes('policy')) {
          throw new Error(t('uploadPolicyError'));
        }
        throw new Error(responseData.error || t('uploadError'));
      }
      
      // Success!
      setSuccessMessage(t('uploadSuccess'));
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear subscription cache to force refresh subscription data
      if (user?.id) {
        clearSubscriptionCache(user.id);
      }
      
      // Call onUploadSuccess callback with payment ID if provided
      if (onUploadSuccess && responseData.paymentId) {
        onUploadSuccess(responseData.paymentId);
      }
      
    } catch (err: unknown) {
      let errorMessage = t('uploadError');
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && (
        <Alert color="failure" icon={HiExclamationCircle}>
          <span>{error}</span>
        </Alert>
      )}
      
      {successMessage && (
        <Alert color="success">
          <span>{successMessage}</span>
        </Alert>
      )}
      
      <div className="flex flex-col">
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('fileRequirements')}
          </p>
        </div>
        
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
          <Button 
            color="primary" 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <div className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`} />
                {t('uploading')}
              </>
            ) : (
              <>
                <HiUpload className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                {t('uploadButton')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 