import LoginForm from '../ui/auth/LoginForm';
import { Link } from '@/i18n/navigation'; // Use localized Link
import { useTranslations } from 'next-intl';
import Image from 'next/image'; // Import the Image component

export default function LoginPage() {
  const t = useTranslations('Auth.LoginPage');

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Login Form */}
      {/* Ensure this column takes the standard background color */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center text-3xl font-bold text-primary dark:text-primary-400">
            EVENTY360
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('title')}
          </h2>

          {/* Remove the card wrapper around the form */}
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
            src="/illustrations/login.svg" // Use the correct filename
            alt={t('illustrationAlt')} // Use translation for alt text
            width={500} // Adjust if needed based on SVG viewbox
            height={500} // Adjust if needed based on SVG viewbox
            priority // Load image sooner
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
} 