import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export default async function AdminDashboardPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'AdminPage' });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {t('dashboardTitle')}
      </h1>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {t('welcomeMessage')}
      </p>
      {/* Add more dashboard content here later */}
    </div>
  );
} 