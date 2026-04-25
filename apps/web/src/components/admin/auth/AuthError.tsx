'use client';

import { Alert, Button } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface AuthErrorProps {
  error: string;
  title?: string;
  description?: string;
  showBackToLogin?: boolean;
  showRetry?: boolean;
  loginPath?: string;
}

/**
 * Standardized error component for admin authentication pages
 * Shows an error alert with title, message, and action buttons
 */
export default function AuthError({
  error,
  title,
  description,
  showBackToLogin = true,
  showRetry = true,
  loginPath = '/admin/login'
}: AuthErrorProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'ar';
  const t = useTranslations('Common');
  
  const errorTitle = title || t('unexpectedErrorAlertTitle');
  const errorDescription = description || t('genericErrorAlertDescription');
  
  // Ensure login path includes locale
  const getLocaleLoginPath = () => {
    // If loginPath already includes the locale or is a full URL, return as is
    if (loginPath.startsWith(`/${locale}/`) || loginPath.includes('://')) {
      return loginPath;
    }
    // Otherwise add the locale prefix
    return `/${locale}${loginPath.startsWith('/') ? loginPath : `/${loginPath}`}`;
  };

  return (
    <div className="w-full">
      <Alert color="failure" icon={HiInformationCircle} className="mb-4">
        <div className="font-medium">{errorTitle}</div>
        <div className="mt-1 text-sm">{error}</div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {errorDescription}
        </div>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        {showRetry && (
          <Button 
            onClick={() => window.location.reload()}
            color="primary"
            className="sm:flex-1"
          >
            {t('tryAgain')}
          </Button>
        )}
        
        {showBackToLogin && (
          <Button 
            onClick={() => router.push(getLocaleLoginPath())}
            color="gray"
            className="sm:flex-1"
          >
            {t('backToAdminLoginButton')}
          </Button>
        )}
      </div>
    </div>
  );
} 