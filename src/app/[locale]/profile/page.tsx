import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, Alert } from 'flowbite-react';
import { HiInformationCircle, HiAcademicCap, HiCheckCircle, HiIdentification, HiCalendar } from 'react-icons/hi2';
import ProfileSidebarClient, { ProfileInfo, IconName } from './ui/ProfileSidebarClient';

// Helper function to format dates (adjust format as needed for Arabic)
function formatDate(dateString: string | null, locale: string = 'ar'): string {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(new Date(dateString));
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original string
  }
}

// Function to format trial date (can be enhanced later if specific formatting is needed)
function formatTrialDate(dateString: string | null, locale: string = 'ar'): string {
  return formatDate(dateString, locale);
}

// Function to calculate trial status
function calculateTrialStatus(trialEndsAt: string | null): {
  status: 'active' | 'expiring_soon' | 'expired',
  daysRemaining: number | null
} {
  if (!trialEndsAt) return { status: 'expired', daysRemaining: null };
  
  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  // Round up to the nearest whole day for days remaining
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays <= 0) return { status: 'expired', daysRemaining: 0 };
  if (diffDays <= 7) return { status: 'expiring_soon', daysRemaining: diffDays };
  return { status: 'active', daysRemaining: diffDays };
}

// Function to calculate trial progress percentage
function calculateTrialProgress(trialEndsAt: string | null, trialStartsAt: string | null): number {
  if (!trialEndsAt || !trialStartsAt) return 0; // Or 100 if expired, depending on desired behavior for expired

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const trialStart = new Date(trialStartsAt); // Assuming subscriptionData.start_date is the trial start

  if (now >= trialEnd) return 100; // Trial ended
  if (now < trialStart) return 0; // Trial hasn't started

  const totalDuration = trialEnd.getTime() - trialStart.getTime();
  if (totalDuration <= 0) return 100; // Should not happen if dates are correct

  const elapsed = now.getTime() - trialStart.getTime();
  
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return progress;
}

// Define a simple type for the expected JSONB translation structure
type TranslationObject = { ar?: string; en?: string; fr?: string; [key: string]: string | undefined };

// Add type for Subscription data based on database.types.ts
interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'paid_researcher' | 'paid_organizer' | 'trial';
  status: 'active' | 'expired' | 'trial' | 'cancelled';
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

// Update ProfileData type to include subscriptions
interface ExtendedProfileData {
  id: string;
  user_type: 'researcher' | 'organizer' | 'admin';
  is_verified: boolean;
  is_extended_profile_complete?: boolean; // Assuming this was added by middleware or other logic
  created_at: string;
  updated_at: string;
  researcher_profiles: {
    id: string;
    profile_id: string;
    name: string | null;
    institution: string | null;
    academic_position: string | null;
    bio_translations: TranslationObject | null;
    profile_picture_url: string | null;
    wilaya_id: number | null;
    daira_id: number | null;
    wilayas?: { id: number; name_ar: string; name_other: string }; // Optional for join
    dairas?: { id: number; name_ar: string; name_other: string }; // Optional for join
  } | null;
  organizer_profiles: {
    id: string;
    profile_id: string;
    name_translations: TranslationObject | null;
    institution_type: string | null; // Assuming ENUM type
    bio_translations: TranslationObject | null;
    profile_picture_url: string | null;
    wilaya_id: number | null;
    daira_id: number | null;
    wilayas?: { id: number; name_ar: string; name_other: string }; // Optional for join
    dairas?: { id: number; name_ar: string; name_other: string }; // Optional for join
  } | null;
  subscriptions: Subscription | null; // Added subscriptions
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage(props: Props) {
  // Properly await the params object as required in Next.js 15
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const tEnums = await getTranslations({ locale, namespace: 'Enums' });
  const tAuth = await getTranslations({ locale, namespace: 'Auth' });
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // This should theoretically be handled by middleware, but good to double-check
    console.error('Profile Page: User not found or error fetching user', userError);
    redirect(`/${locale}/login`);
    }

