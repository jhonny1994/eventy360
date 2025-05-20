import { getTranslations } from 'next-intl/server';
import RecordPaymentForm from '@/components/admin/payments/RecordPaymentForm';
import { requireAdmin } from '@/utils/admin/auth';
import { BackButton } from '@/components/admin/ui';

interface RecordPaymentPageProps {
  params: {
    locale: string;
  };
}

export default async function RecordPaymentPage({ params }: RecordPaymentPageProps) {
  const { locale } = params;
  const t = await getTranslations('AdminPayments');
  
  // Ensure only admins can access this page
  await requireAdmin(locale);
  
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('recordPayment')}
        </h1>
        <BackButton 
          href={`/${locale}/admin/payments`}
          label={t('backToPayments')}
          color="gray"
        />
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          {t('recordPaymentDescription')}
        </p>
      </div>
      
      <RecordPaymentForm />
    </div>
  );
} 