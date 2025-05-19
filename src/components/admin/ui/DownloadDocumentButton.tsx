'use client';

import { useState, useCallback } from 'react';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import { HiDownload, HiExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';

interface DownloadDocumentButtonProps {
  documentPath: string;
  translations: {
    download: string;
    downloading: string;
    downloadError: string;
    documentNotFound: string;
  };
  variant?: 'default' | 'icon' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A button component specifically for downloading verification documents
 * Handles path parsing and direct file downloads from Supabase storage
 */
export default function DownloadDocumentButton({
  documentPath,
  translations,
  variant = 'default',
  size = 'sm',
  className = ''
}: DownloadDocumentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const downloadDocument = useCallback(async () => {
    if (!documentPath) {
      setError('Document path is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Parse the document path correctly
      let bucketName: string;
      let filePath: string;
      
      if (documentPath.startsWith('verification_documents/')) {
        bucketName = 'verification_documents';
        filePath = documentPath.substring('verification_documents/'.length);
      } else if (documentPath.includes('/')) {
        const firstSlashIndex = documentPath.indexOf('/');
        bucketName = documentPath.substring(0, firstSlashIndex);
        filePath = documentPath.substring(firstSlashIndex + 1);
      } else {
        throw new Error('Invalid document path format');
      }

      console.log(`Downloading from bucket: ${bucketName}, path: ${filePath}`);
      
      // Download the file directly
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);
        
      if (error) {
        console.error("Storage download error:", error);
        if (error.message.includes('Not Found')) {
          throw new Error(translations.documentNotFound || 'Document not found');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to download document');
      }
      
      // Create blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from path
      const filename = filePath.split('/').pop() || 'document';
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [documentPath, supabase, translations]);

  // Determine button appearance based on variant
  if (variant === 'icon') {
    return (
      <Tooltip content={error || translations.download}>
        <Button
          size={size}
          color={error ? "failure" : "light"}
          onClick={downloadDocument}
          disabled={loading}
          className={className}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : error ? (
            <HiExclamationCircle className="h-5 w-5" />
          ) : (
            <HiDownload className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={downloadDocument}
        disabled={loading}
        className={`text-blue-600 hover:text-blue-800 underline font-medium inline-flex items-center ${className}`}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            <span>{translations.downloading}</span>
          </>
        ) : (
          <>
            <HiDownload className="h-4 w-4 mr-1" />
            <span>{translations.download}</span>
          </>
        )}
      </button>
    );
  }

  // Default button style
  return (
    <Button
      size={size}
      color={error ? "failure" : "primary"}
      onClick={downloadDocument}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          <span>{translations.downloading}</span>
        </>
      ) : error ? (
        <>
          <HiExclamationCircle className="mr-2 h-5 w-5" />
          <span>{translations.downloadError}</span>
        </>
      ) : (
        <>
          <HiDownload className="mr-2 h-5 w-5" />
          <span>{translations.download}</span>
        </>
      )}
    </Button>
  );
} 