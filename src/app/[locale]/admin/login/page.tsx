import AdminLoginForm from './ui/AdminLoginForm';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function AdminLoginPage() {
  const t = await getTranslations('AdminAuth.LoginPage');

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

          <AdminLoginForm />
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
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