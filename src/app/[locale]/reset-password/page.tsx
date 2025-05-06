import { Link } from '@/i18n/navigation'; // Assuming this is your localized Link
import { getTranslations, getMessages } from 'next-intl/server'; // Import getMessages
import Image from 'next/image';
import ResetPasswordForm from './ui/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getTranslations(); // No namespace
  const messages = await getMessages(); // Get all messages

  // Extract only the namespaces needed by the form - NO LONGER NEEDED THIS WAY
  // const formMessages = {
  //   Auth: { ResetPasswordPage: messages.Auth?.ResetPasswordPage },
  //   Validations: messages.Validations,
  //   AriaLabels: messages.AriaLabels
  // };

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Reset Password Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
          {/* Logo */}
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

          <ResetPasswordForm messages={messages} /> {/* Pass full messages object */}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('Auth.ResetPasswordPage.passwordResetSuccessPrompt')}{' '}
            <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('Auth.ResetPasswordPage.loginLink')} 
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="/illustrations/forgot-password.svg" // Using the same illustration as forgot-password
            alt={t('Auth.ResetPasswordPage.illustrationAlt')} // Full path
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