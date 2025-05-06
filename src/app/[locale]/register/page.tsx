'use client';

import RegisterForm from '../ui/auth/RegisterForm';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function RegisterPage() {
  const t = useTranslations('Auth.RegisterPage'); // Use RegisterPage namespace

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Registration Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center text-3xl font-bold text-primary dark:text-primary-400">
            EVENTY360
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('title')}
          </h2>

          <RegisterForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('haveAccountPrompt')}{' '}
            <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('loginLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          {/* Use signup.svg illustration */}
          <Image
            src="/illustrations/signup.svg" // Use signup illustration
            alt={t('illustrationAlt')} // Use translation for alt text
            width={500} 
            height={500} 
            priority 
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
} 