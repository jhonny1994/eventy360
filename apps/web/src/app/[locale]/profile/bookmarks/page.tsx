import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProfilePageHeader from "../ui/ProfilePageHeader";
import ProfileCard from "../ui/ProfileCard";
import EventCardGrid from "@/components/events/discovery/EventCardGrid";
import { getBookmarkedEvents } from "./actions";
import { BookmarkCheck } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Bookmarks");

  return {
    title: t("title"),
    description: t("emptyStateDescription"),
  };
}

export default async function BookmarksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Bookmarks");

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile to verify they are a researcher
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(`/${locale}/complete-profile`);
  }

  // Only researchers can view bookmarks
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  // Fetch bookmarked events
  const { events, error } = await getBookmarkedEvents(locale);

  if (error) {
    // Continue with empty bookmarks
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={t("title")}
        iconName="documentText" // Using existing icon for now
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      >
        <div className="flex items-center text-sm text-gray-500">
          <BookmarkCheck className="w-5 h-5 mr-1 text-blue-500" />
          <span>{t("bookmarkedCount", { count: events.length })}</span>
        </div>
      </ProfilePageHeader>

      <ProfileCard locale={locale}>
        <div className="min-h-[300px]">
          <EventCardGrid
            events={events || []}
            isLoading={false}
          />
        </div>
      </ProfileCard>
    </div>
  );
} 
