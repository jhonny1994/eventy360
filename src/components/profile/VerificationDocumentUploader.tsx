'use client';

import { useState, useRef } from 'react';
import { Button, Card, Alert } from 'flowbite-react';
import { HiExclamationCircle, HiUpload, HiDocumentText } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

interface VerificationDocumentUploaderProps {
  isVerified: boolean;
  hasPendingRequest: boolean;
  onUploadSuccess?: () => void;
}

export default function VerificationDocumentUploader({
  isVerified,
  hasPendingRequest,
  onUploadSuccess
}: VerificationDocumentUploaderProps) {
  const t = useTranslations('ProfilePage.VerificationDocument');
  const supabase = createClient();
  
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
      
      // Get auth token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        setError(t('authError'));
        setUploading(false);
        return;
      }
      
      // Call the Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-verification-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('uploadError'));
      }
      
      // Success - we don't need the returned data
      await response.json();
      
      // Success!
      setSuccessMessage(t('uploadSuccess'));
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (err: unknown) {
      console.error('Error uploading verification document:', err);
      let errorMessage = t('uploadError');
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // If the user is already verified, show a success message
  if (isVerified) {
    return (
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <HiDocumentText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('alreadyVerified')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('verifiedDescription')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // If there's a pending verification request
  if (hasPendingRequest) {
    return (
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <HiDocumentText className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('pendingVerification')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('pendingDescription')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {t('uploadTitle')}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('uploadDescription')}
      </p>
      
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          <span>{error}</span>
        </Alert>
      )}
      
      {successMessage && (
        <Alert color="success" className="mb-4">
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
        
        <div className="flex justify-end">
          <Button 
            color="primary" 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                {t('uploading')}
              </>
            ) : (
              <>
                <HiUpload className="mr-2 h-5 w-5" />
                {t('uploadButton')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
} 