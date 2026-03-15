import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('Common');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-8 max-w-md w-full">
        <h1 className="text-7xl font-extrabold text-blue-600 dark:text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('pageNotFound') || 'Page Not Found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('pageNotFoundDescription') || 'The page you are looking for does not exist or has been moved.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          {t('returnHome') || 'Return Home'}
        </Link>
      </div>
    </div>
  );
}
