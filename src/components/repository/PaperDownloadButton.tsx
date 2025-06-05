'use client';

import { useState } from 'react';
import { Button, Alert, Tooltip } from 'flowbite-react';
import { HiDownload, HiExclamationCircle, HiLockClosed } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { trackPaperDownload } from '@/lib/repository/trackPaperDownload';

interface FileMetadata {
  name?: string;
  size?: number;
  contentType?: string;
  [key: string]: unknown;
}

interface PaperDownloadButtonProps {
  submissionId: string;
  fileUrl?: string | null;
  fileMetadata?: FileMetadata | null;
  buttonText?: string;
  loadingText?: string;
  showFileName?: boolean;
  locale: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'failure' | 'light' | 'dark';
  icon?: boolean;
  requireSubscription?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Reusable component for downloading papers with analytics tracking
 */
export default function PaperDownloadButton({
  submissionId,
  fileUrl,
  fileMetadata,
  buttonText,
  loadingText,
  showFileName = false,
  locale,
  className = '',
  size = 'md',
  color = 'info',
  icon = true,
  requireSubscription = true,
  onSuccess,
  onError
}: PaperDownloadButtonProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository.paperDetails');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { supabase, session } = useAuth();
  const { hasAccess, loading: isCheckingSubscription } = useSubscriptionCheck();
  
  // Determine if user can download
  const canDownload = !requireSubscription || hasAccess;
  
  // Format file size for display
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Get file name and size
  const fileName = fileMetadata?.name || t('paperFile');
  const fileSize = fileMetadata?.size 
    ? formatFileSize(fileMetadata.size) 
    : t('unknownSize');
  
  const handleDownload = async () => {
    if (!fileUrl) {
      const err = new Error(t('noFileAvailable'));
      setError(t('noFileAvailable'));
      onError?.(err);
      return;
    }
    
    if (!session) {
      // Redirect to login would be handled by parent component
      const err = new Error('Authentication required');
      setError(t('loginRequired'));
      onError?.(err);
      return;
    }
    
    if (requireSubscription && !canDownload) {
      const err = new Error('Subscription required');
      setError(t('subscriptionRequired'));
      onError?.(err);
      return;
    }
    
    setIsDownloading(true);
    setError(null);
    
    try {
      // Track download event
      await trackPaperDownload(supabase, submissionId);
      
      // Open file in new tab (or trigger download)
      window.open(fileUrl, '_blank');
      
      // Call success callback if provided
      onSuccess?.();
    } catch (err) {
      console.error('Download error:', err);
      setError(t('downloadTrackingError'));
      onError?.(err as Error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Button text based on state
  const displayText = isDownloading 
    ? (loadingText || t('downloading')) 
    : (buttonText || t('downloadPaper'));
  
  // If subscription check is still loading, show loading state
  if (requireSubscription && isCheckingSubscription) {
    return (
      <Button 
        color="light"
        disabled
        className={className}
        size={size}
      >
        {t('loading')}
      </Button>
    );
  }
  
  // If subscription is required but user doesn't have access
  if (requireSubscription && !canDownload) {
    return (
      <Tooltip content={t('subscriptionRequired')}>
        <Button
          color="light"
          disabled
          className={className}
          size={size}
        >
          <HiLockClosed className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
          {t('premiumFeature')}
        </Button>
      </Tooltip>
    );
  }
  
  // If no file URL is available
  if (!fileUrl) {
    return (
      <Alert color="warning" icon={HiExclamationCircle} className={isRtl ? 'text-right' : 'text-left'}>
        {t('noFileAvailable')}
      </Alert>
    );
  }
  
  return (
    <div className={`${showFileName ? 'space-y-2' : ''} ${isRtl ? 'text-right' : 'text-left'}`}>
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className={`mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          {error}
        </Alert>
      )}
      
      {showFileName && (
        <div className={`text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
          <p className="font-medium">{fileName}</p>
          <p className="text-gray-500">{fileSize}</p>
        </div>
      )}
      
      <Button
        color={color}
        onClick={handleDownload}
        disabled={isDownloading}
        className={`${isRtl ? 'flex-row-reverse' : ''} ${className}`}
        size={size}
      >
        {icon && <HiDownload className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />}
        {displayText}
      </Button>
    </div>
  );
} 