import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import TopicSubscriptionsCard from '../ui/TopicSubscriptionsCard';
import ProfilePageHeader from '../ui/ProfilePageHeader';

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Topic Subscriptions page for researchers to manage their topic subscriptions
 * Shows a list of available topics and allows subscription/unsubscription
 * Protected by subscription guard to ensure only paid/trial users can modify subscriptions
 */
export default async function TopicsPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

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

  // Ensure the user is a researcher (only researchers subscribe to topics)
  if (profileData.user_type !== 'researcher') {
    redirect(`/${locale}/profile`);
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader 
        title={t('topicSubscriptions.title')} 
        iconName="documentText"
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
        iconTextColor="text-indigo-600 dark:text-indigo-300"
        locale={locale}
      />
      
      {/* The TopicSubscriptionsCard component will handle the subscription status check */}
      <TopicSubscriptionsCard />
    </div>
  );
} 