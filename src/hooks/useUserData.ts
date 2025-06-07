import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";

export const useUserData = () => {
  const { supabase, user } = useAuth();
  const { profile } = useUserProfile();
  const t = useTranslations("Navigation");
  const locale = useLocale();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  };

  const getDisplayName = () => {
    if (!profile || !profile.profileDetails) return user?.email || t("user");

    if (profile.profileDetails.userType === "researcher") {
      return profile.profileDetails.profile.name || user?.email || t("user");
    } else if (profile.profileDetails.userType === "organizer") {
      return (
        profile.profileDetails.profile.name_translations?.ar ||
        user?.email ||
        t("user")
      );
    } else if (profile.profileDetails.userType === "admin") {
      return profile.profileDetails.profile.name || user?.email || t("user");
    }

    return user?.email || t("user");
  };

  const getProfilePictureUrl = () => {
    if (
      !profile ||
      !profile.profileDetails ||
      (profile.profileDetails.userType !== "researcher" &&
        profile.profileDetails.userType !== "organizer")
    ) {
      return null;
    }
    return profile.profileDetails.profile.profile_picture_url || null;
  };

  const displayName = getDisplayName();
  const profilePictureUrl = getProfilePictureUrl();

  return { user, profile, displayName, profilePictureUrl, handleLogout };
}; 