import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import EditProfileFormComponent from '../ui/EditProfileForm';
import type { Database } from '@/database.types';



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
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">{t('editProfileTitle')}</h1>
        <p className="text-red-500">{tGeneric('dataFetchError')}</p>
      </div>
    );
  }

  if (!profileData) {


    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">{t('editProfileTitle')}</h1>
        <p>{tGeneric('noDataFound')}</p>
      </div>
    );
  }



  if (profileData.user_type === 'admin') {
    redirect({ href: `/profile?message=${encodeURIComponent(t('adminEditNotAllowed'))}`, locale });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{t('editProfileTitle')}</h1>
        <EditProfileFormComponent userProfileData={profileData} locale={locale} />
      </div>
    </div>
  );
} 