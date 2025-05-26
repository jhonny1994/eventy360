import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PaymentSection } from '@/components/payment';
import { getAppSettings } from '@/lib/appConfig';
import ProfilePageHeader from '../ui/ProfilePageHeader';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Dedicated page for subscriptions and payments
 * Shows payment history and reporting interface
 * Enhanced with better layout and RTL support
 */
export default async function SubscriptionsPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  
  // Get app settings for payment instructions
  const appSettings = await getAppSettings();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get profile data to check user type
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) {
    redirect(`/${locale}/profile/setup`);
  }

  // Ensure the user is not an admin (admins don't need subscriptions)
  if (profileData.user_type === 'admin') {
    redirect(`/${locale}/profile`);
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader 
        title={t('subscriptionStatus')} 
        iconName="creditCard"
        iconBgColor="bg-green-100 dark:bg-green-900"
        iconTextColor="text-green-600 dark:text-green-300"
        locale={locale}
      />
      
      <PaymentSection 
        userId={user.id}
        appSettings={appSettings}
        userType={profileData.user_type as 'researcher' | 'organizer'}
        locale={locale}
      />
    </div>
  );
}