  // Fetch profile data including extended profile and location names
  // Join location data via the extended profile tables
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      researcher_profiles ( 
        * ,
        wilayas!inner ( id, name_ar, name_other ),
        dairas!inner ( id, name_ar, name_other )
       ),
      organizer_profiles ( 
        * ,
        wilayas!inner ( id, name_ar, name_other ),
        dairas!inner ( id, name_ar, name_other )
      ),
      subscriptions (*)
    `)
    .eq('id', user.id)
    .single<ExtendedProfileData>(); // Updated to use the new type

  // If profile is somehow incomplete despite middleware, redirect
  if (profileData && !profileData.is_extended_profile_complete) {
    redirect(`/${locale}/complete-profile`);
  }

  // Determine the correct extended profile and location data
  const researcherProfile = profileData?.researcher_profiles;
  const organizerProfile = profileData?.organizer_profiles;

  // Access wilayas and dairas *within* the relevant extended profile
  const wilayaData = researcherProfile?.wilayas ?? organizerProfile?.wilayas;
  const dairaData = researcherProfile?.dairas ?? organizerProfile?.dairas;

  const currentLang = locale as keyof TranslationObject;

  // Access subscription data
  const subscriptionData = profileData?.subscriptions;

  // Calculate trial status if subscription data exists and it's a trial
  const trialStatus = subscriptionData && subscriptionData.tier === 'trial' 
    ? calculateTrialStatus(subscriptionData.trial_ends_at) 
    : null;

  // Create a simpler notVerified string based on the verified text
  const notVerified = locale === 'ar' ? 'غير موثق' : 'Not verified';

  // Prepare data for display
  const displayData = {
    email: user.email || 'N/A',
    joinedDate: formatDate(user.created_at, locale),
    isVerified: profileData?.is_verified ?? false,
    userType: profileData?.user_type ? tEnums(`user_type_enum.${profileData.user_type}`) : 'N/A',
    profilePictureUrl: researcherProfile?.profile_picture_url 
                       ?? organizerProfile?.profile_picture_url 
                       ?? null, // Default avatar handled by component
    name: profileData?.user_type === 'researcher' 
          ? researcherProfile?.name || 'N/A'
          : organizerProfile?.name_translations
            ? (organizerProfile.name_translations as TranslationObject)?.[currentLang] ?? (organizerProfile.name_translations as TranslationObject)?.ar ?? 'N/A'
            : 'N/A',
    bio: profileData?.user_type === 'researcher' 
         ? researcherProfile?.bio_translations
           ? (researcherProfile.bio_translations as TranslationObject)?.[currentLang] ?? (researcherProfile.bio_translations as TranslationObject)?.ar ?? ''
           : ''
         : organizerProfile?.bio_translations
           ? (organizerProfile.bio_translations as TranslationObject)?.[currentLang] ?? (organizerProfile.bio_translations as TranslationObject)?.ar ?? ''
           : '', // Access Arabic bio
    institution: researcherProfile?.institution, // Reverted to direct access
    academicPosition: researcherProfile?.academic_position, // Reverted to direct access
    institutionType: organizerProfile?.institution_type 
                      ? tEnums(`InstitutionType.${organizerProfile.institution_type}`)
                      : null,
    // Location
    wilayaName: locale === 'ar' ? wilayaData?.name_ar : (wilayaData?.name_other ?? wilayaData?.name_ar),
    dairaName: locale === 'ar' ? dairaData?.name_ar : (dairaData?.name_other ?? dairaData?.name_ar),
  };

  // --- Render Page ---
  if (profileError) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">{t('fetchErrorTitle')}</span> {t('fetchErrorDetails', { error: profileError.message })}
        </Alert>
      </div>
    );
  }

  if (!profileData) {
    // This case might indicate a sync issue if middleware allowed access
    return (
      <div className="container mx-auto p-4">
        <Alert color="warning" icon={HiInformationCircle}>
          <span className="font-medium">{t('profileNotFoundTitle')}</span> {t('profileNotFoundDetails')}
        </Alert>
      </div>
    );
  }

  const locationString = [displayData.dairaName, displayData.wilayaName].filter(Boolean).join(', ');

  // Prepare profile info for sidebar
  const profileInfo: ProfileInfo = {
    name: displayData.name,
    email: displayData.email,
    userType: displayData.userType,
    isVerified: displayData.isVerified,
    profilePictureUrl: displayData.profilePictureUrl, 
    bio: displayData.bio,
    details: [],
    joinedDate: displayData.joinedDate
  };

  // Add user type specific details
  if (profileData.user_type === 'researcher') {
    if (displayData.institution) {
      profileInfo.details.push({
        icon: "HiBuildingOffice2" as IconName,
        label: t('researcher.institutionLabel'),
        value: displayData.institution
      });
    }
    if (displayData.academicPosition) {
      profileInfo.details.push({
        icon: "HiAcademicCap" as IconName,
        label: t('researcher.positionLabel'),
        value: displayData.academicPosition
      });
    }
  } else if (profileData.user_type === 'organizer' && displayData.institutionType) {
    profileInfo.details.push({
      icon: "HiIdentification" as IconName,
      label: t('organizer.institutionTypeLabel'),
      value: displayData.institutionType
    });
  }

  // Add common details
  if (locationString) {
    profileInfo.details.push({
      icon: "HiMapPin" as IconName,
      label: t('common.locationLabel'),
      value: locationString
    });
  }
  profileInfo.details.push({
    icon: "HiCalendar" as IconName,
    label: t('common.joinedLabel'),
    value: displayData.joinedDate
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Pass profile information to the sidebar client component */}
      <ProfileSidebarClient 
        profile={profileInfo}
        locale={locale}
        translations={{
          editProfile: t('editProfileButton'),
          logout: t('logoutButton'),
          verifiedBadge: t('verifiedBadge'),
          toggleSidebar: t('toggleSidebar'),
          userTypeLabel: tAuth('RegisterForm.userTypeLabel'),
          verificationLabel: t('verified'),
          notVerifiedLabel: notVerified
        }}
      />

      {/* Main content - widened to utilize more horizontal space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-10 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboardTitle')}</h1>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* Additional header actions would go here */}
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard content - scrollable with wider container */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-10">
          <div className="max-w-full mx-auto space-y-6">
            
            {/* Status Cards Section - separated verification and subscription */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Verification Status Card - simplified */}
              <Card className="shadow-md">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{t('verified')}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        displayData.isVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {displayData.isVerified ? t('verified') : notVerified}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {displayData.isVerified 
                            ? locale === 'ar' ? 'هذا الحساب موثق' : 'This account is verified' 
                            : locale === 'ar' ? 'هذا الحساب غير موثق' : 'This account is not verified'}
                        </p>
                      </div>
                      
                      {!displayData.isVerified && (
                        <div className="border-t sm:border-t-0 sm:border-s pt-4 sm:pt-0 sm:ps-6 border-gray-200 dark:border-gray-700 flex flex-col sm:w-72">
                          <button className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg py-2 px-4 transition-colors duration-200 w-full">
                            {t('requestVerification')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Subscription Status Card */}
              <Card className="shadow-md">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{t('subscriptionStatus')}</h2>
                      {subscriptionData && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trialStatus && trialStatus.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : trialStatus && trialStatus.status === 'expiring_soon' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : (trialStatus && trialStatus.status === 'expired') || subscriptionData.status === 'expired'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : subscriptionData.status === 'active' // For non-trial active subscriptions
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' // Default/cancelled
                        }`}>
                          {tEnums(`SubscriptionStatus.${subscriptionData.status}`)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium me-2">{t('currentTier')}:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {subscriptionData ? tEnums(`SubscriptionTier.${subscriptionData.tier}`) : t('freeTier')}
                          </span>
                        </div>
                        
                        {/* Show trial information if it's a trial subscription */}
                        {subscriptionData && subscriptionData.tier === 'trial' && trialStatus && (
                          <div className="mt-3">
                            <div className="mb-2">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {t('trialEndsAt')}: {formatTrialDate(subscriptionData.trial_ends_at, locale)}
                              </span>
                            </div>
                            
                            {/* Progress bar for trial */}
                            {trialStatus.status !== 'expired' && (
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    trialStatus.status === 'active' 
                                      ? 'bg-green-600' 
                                      : trialStatus.status === 'expiring_soon' 
                                        ? 'bg-yellow-500'
                                        // Expired case handled by not showing the bar or a full red bar
                                        : 'bg-red-600' // Fallback, though expired status hides this
                                  }`}
                                  style={{ width: `${calculateTrialProgress(subscriptionData.trial_ends_at, subscriptionData.start_date)}%` }}
                                ></div>
                              </div>
                            )}
                            
                            {/* Days remaining or status message */}
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {trialStatus.status === 'expired'
                                ? t('trialExpired')
                                : t('daysRemainingFormatted', { count: trialStatus.daysRemaining as number })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t sm:border-t-0 sm:border-s pt-4 sm:pt-0 sm:ps-6 border-gray-200 dark:border-gray-700 flex flex-col sm:w-72">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">{t('eventLimit')}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {profileData.user_type === 'organizer' && (!subscriptionData || subscriptionData.tier === 'free' || subscriptionData.status === 'expired' || (trialStatus && trialStatus.status === 'expired')) 
                              ? '1' 
                              : profileData.user_type === 'organizer' && subscriptionData // Assuming paid tiers have higher limits
                                ? '10' 
                                : '∞'}
                          </span>
                        </div>
                        <button className={`text-white font-medium rounded-lg py-2 px-4 transition-colors duration-200 w-full ${
                          (trialStatus && trialStatus.status === 'expired') || (subscriptionData && subscriptionData.status === 'expired')
                            ? 'bg-orange-500 hover:bg-orange-600' // Suggest reactivation for expired
                            : 'bg-blue-600 hover:bg-blue-700' // Default upgrade
                        }`}>
                          {(trialStatus && trialStatus.status === 'expired') || (subscriptionData && subscriptionData.status === 'expired')
                            ? t('reactivateSubscription') 
                            : t('upgradeTo') + ' ' + t('premiumTier')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Role-based metrics - with better spacing and layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {profileData.user_type === 'researcher' && (
                <>
                  {/* Researcher Metrics */}
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissionsTotal')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                        <HiAcademicCap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('acceptedPapers')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                        <HiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingReviews')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <HiIdentification className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookmarkedEvents')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                        <HiCalendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                      </div>
                    </div>
                  </Card>
                </>
              )}
              
              {profileData.user_type === 'organizer' && (
                <>
                  {/* Organizer Metrics */}
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('eventsCreated')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                        <HiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('activeEvents')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                        <HiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalSubmissions')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <HiAcademicCap className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingReviews')}</p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                        <HiIdentification className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
            
            {/* Role-based main content - with better spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {profileData.user_type === 'researcher' && (
                <>
                  {/* Researcher Dashboard Content */}
                  <Card className="shadow-md lg:col-span-2">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">{t('upcomingDeadlines')}</h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('noUpcomingDeadlines')}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">{t('submissionStatus')}</h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('noSubmissions')}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('recentlyBookmarkedEvents')}</h2>
                        <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200">
                          {t('exploreEvents')}
                        </button>
                      </div>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('noBookmarkedEvents')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
              
              {profileData.user_type === 'organizer' && (
                <>
                  {/* Organizer Dashboard Content */}
                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('activeEventsList')}</h2>
                        <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200">
                          {t('createEvent')}
                        </button>
                      </div>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('noActiveEvents')}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">{t('recentSubmissions')}</h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('noSubmissionsReceived')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}