import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  HiOutlineUser,
  HiOutlineDocumentReport,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import ProfilePageHeader from "./ui/ProfilePageHeader";
import ProfileCard from "./ui/ProfileCard";

type Props = {
  params: { locale: string };
};

/**
 * Main profile dashboard page
 * This is the landing page when users navigate to /profile
 * Enhanced with better layout and RTL support
 */
export default async function ProfileDashboardPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: "ProfilePage" });

  // Redirect if user is not authenticated
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch user profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Handle errors - redirect to setup if needed
  if (profileError || !profileData) {
    redirect(`/${locale}/profile/setup`);
  }

  // Check if extended profile is complete
  if (!profileData.is_extended_profile_complete) {
    redirect(`/${locale}/complete-profile`);
  }

  const isRtl = locale === 'ar';

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <ProfilePageHeader
        title={t("dashboardTitle")}
        iconName="home"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Quick stats cards */}
        <ProfileCard locale={locale}>
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
            >
              <HiOutlineUser className="h-6 w-6" />
              </div>
            <div>
              <h3 className="text-lg font-medium">{t("profileCompletion")}</h3>
              <p className="text-3xl font-bold mt-1">100%</p>
            </div>
          </div>
        </ProfileCard>

        <ProfileCard locale={locale}>
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
            >
              <HiOutlineDocumentReport className="h-6 w-6" />
            </div>
                      <div>
              <h3 className="text-lg font-medium">
                {profileData.user_type === "researcher"
                  ? t("submissionsCount")
                  : t("eventsCreated")}
              </h3>
              <p className="text-3xl font-bold mt-1">0</p>
                      </div>
                    </div>
        </ProfileCard>

        <ProfileCard locale={locale}>
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
            >
              <HiOutlineShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("verificationLabel")}</h3>
              <p className="text-3xl font-bold mt-1">
                {profileData.is_verified ? (
                  <span className="text-green-600">{t("verified")}</span>
                ) : (
                  <span className="text-yellow-600">
                    {t("notVerifiedLabel")}
                  </span>
                )}
                        </p>
                      </div>
                    </div>
        </ProfileCard>
                    </div>

      <div className="grid grid-cols-1 gap-6 mt-2">
        {/* Recent activity section */}
        <ProfileCard title={t("recentActivity")} locale={locale}>
          <div
            className="flex items-center justify-center h-36 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
                        <p className="text-gray-500 dark:text-gray-400">
              {t("noRecentActivity")}
            </p>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}
