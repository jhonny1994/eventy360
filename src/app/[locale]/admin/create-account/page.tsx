import AdminCreateAccountForm from './ui/AdminCreateAccountForm';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
// Import Link if a link to login page is needed, e.g.:
// import { Link } from '@/i18n/navigation';

export default async function AdminCreateAccountPage() {
  const t = await getTranslations('AdminAuth.CreateAccountPage');

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/png/logo.png" // Assuming admin uses the same logo
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

          <AdminCreateAccountForm />

          {/* Optional: Link back to admin login page if helpful */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('alreadySetupPrompt')}{' '}
            <Link href="/admin/login" className="font-semibold leading-6 text-primary hover:text-primary/90">
              {t('adminLoginLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="/illustrations/signup.svg" // Reusing signup.svg for now, can be changed
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