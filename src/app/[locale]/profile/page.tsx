import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, Alert } from "flowbite-react";
import {
  HiInformationCircle,
  HiAcademicCap,
  HiCheckCircle,
  HiIdentification,
  HiCalendar,
} from "react-icons/hi2";
import ProfileSidebarClient, {
  ProfileInfo,
  IconName,
} from "./ui/ProfileSidebarClient";
import TopicSubscriptionsCard from "./ui/TopicSubscriptionsCard";
import SubscriptionActions from "./ui/SubscriptionActions";
import { getAppSettings } from "@/lib/appConfig";
import PaymentHistoryDisplay from "./ui/PaymentHistoryDisplay";
import VerificationSection from "./ui/VerificationSection";

function formatDate(dateString: string | null, locale: string = "ar"): string {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

function formatTrialDate(
  dateString: string | null,
  locale: string = "ar"
): string {
  return formatDate(dateString, locale);
}

function calculateTrialStatus(trialEndsAt: string | null): {
  status: "active" | "expiring_soon" | "expired";
  daysRemaining: number | null;
} {
  if (!trialEndsAt) return { status: "expired", daysRemaining: null };

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { status: "expired", daysRemaining: 0 };
  if (diffDays <= 7)
    return { status: "expiring_soon", daysRemaining: diffDays };
  return { status: "active", daysRemaining: diffDays };
}

function calculateTrialProgress(
  trialEndsAt: string | null,
  trialStartsAt: string | null
): number {
  if (!trialEndsAt || !trialStartsAt) return 0;

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const trialStart = new Date(trialStartsAt);

  if (now >= trialEnd) return 100;
  if (now < trialStart) return 0;

  const totalDuration = trialEnd.getTime() - trialStart.getTime();
  if (totalDuration <= 0) return 100;

  const elapsed = now.getTime() - trialStart.getTime();

  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return progress;
}

type TranslationObject = {
  ar?: string;
  en?: string;
  fr?: string;
  [key: string]: string | undefined;
};

interface Subscription {
  id: string;
  user_id: string;
  tier: "free" | "paid_researcher" | "paid_organizer" | "trial";
  status: "active" | "expired" | "trial" | "cancelled";
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ExtendedProfileData {
  id: string;
  user_type: "researcher" | "organizer" | "admin";
  is_verified: boolean;
  is_extended_profile_complete?: boolean;
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
    wilayas?: { id: number; name_ar: string; name_other: string };
    dairas?: { id: number; name_ar: string; name_other: string };
  } | null;
  organizer_profiles: {
    id: string;
    profile_id: string;
    name_translations: TranslationObject | null;
    institution_type: string | null;
    bio_translations: TranslationObject | null;
    profile_picture_url: string | null;
    wilaya_id: number | null;
    daira_id: number | null;
    wilayas?: { id: number; name_ar: string; name_other: string };
    dairas?: { id: number; name_ar: string; name_other: string };
  } | null;
  subscriptions: Subscription | null;
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "ProfilePage" });
  const tEnums = await getTranslations({ locale, namespace: "Enums" });
  const supabase = await createServerSupabaseClient();

  const appSettings = await getAppSettings();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Profile Page: User not found or error fetching user",
      userError
    );
    redirect(`/${locale}/login`);
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      *,
      researcher_profiles ( 
        * ,
        wilayas ( id, name_ar, name_other ),
        dairas ( id, name_ar, name_other )
       ),
      organizer_profiles ( 
        * ,
        wilayas ( id, name_ar, name_other ),
        dairas ( id, name_ar, name_other )
      ),
      subscriptions (*)
    `
    )
    .eq("id", user.id)
    .single<ExtendedProfileData>();

  if (profileData && !profileData.is_extended_profile_complete) {
    redirect(`/${locale}/complete-profile`);
  }

  const researcherProfile = profileData?.researcher_profiles;
  const organizerProfile = profileData?.organizer_profiles;

  const wilayaData = researcherProfile?.wilayas ?? organizerProfile?.wilayas;
  const dairaData = researcherProfile?.dairas ?? organizerProfile?.dairas;

  const currentLang = locale as keyof TranslationObject;

  const subscriptionData = profileData?.subscriptions;

  const trialStatus =
    subscriptionData && subscriptionData.tier === "trial"
      ? calculateTrialStatus(subscriptionData.trial_ends_at)
      : null;

  const notVerified = locale === "ar" ? "غير موثق" : "Not verified";

  const displayData = {
    email: user.email || "N/A",
    joinedDate: formatDate(user.created_at, locale),
    isVerified: profileData?.is_verified ?? false,
    userType: profileData?.user_type
      ? tEnums(`user_type_enum.${profileData.user_type}`)
      : "N/A",
    profilePictureUrl:
      researcherProfile?.profile_picture_url ??
      organizerProfile?.profile_picture_url ??
      null,
    name:
      profileData?.user_type === "researcher"
        ? researcherProfile?.name || "N/A"
        : organizerProfile?.name_translations
        ? (organizerProfile.name_translations as TranslationObject)?.[
            currentLang
          ] ??
          (organizerProfile.name_translations as TranslationObject)?.ar ??
          "N/A"
        : "N/A",
    bio:
      profileData?.user_type === "researcher"
        ? researcherProfile?.bio_translations
          ? (researcherProfile.bio_translations as TranslationObject)?.[
              currentLang
            ] ??
            (researcherProfile.bio_translations as TranslationObject)?.ar ??
            ""
          : ""
        : organizerProfile?.bio_translations
        ? (organizerProfile.bio_translations as TranslationObject)?.[
            currentLang
          ] ??
          (organizerProfile.bio_translations as TranslationObject)?.ar ??
          ""
        : "",
    institution: researcherProfile?.institution,
    academicPosition: researcherProfile?.academic_position,
    institutionType: organizerProfile?.institution_type
      ? tEnums(`InstitutionType.${organizerProfile.institution_type}`)
      : null,

    wilayaName:
      locale === "ar"
        ? wilayaData?.name_ar
        : wilayaData?.name_other ?? wilayaData?.name_ar,
    dairaName:
      locale === "ar"
        ? dairaData?.name_ar
        : dairaData?.name_other ?? dairaData?.name_ar,
  };

  if (profileError) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">{t("fetchErrorTitle")}</span>{" "}
          {t("fetchErrorDetails", { error: profileError.message })}
        </Alert>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="warning" icon={HiInformationCircle}>
          <span className="font-medium">{t("profileNotFoundTitle")}</span>{" "}
          {t("profileNotFoundDetails")}
        </Alert>
      </div>
    );
  }

  const locationString = [displayData.dairaName, displayData.wilayaName]
    .filter(Boolean)
    .join(", ");

  const profileInfo: ProfileInfo = {
    name: displayData.name,
    email: displayData.email,
    userType: displayData.userType,
    isVerified: displayData.isVerified,
    profilePictureUrl: displayData.profilePictureUrl,
    bio: displayData.bio,
    details: [],
    joinedDate: displayData.joinedDate,
  };

  if (profileData.user_type === "researcher") {
    if (displayData.institution) {
      profileInfo.details.push({
        icon: "HiBuildingOffice2" as IconName,
        label: t("researcher.institutionLabel"),
        value: displayData.institution,
      });
    }
    if (displayData.academicPosition) {
      profileInfo.details.push({
        icon: "HiAcademicCap" as IconName,
        label: t("researcher.positionLabel"),
        value: displayData.academicPosition,
      });
    }
  } else if (
    profileData.user_type === "organizer" &&
    displayData.institutionType
  ) {
    profileInfo.details.push({
      icon: "HiIdentification" as IconName,
      label: t("organizer.institutionTypeLabel"),
      value: displayData.institutionType,
    });
  }

  if (locationString) {
    profileInfo.details.push({
      icon: "HiMapPin" as IconName,
      label: t("common.locationLabel"),
      value: locationString,
    });
  }
  profileInfo.details.push({
    icon: "HiCalendar" as IconName,
    label: t("common.joinedLabel"),
    value: displayData.joinedDate,
  });

  return (
    <div
      className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Pass profile information to the sidebar client component */}
      <ProfileSidebarClient
        profile={profileInfo}
        locale={locale}
        translations={{
          editProfile: t("editProfileButton"),
          logout: t("logoutButton"),
          verifiedBadge: t("verifiedBadge"),
          toggleSidebar: t("toggleSidebar"),
          userTypeLabel: t("sidebarUserTypeLabel"),
          verificationLabel: t("verificationLabel"),
          notVerifiedLabel: t("notVerifiedLabel"),
        }}
      />

      {/* Main content - widened to utilize more horizontal space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-10 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("dashboardTitle")}
              </h1>
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
              {/* Verification Status Card */}
              <VerificationSection
                isVerified={displayData.isVerified}
                userId={profileData.id}
                translations={{
                  verified: t("verified"),
                  notVerified: notVerified,
                  verifiedLabel: t("verificationLabel"),
                  verificationDescription: {
                    verified:
                      locale === "ar"
                        ? "هذا الحساب موثق"
                        : "This account is verified",
                    notVerified:
                      locale === "ar"
                        ? "هذا الحساب غير موثق"
                        : "This account is not verified",
                  },
                  requestVerification: t("requestVerification"),
                  verificationStatusError: t(
                    "VerificationSection.verificationStatusError"
                  ),
                }}
              />

              {/* Subscription Status Card */}
              <Card className="shadow-md">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {t("subscriptionStatus")}
                      </h2>
                      {subscriptionData && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trialStatus && trialStatus.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : trialStatus &&
                                trialStatus.status === "expiring_soon"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : (trialStatus &&
                                  trialStatus.status === "expired") ||
                                subscriptionData.status === "expired"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : subscriptionData.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {tEnums(
                            `SubscriptionStatus.${subscriptionData.status}`
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium me-2">
                            {t("currentTier")}:
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {subscriptionData
                              ? tEnums(
                                  `SubscriptionTier.${subscriptionData.tier}`
                                )
                              : t("freeTier")}
                          </span>
                        </div>

                        {/* Show trial information if it's a trial subscription */}
                        {subscriptionData &&
                          subscriptionData.tier === "trial" &&
                          trialStatus && (
                            <div className="mt-3">
                              <div className="mb-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {t("trialEndsAt")}:{" "}
                                  {formatTrialDate(
                                    subscriptionData.trial_ends_at,
                                    locale
                                  )}
                                </span>
                              </div>

                              {/* Progress bar for trial */}
                              {trialStatus.status !== "expired" && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      trialStatus.status === "active"
                                        ? "bg-green-600"
                                        : trialStatus.status === "expiring_soon"
                                        ? "bg-yellow-500"
                                        : "bg-red-600"
                                    }`}
                                    style={{
                                      width: `${calculateTrialProgress(
                                        subscriptionData.trial_ends_at,
                                        subscriptionData.start_date
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              )}

                              {/* Days remaining or status message */}
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {trialStatus.status === "expired"
                                  ? t("trialExpired")
                                  : t("daysRemainingFormatted", {
                                      count:
                                        trialStatus.daysRemaining as number,
                                    })}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-s pt-4 sm:pt-0 sm:ps-6 border-gray-200 dark:border-gray-700 flex flex-col sm:w-72">
                        <SubscriptionActions
                          texts={{
                            reactivateSubscription: t("reactivateSubscription"),
                            upgradeTo: t("upgradeTo"),
                            premiumTier: t("premiumTier"),
                          }}
                          subscriptionData={profileData?.subscriptions ?? null}
                          appSettings={appSettings}
                          userType={
                            profileData?.user_type === "admin"
                              ? null
                              : profileData?.user_type || null
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Role-based metrics - with better spacing and layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {profileData.user_type === "researcher" && (
                <>
                  {/* Researcher Metrics */}
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("submissionsTotal")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("acceptedPapers")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("pendingReviews")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("bookmarkedEvents")}
                        </p>
                        <h3 className="text-2xl font-bold mt-1">0</h3>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                        <HiCalendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {profileData.user_type === "organizer" && (
                <>
                  {/* Organizer Metrics */}
                  <Card className="shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("eventsCreated")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("activeEvents")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("totalSubmissions")}
                        </p>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("pendingReviews")}
                        </p>
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

            {/* Payment History Section */}
            {user && <PaymentHistoryDisplay userId={user.id} />}

            {/* Topic Subscriptions Card (if applicable) */}
            {profileData?.user_type === "researcher" &&
              subscriptionData &&
              (subscriptionData.tier === "trial" ||
                subscriptionData.tier === "paid_researcher") &&
              (subscriptionData.status === "active" ||
                subscriptionData.status === "trial") && (
                <Card className="shadow-md lg:col-span-3">
                  <TopicSubscriptionsCard />
                </Card>
              )}

            {/* Role-based main content - with better spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {profileData.user_type === "researcher" && (
                <>
                  {/* Researcher Dashboard Content */}
                  <Card className="shadow-md lg:col-span-2">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">
                        {t("upcomingDeadlines")}
                      </h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t("noUpcomingDeadlines")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="shadow-md">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">
                        {t("submissionStatus")}
                      </h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t("noSubmissions")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Topic Subscriptions Card - Only for researchers with trial or active paid subscriptions */}
                  {profileData.user_type === "researcher" &&
                    subscriptionData &&
                    (subscriptionData.tier === "trial" ||
                      subscriptionData.tier === "paid_researcher") &&
                    (subscriptionData.status === "active" ||
                      subscriptionData.status === "trial") && (
                      <Card className="shadow-md lg:col-span-3">
                        <TopicSubscriptionsCard />
                      </Card>
                    )}

                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                          {t("recentlyBookmarkedEvents")}
                        </h2>
                        <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200">
                          {t("exploreEvents")}
                        </button>
                      </div>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t("noBookmarkedEvents")}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {profileData.user_type === "organizer" && (
                <>
                  {/* Organizer Dashboard Content */}
                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                          {t("activeEventsList")}
                        </h2>
                        <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200">
                          {t("createEvent")}
                        </button>
                      </div>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t("noActiveEvents")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="shadow-md lg:col-span-3">
                    <div className="p-5">
                      <h2 className="text-xl font-bold mb-4">
                        {t("recentSubmissions")}
                      </h2>
                      <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t("noSubmissionsReceived")}
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
