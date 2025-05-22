'use client';

import { useState, useCallback } from 'react';
import { Button, Spinner } from 'flowbite-react';
import { FiDownload, FiX } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';

interface DownloadDocumentButtonProps {
  documentPath: string | null;
  translations: {
    download: string;
    downloading: string;
    downloadError: string;
    retry: string;
  };
  variant?: 'default' | 'icon' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  locale?: string;
}

/**
 * Button to download documents from Supabase storage
 * Supports RTL languages with proper icon positioning
 */
export default function DownloadDocumentButton({
  documentPath,
  translations,
  variant = 'default',
  size = 'sm',
  className = '',
  locale = 'en'
}: DownloadDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRtl = locale === 'ar';

  const downloadDocument = useCallback(async () => {
    if (!documentPath) {
      setError('No document path provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse the document path to extract bucket and file path
      const pathParts = documentPath.split('/');
      if (pathParts.length < 2) {
        throw new Error('Invalid document path format');
      }

      // The first part is the bucket name, the rest is the file path
      const bucketName = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      const supabase = createClient();
      
      // Get the file data
      const { data, error: downloadError } = await supabase
        .storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) {
        throw new Error(downloadError.message);
      }

      if (!data) {
        throw new Error('No data returned from storage');
      }

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'document'; // Use filename or default
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [documentPath]);

  // Don't render anything if there's no document
  if (!documentPath) {
    return null;
  }

  // Default variant - regular button
  if (variant === 'default') {
    return (
      <Button
        size={size}
        color={error ? 'failure' : 'light'}
        onClick={error ? () => setError(null) : downloadDocument}
        className={className}
        disabled={isLoading}
        title={error ? translations.downloadError : translations.download}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className={isRtl ? 'ml-2' : 'mr-2'} />
            <span>{translations.downloading}</span>
          </>
        ) : error ? (
          <>
            <FiX className={isRtl ? 'ml-2' : 'mr-2'} />
            <span>{translations.retry}</span>
          </>
        ) : (
          <>
            <FiDownload className={isRtl ? 'ml-2' : 'mr-2'} />
            <span>{translations.download}</span>
          </>
        )}
      </Button>
    );
  }

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <Button
        size={size}
        color={error ? 'failure' : 'light'}
        onClick={error ? () => setError(null) : downloadDocument}
        className={`p-2 ${className}`}
        disabled={isLoading}
        title={error ? translations.downloadError : translations.download}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : error ? (
          <FiX className="h-5 w-5" />
        ) : (
          <FiDownload className="h-5 w-5" />
        )}
      </Button>
    );
  }

  // Link variant
  return (
    <button
      onClick={error ? () => setError(null) : downloadDocument}
      className={`inline-flex items-center text-blue-600 hover:underline ${className}`}
      disabled={isLoading}
      title={error ? translations.downloadError : translations.download}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className={isRtl ? 'ml-2' : 'mr-2'} />
          <span>{translations.downloading}</span>
        </>
      ) : error ? (
        <>
          <FiX className={isRtl ? 'ml-2' : 'mr-2'} />
          <span>{translations.retry}</span>
        </>
      ) : (
        <>
          <FiDownload className={isRtl ? 'ml-2' : 'mr-2'} />
          <span>{translations.download}</span>
        </>
      )}
    </button>
  );
}