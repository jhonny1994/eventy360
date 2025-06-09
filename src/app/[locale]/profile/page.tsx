import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
} from "react-icons/hi";
import ProfilePageHeader from "./ui/ProfilePageHeader";
import ProfileCard from "./ui/ProfileCard";
import ProfileStats from "./ui/ProfileStats";
import { getUserStats } from "./api/getUserStats";
import React from "react";
import ProfileCompletionCard from "./ui/ProfileCompletionCard";

type Props = {
  params: Promise<{ locale: string }>;
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
  const subscriptionT = await getTranslations({ locale, namespace: "Subscription" });

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

  // Fetch user statistics based on user type
  const userStats = await getUserStats(user.id);

  const isRtl = locale === 'ar';

  // Format subscription status display text
  const getStatusText = () => {
    if (!userStats.subscription) return '';

    if (userStats.subscription.tier === 'free') return subscriptionT('free');
    
    switch (userStats.subscription.status) {
      case 'active':
        return userStats.subscription.tier === 'paid_researcher' 
          ? subscriptionT('paidResearcher') 
          : subscriptionT('paidOrganizer');
      case 'trial':
        return subscriptionT('trial');
      case 'expired':
        return subscriptionT('expired');
      case 'cancelled':
        return subscriptionT('cancelled');
      default:
        return subscriptionT('free');
    }
  };

  // Format days remaining text if applicable
  const getDaysRemainingText = () => {
    if (!userStats.subscription) return '';
    if (userStats.subscription.status === 'expired' || userStats.subscription.status === 'cancelled') {
      return '';
    }
    
    if (userStats.subscription.daysRemaining > 0) {
      return subscriptionT('daysRemaining', { days: userStats.subscription.daysRemaining });
    }
    
    return '';
  };

  // Determine color based on subscription status
  const getSubscriptionColors = () => {
    if (!userStats.subscription) {
      return {
        bgColor: "bg-gray-100 dark:bg-gray-800",
        textColor: "text-gray-600 dark:text-gray-300"
      };
    }

    switch (userStats.subscription.status) {
      case 'active':
        return {
          bgColor: "bg-green-100 dark:bg-green-900",
          textColor: "text-green-600 dark:text-green-300"
        };
      case 'trial':
        return {
          bgColor: "bg-blue-100 dark:bg-blue-900",
          textColor: "text-blue-600 dark:text-blue-300"
        };
      case 'expired':
      case 'cancelled':
        return {
          bgColor: "bg-red-100 dark:bg-red-900",
          textColor: "text-red-600 dark:text-red-300"
        };
      default:
        return {
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-600 dark:text-gray-300"
        };
    }
  };

  const subscriptionColors = getSubscriptionColors();

  // Function to get gradient color based on completion percentage
  const getCompletionGradientClass = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
    if (percentage >= 50) return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";
  };

  const completionPercentage = userStats.profileCompletion?.completionPercentage || 0;
  const completionColorClass = getCompletionGradientClass(completionPercentage);

  // Get translations for the completion steps
  const completionStepsTranslations = {
    completed_profile_info: t("completionSteps.completed_profile_info"),
    uploaded_profile_photo: t("completionSteps.uploaded_profile_photo"),
    verified: t("completionSteps.verified"),
    subscribed: t("completionSteps.subscribed"),
    participated_in_event: t("completionSteps.participated_in_event"),
    bookmarked_event: t("completionSteps.bookmarked_event"),
    created_event: t("completionSteps.created_event"),
    close: t("close"),
    completionDetailsTitle: t("completionDetailsTitle"),
    completionDetailsDescription: t("completionDetailsDescription"),
    viewCompletionDetails: t("viewCompletionDetails"),
    profileCompletion: t("profileCompletion"),
    completedSteps: t("completedSteps")
  };

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
        {/* Profile completion card - dynamic percentage */}
        <ProfileCard locale={locale}>
          {userStats.profileCompletion && (
            <ProfileCompletionCard
              profileCompletion={userStats.profileCompletion}
              completionColorClass={completionColorClass}
              translations={completionStepsTranslations}
              locale={locale}
              isRtl={isRtl}
            />
          )}
        </ProfileCard>
        
        {/* Verification status card - always show */}
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

        {/* Subscription status card - always show */}
        <ProfileCard locale={locale}>
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full ${subscriptionColors.bgColor} ${subscriptionColors.textColor} ${isRtl ? 'ml-4' : 'mr-4'}`}
            >
              <HiOutlineClock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{subscriptionT("subscriptionStatus")}</h3>
              <p className="text-3xl font-bold mt-1">{getStatusText()}</p>
              {getDaysRemainingText() && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {getDaysRemainingText()}
                </p>
              )}
            </div>
          </div>
        </ProfileCard>
      </div>

      {/* User-specific stats section */}
      {profileData.user_type === "researcher" && userStats.researcher && (
        <ProfileStats 
          userType="researcher"
          stats={userStats.researcher}
          locale={locale}
        />
      )}

      {profileData.user_type === "organizer" && userStats.organizer && (
        <ProfileStats
          userType="organizer"
          stats={userStats.organizer}
          locale={locale}
        />
      )}

      <div className="grid grid-cols-1 gap-6">
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
