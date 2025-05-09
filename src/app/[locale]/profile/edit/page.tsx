import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import EditProfileFormComponent from '../ui/EditProfileForm'; // Adjusted path
import type { Database } from '@/database.types';

// Define the shape of the data fetched by this page
// This should align with what EditProfileFormComponent expects
type ExtendedProfileForPage = Database['public']['Tables']['profiles']['Row'] & {
  researcher_profiles: Database['public']['Tables']['researcher_profiles']['Row'] | null;
  organizer_profiles: Database['public']['Tables']['organizer_profiles']['Row'] | null;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EditProfilePage(props: Props) {
  // Properly await the params object as required in Next.js 15
  const { locale } = await props.params;
  
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const tGeneric = await getTranslations({ locale, namespace: 'Generic' });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect({ href: `/login?message=${encodeURIComponent(tGeneric('authenticationRequired'))}`, locale });
    return null; // Or a loading state, but redirect should handle it
  }

  // Fetch the user's full profile details including the extended profile
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
    console.error('Error fetching profile for edit:', profileError);
    // Consider redirecting to profile display with an error message or showing an error component
    // For now, simple error display
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">{t('editProfileTitle')}</h1>
        <p className="text-red-500">{tGeneric('dataFetchError')}</p>
      </div>
    );
  }

  if (!profileData) {
    // This case should ideally not happen if a profile is created on sign-up
    // but handle it just in case.
    console.error('No profile data found for user:', user.id);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">{t('editProfileTitle')}</h1>
        <p>{tGeneric('noDataFound')}</p>
      </div>
    );
  }
  
  // Admins should not use this form for editing their limited profile.
  // This form is designed for researcher/organizer extended profiles.
  if (profileData.user_type === 'admin') {
    console.warn('Admin attempting to access extended profile edit page. Redirecting.');
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