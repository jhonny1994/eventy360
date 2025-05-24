import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import ProfileSidebar from './ui/ProfileSidebar';
import type { ProfileDetail, ProfileInfo } from './ui/ProfileSidebar';
import { getAppSettings } from '@/lib/appConfig';

// Define a type for JSON data which can be properly processed
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Profile data structure from the database
interface DatabaseProfileData {
  id: string;
  user_type: 'researcher' | 'organizer' | 'admin';
  is_verified: boolean;
  is_extended_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  researcher_profiles: {
    id: string;
    profile_id: string;
    name: string | null;
    institution: string | null;
    academic_position: string | null;
    bio_translations: Json;
    profile_picture_url: string | null;
    wilaya_id: number | null;
    daira_id: number | null;
    wilayas?: { id: number; name_ar: string; name_other: string };
    dairas?: { id: number; name_ar: string; name_other: string };
  } | null;
  organizer_profiles: {
    id: string;
    profile_id: string;
    name_translations: Json;
    institution_type: string | null;
    bio_translations: Json;
    profile_picture_url: string | null;
    wilaya_id: number | null;
    daira_id: number | null;
    wilayas?: { id: number; name_ar: string; name_other: string };
    dairas?: { id: number; name_ar: string; name_other: string };
  } | null;
  admin_profiles: {
    id: string;
    profile_id: string;
    role: string | null;
  } | null;
}

/**
 * Layout component for user profile section
 * Includes sidebar navigation and wraps all profile pages
 * Fetches user data once for all profile pages
 *
 * @param props - Component props including children and locale
 * @returns Layout component with sidebar and main content area
 */
export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const navT = await getTranslations({ locale, namespace: 'Navigation' });
  const enumsT = await getTranslations({ locale, namespace: 'Enums' });

  // Get app settings - not used directly in this component but available for child pages
  await getAppSettings();

  // Redirect if user is not authenticated
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      researcher_profiles(*,
        wilayas (id, name_ar, name_other),
        dairas (id, name_ar, name_other)
      ),
      organizer_profiles(*,
        wilayas (id, name_ar, name_other),
        dairas (id, name_ar, name_other)
      ),
      admin_profiles(*)
    `)
    .eq('id', user.id)
    .single<DatabaseProfileData>();

  // Handle errors and redirects
  if (profileError || !profileData) {
    console.error("Error fetching profile:", profileError);
    redirect(`/${locale}/profile/setup`);
  }

  // Prepare profile info for sidebar
  const profile = prepareProfileInfo(profileData, user.email || '', locale, t, enumsT);

  // Get navigation translations
  const translations = {
    // Existing translations
    editProfile: t('editProfileButton'),
    logout: t('logoutButton'),
    verifiedBadge: t('verifiedBadge'),
    toggleSidebar: t('toggleSidebar'),
    userTypeLabel: t('sidebarUserTypeLabel'),
    verificationLabel: t('verificationLabel'),
    notVerifiedLabel: t('notVerifiedLabel'),

    // New navigation translations
    dashboard: navT('profileDashboard'),
    profile: navT('profile'),
    verification: navT('verification'),
    subscriptions: navT('subscriptions'),
    security: navT('security'),
    topics: navT('topics'),
  };


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <ProfileSidebar 
        profile={profile} 
        locale={locale} 
        translations={translations}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-6 pb-8 px-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper function to prepare profile info for sidebar
function prepareProfileInfo(
  profileData: DatabaseProfileData, 
  email: string,
  locale: string,
  t: (key: string) => string,
  enumsT: (key: string) => string
): ProfileInfo {
  const details: ProfileDetail[] = [];
  const currentLang = locale as keyof Record<string, string>;

  // Add appropriate fields based on user type
  if (profileData.user_type === 'researcher' && profileData.researcher_profiles) {
    const researcher = profileData.researcher_profiles;
    
    if (researcher.institution) {
      details.push({
        icon: 'HiOfficeBuilding',
        label: t('researcher.institutionLabel'),
        value: researcher.institution,
      });
    }
    
    if (researcher.academic_position) {
      details.push({
        icon: 'HiAcademicCap',
        label: t('researcher.positionLabel'),
        value: researcher.academic_position,
      });
    }

    // Location data
    if (researcher.wilayas && researcher.dairas) {
      const locationString = [
        locale === 'ar' ? researcher.dairas.name_ar : researcher.dairas.name_other,
        locale === 'ar' ? researcher.wilayas.name_ar : researcher.wilayas.name_other
      ].filter(Boolean).join(', ');

      if (locationString) {
        details.push({
          icon: 'HiLocationMarker',
          label: t('common.locationLabel'),
          value: locationString,
        });
      }
    }
  } else if (profileData.user_type === 'organizer' && profileData.organizer_profiles) {
    const organizer = profileData.organizer_profiles;
    
    if (organizer.institution_type) {
      details.push({
        icon: 'HiIdentification',
        label: t('organizer.institutionTypeLabel'),
        value: enumsT(`InstitutionType.${organizer.institution_type}`),
      });
    }

    // Location data
    if (organizer.wilayas && organizer.dairas) {
      const locationString = [
        locale === 'ar' ? organizer.dairas.name_ar : organizer.dairas.name_other,
        locale === 'ar' ? organizer.wilayas.name_ar : organizer.wilayas.name_other
      ].filter(Boolean).join(', ');

      if (locationString) {
        details.push({
          icon: 'HiLocationMarker',
          label: t('common.locationLabel'),
          value: locationString,
        });
      }
    }
  } else if (profileData.user_type === 'admin' && profileData.admin_profiles) {
    const admin = profileData.admin_profiles;
    
    if (admin.role) {
      details.push({
        icon: 'HiIdentification',
        label: t('admin.roleLabel'),
        value: admin.role,
      });
    }
  }
  
  // Format and add the joined date
  const joinedDate = new Date(profileData.created_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  details.push({
    icon: 'HiCalendar',
    label: t('common.joinedLabel'),
    value: joinedDate,
  });

  // Get name based on user type
  let name = email;
  let bio = '';
  let profilePictureUrl = null;

  if (profileData.user_type === 'researcher' && profileData.researcher_profiles) {
    name = profileData.researcher_profiles.name || email;
    
    // Handle bio translations - interpret JSON data correctly
    const bioTranslations = profileData.researcher_profiles.bio_translations as Record<string, string>;
    bio = bioTranslations?.[currentLang] || bioTranslations?.['ar'] || '';
    
    profilePictureUrl = profileData.researcher_profiles.profile_picture_url;
  } else if (profileData.user_type === 'organizer' && profileData.organizer_profiles) {
    // Handle name translations - interpret JSON data correctly
    const nameTranslations = profileData.organizer_profiles.name_translations as Record<string, string>;
    name = nameTranslations?.[currentLang] || nameTranslations?.['ar'] || email;
    
    // Handle bio translations - interpret JSON data correctly
    const bioTranslations = profileData.organizer_profiles.bio_translations as Record<string, string>;
    bio = bioTranslations?.[currentLang] || bioTranslations?.['ar'] || '';
    
    profilePictureUrl = profileData.organizer_profiles.profile_picture_url;
  }

  return {
    name,
    email,
    userType: enumsT(`user_type_enum.${profileData.user_type}`),
    isVerified: profileData.is_verified,
    profilePictureUrl,
    bio,
    details,
    joinedDate,
  };
} 