'use client';

import { useTranslations } from 'next-intl';
import { Spinner } from 'flowbite-react';

export default function AuthConfirmPage() {
  const t = useTranslations('Auth.ConfirmEmailPage');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('processingRequest')}</p>
      </div>
    </div>
  );
} 