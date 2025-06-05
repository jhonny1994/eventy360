'use client';

import { useState, useEffect } from 'react';
import { Alert } from 'flowbite-react';
import { HiExclamationCircle, HiDocumentDownload } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import type { Database } from '@/database.types';
import PaperDownloadButton from '@/components/repository/PaperDownloadButton';

// Extend the Paper type to include total_records, as it's added by the SQL function
type Paper = Database['public']['Functions']['discover_papers']['Returns'][0] & {
  total_records?: number;
  view_count?: number;
  download_count?: number;
};

interface PaperDownloadProps {
  paper: Paper;
  locale: string;
}

/**
 * Component to handle paper downloads with analytics tracking
 */
export default function PaperDownload({ paper, locale }: PaperDownloadProps) {
  const t = useTranslations('ResearchRepository.paperDetails');
  const [error, setError] = useState<string | null>(null);
  const isRtl = locale === 'ar';
  const [isReady, setIsReady] = useState(false);

  // Mark the component as ready on initial render
  useEffect(() => {
    // Use a small timeout to prevent flash of loading state
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle errors from the download button
  const handleError = (err: Error) => {
    console.error('Download error:', err);
    setError(err.message);
  };

  // Don't render until ready
  if (!isReady) {
    return null;
  }
  
  if (!paper.full_paper_file_url) {
    return (
      <Alert color="warning" icon={HiExclamationCircle} className={isRtl ? 'text-right' : 'text-left'}>
        {t('noFileAvailable')}
      </Alert>
    );
  }
  
  // Get file metadata
  interface FileMetadata {
    name?: string;
    size?: number;
    contentType?: string;
    [key: string]: unknown;
  }
  
  const fileMetadata = paper.full_paper_file_metadata as FileMetadata | null;
  
  // Format file size if available
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const fileSize = formatFileSize(fileMetadata?.size);
  const fileName = fileMetadata?.name || t('paperFile');
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className={`mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          {error}
        </Alert>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3 sm:mb-0">
            <div className="flex-shrink-0">
              <HiDocumentDownload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{fileName}</h3>
              {fileSize && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fileSize} • {fileMetadata?.contentType || 'application/pdf'}
                </p>
              )}
            </div>
          </div>
          
        <PaperDownloadButton
          submissionId={paper.id}
          fileUrl={paper.full_paper_file_url}
          fileMetadata={fileMetadata}
          locale={locale}
            showFileName={false}
          color="info"
            size="lg"
            className="w-full sm:w-auto"
          onError={handleError}
        />
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {t('downloadDisclaimer')}
      </div>
    </div>
  );
} 