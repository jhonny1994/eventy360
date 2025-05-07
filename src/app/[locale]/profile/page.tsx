'use client'; // Or remove if no client-side interactions planned initially

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage'); // Basic translation
  const { user, loading } = useAuth();

  // useEffect(() => {
  //   console.log('[ProfilePage] User:', user);
  //   console.log('[ProfilePage] Loading:', loading);
  // }, [user, loading]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p>{t('welcome', { email: user?.email || 'User' })}</p>
      <p>User ID: {user?.id}</p>
      <p>Email Confirmed At: {user?.email_confirmed_at}</p>
      {/* We will add more profile details here later */}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
} 