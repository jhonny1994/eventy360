import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ResetPasswordForm from './ui/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <Image
              src="/png/logo.png"
              alt={t('Auth.ResetPasswordPage.logoAltText')}
              width={180}
              height={60}
              priority
              className="mx-auto"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('Auth.ResetPasswordPage.title')}
          </h2>

          <ResetPasswordForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('Auth.ResetPasswordPage.passwordResetSuccessPrompt')}{' '}
            <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('Auth.ResetPasswordPage.loginLink')}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="/illustrations/forgot-password.svg"
            alt={t('Auth.ResetPasswordPage.illustrationAlt')}
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