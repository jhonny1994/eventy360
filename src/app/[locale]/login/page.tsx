import LoginForm from './ui/LoginForm';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function LoginPage() {
  const t = await getTranslations('Auth.LoginPage');

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/png/logo.png"
              alt={t('logoAltText')}
              width={180}
              height={60}
              priority
              className="mx-auto"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('title')}
          </h2>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('noAccountPrompt')}{' '}
            <Link href="/register" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('registerLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      {/* Apply a light blue background, adjust as needed */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          {/* Use the login.svg illustration */}
          <Image
            src="/illustrations/login.svg"
            alt={t('illustrationAlt')}
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