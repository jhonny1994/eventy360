import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProfilePageHeader from "../ui/ProfilePageHeader";
import ProfileCard from "../ui/ProfileCard";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Security page for managing password changes and security settings
 * Enhanced with better layout and RTL support
 */
export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get translations for security-specific phrases
  const tSecurity = await getTranslations({ locale, namespace: "ProfilePage" });

  // Redirect if not authenticated
  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={tSecurity("security.title")}
        iconName="lock"
        iconBgColor="bg-gray-100 dark:bg-gray-800"
        iconTextColor="text-gray-600 dark:text-gray-300"
        locale={locale}
      />

      {/* Password change section */}
      <ProfileCard
        locale={locale}
        title={tSecurity("security.changePassword")}
        iconName="lock"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
      >
        <p className="text-gray-500 mb-4">
          {tSecurity("security.passwordDescription")}
        </p>
        <div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {tSecurity("security.changePasswordButton")}
          </button>
        </div>
      </ProfileCard>

      {/* Two-factor authentication section */}
      <ProfileCard
        locale={locale}
        title={tSecurity("security.twoFactorAuth")}
        iconName="shield"
        iconBgColor="bg-green-100 dark:bg-green-900"
        iconTextColor="text-green-600 dark:text-green-300"
      >
        <p className="text-gray-500 mb-4">
          {tSecurity("security.twoFactorDescription")}
        </p>
        <div>
          <button
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled
          >
            {tSecurity("security.enableTwoFactorButton")}
          </button>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {tSecurity("security.comingSoon")}
            </p>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
