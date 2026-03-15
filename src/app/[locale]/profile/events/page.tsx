import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Button, Spinner } from "flowbite-react";
import Link from "next/link";
import { HiPlusCircle } from "react-icons/hi";
import EventDiscoveryContainer from "@/components/events/discovery/EventDiscoveryContainer";
import ProfilePageHeader from "../ui/ProfilePageHeader";
import ProfileCard from "../ui/ProfileCard";

type EventsPageProps = {
  searchParams: Promise<{
    search?: string;
    topics?: string;
    location?: string;
    status?: string;
    format?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
    page_size?: string;
  }>;
  params: Promise<{ locale: string }>;
};

async function ProfileEventsContent({
  searchParamsPromise,
  locale
}: {
  searchParamsPromise: EventsPageProps["searchParams"];
  locale: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isRtl = locale === "ar";
  const t = await getTranslations("Events");
  const tProfile = await getTranslations("ProfilePage");
  const searchParamsData = await searchParamsPromise;

  if (!user) {
    redirect(`/${locale}/login`);
  }
  
  // Get profile data to ensure user exists and check user type
  const { data: profileData } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profileData) {
    redirect(`/${locale}/profile/setup`);
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {" "}
      {/* Page header with consistent styling */}
      <ProfilePageHeader
        title={t("discovery.title")}
        iconName="calendar"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      >
        {/* Create Event Button - only show for organizers */}
        {profileData.user_type === "organizer" && (
          <Link href={`/${locale}/profile/events/create`}>
            <Button color="info" size="sm">
              <HiPlusCircle className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
              {tProfile("createEvent")}
            </Button>
          </Link>
        )}
      </ProfilePageHeader>
      {/* Events discovery container wrapped in ProfileCard */}
      <ProfileCard locale={locale} className="p-0">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("discovery.description")}
          </p>

          <EventDiscoveryContainer
            searchParams={searchParamsData}
            locale={locale}
          />
        </div>
      </ProfileCard>
    </div>
  );
}

/**
 * Events discovery page for researchers within the profile section
 * Shows searchable and filterable list of academic events
 * Supports Arabic RTL layout and follows existing profile UI patterns
 */
export default async function ProfileEventsPage({
  params,
  searchParams,
}: EventsPageProps) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <Spinner size="xl" />
        </div>
      }
    >
      <ProfileEventsContent searchParamsPromise={searchParams} locale={locale} />
    </Suspense>
  );
}
