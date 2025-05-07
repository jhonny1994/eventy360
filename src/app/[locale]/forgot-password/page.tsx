import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ForgotPasswordForm from './ui/ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Forgot Password Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/png/logo.png"
              alt={t('Auth.ForgotPasswordPage.logoAltText')}
              width={180}
              height={60}
              priority
              className="mx-auto"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('Auth.ForgotPasswordPage.title')}
          </h2>

          <ForgotPasswordForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('Auth.ForgotPasswordPage.rememberPasswordPrompt')}{' '}
            <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('Auth.ForgotPasswordPage.loginLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          {/* Use the specified illustration for forgot password */}
          {/* Assuming illustration is named 'forgot-password.svg', confirm filename */}
          <Image
            src="/illustrations/forgot-password.svg"
            alt={t('Auth.ForgotPasswordPage.illustrationAlt')}
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