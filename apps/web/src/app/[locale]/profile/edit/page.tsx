import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import EditProfileFormComponent from '../ui/EditProfileForm';
import type { Database } from '@/database.types';
import ProfilePageHeader from '../ui/ProfilePageHeader';
import ProfileCard from '../ui/ProfileCard';

type ExtendedProfileForPage = Database['public']['Tables']['profiles']['Row'] & {
  researcher_profiles: Database['public']['Tables']['researcher_profiles']['Row'] | null;
  organizer_profiles: Database['public']['Tables']['organizer_profiles']['Row'] | null;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EditProfilePage(props: Props) {
  const { locale } = await props.params;

  const supabase = await createServerSupabaseClient();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const tGeneric = await getTranslations({ locale, namespace: 'Generic' });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect({ href: `/login?message=${encodeURIComponent(tGeneric('authenticationRequired'))}`, locale });
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      researcher_profiles(*),
      organizer_profiles(*)
    `)
    .eq('id', user.id)
    .single<ExtendedProfileForPage>();

  if (profileError) {
    return (
      <div className="space-y-6">
        <ProfilePageHeader 
          title={t('editProfileTitle')} 
          iconName="user"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          iconTextColor="text-blue-600 dark:text-blue-300"
          locale={locale}
        />
        <ProfileCard locale={locale}>
          <div className="text-center">
            <p className="text-red-500">{tGeneric('dataFetchError')}</p>
          </div>
        </ProfileCard>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="space-y-6">
        <ProfilePageHeader 
          title={t('editProfileTitle')} 
          iconName="user"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          iconTextColor="text-blue-600 dark:text-blue-300"
          locale={locale}
        />
        <ProfileCard locale={locale}>
          <div className="text-center">
            <p>{tGeneric('noDataFound')}</p>
          </div>
        </ProfileCard>
      </div>
    );
  }

  if (profileData.user_type === 'admin') {
    redirect({ href: `/profile?message=${encodeURIComponent(t('adminEditNotAllowed'))}`, locale });
    return null;
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader 
        title={t('editProfileTitle')} 
        iconName="user"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      />
      
      <ProfileCard locale={locale}>
        <EditProfileFormComponent userProfileData={profileData} locale={locale} />
      </ProfileCard>
    </div>
  );
}