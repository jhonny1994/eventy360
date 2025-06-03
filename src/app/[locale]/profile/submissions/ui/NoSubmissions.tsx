import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { useLocale } from "next-intl";
import useTranslations from '@/hooks/useTranslations';

interface NoSubmissionsProps {
  message: string;
}

/**
 * NoSubmissions component to display empty state for submissions list
 * 
 * Note: This component follows the standardized hook pattern by using:
 * - useTranslations - For i18n translations
 * 
 * This is a presentational component that displays an empty state
 * with a message and a call to action to browse events.
 */
export default function NoSubmissions({ message }: NoSubmissionsProps) {
  const locale = useLocale();
  const t = useTranslations("Submissions");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {t("startSubmitting")}
      </p>
      <Link 
        href={`/${locale}/profile/events`} 
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        <FaPlus className="h-4 w-4" />
        {t("browseEvents")}
      </Link>
    </div>
  );
} 