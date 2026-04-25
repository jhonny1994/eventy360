"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

import RepositoryContainer from "@/components/repository/RepositoryContainer";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import useTranslations from "@/hooks/useTranslations";
import PremiumFeatureGuard from "@/app/[locale]/profile/ui/PremiumFeatureGuard";

interface RepositoryPageClientProps {
  locale: string;
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

interface RepositoryContentProps {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
  userType: 'researcher' | 'organizer';
  userId: string;
}

function RepositoryContent({ locale, searchParams, userType, userId }: RepositoryContentProps) {
  // Parse search parameters
  const parsedSearchParams = {
    search:
      typeof searchParams.search === "string" ? searchParams.search : undefined,
    topics:
      typeof searchParams.topics === "string" ? searchParams.topics : undefined,
    location:
      typeof searchParams.location === "string"
        ? searchParams.location
        : undefined,
    daira:
      typeof searchParams.daira === "string" ? searchParams.daira : undefined,
    start_date:
      typeof searchParams.start_date === "string"
        ? searchParams.start_date
        : undefined,
    end_date:
      typeof searchParams.end_date === "string"
        ? searchParams.end_date
        : undefined,
    researcher:
      typeof searchParams.researcher === "string"
        ? searchParams.researcher
        : undefined,
    page: typeof searchParams.page === "string" ? searchParams.page : undefined,
    page_size:
      typeof searchParams.page_size === "string"
        ? searchParams.page_size
        : undefined,
  };

  // Pass organizer_id only if the user is an organizer
  const organizerId = userType === 'organizer' ? userId : undefined;

  return (
    <RepositoryContainer
      searchParams={parsedSearchParams}
      locale={locale}
      organizerId={organizerId}
    />
  );
}

export default function RepositoryPageClient({
  locale,
  searchParams,
}: RepositoryPageClientProps) {
  const router = useRouter();
  const t = useTranslations("ResearchRepository");
  const commonT = useTranslations("Common");

  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
        <span className="ml-2 text-gray-500">{commonT("loading")}</span>
      </div>
    );
  }

  if (!user) {
    router.push(
        `/${locale}/login`
    );
    return null; // Render nothing while redirecting
  }

  if (profileError || !profile?.baseProfile) {
    // Handle error or missing profile - redirect to profile setup or show error
      router.push(`/${locale}/complete-profile`);
    return null;
  }

  // Allow both researchers and organizers to access the repository
  if (profile.baseProfile.user_type !== "researcher" && profile.baseProfile.user_type !== "organizer") {
    router.push(`/${locale}/profile`);
    return null;
  }

  const pageTitle = profile.baseProfile.user_type === "researcher"
    ? t("title")
    : t("titleForOrganizer");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>
      <PremiumFeatureGuard>
        <RepositoryContent
          locale={locale}
          searchParams={searchParams}
          userType={profile.baseProfile.user_type as 'researcher' | 'organizer'}
          userId={user.id}
        />
      </PremiumFeatureGuard>
    </div>
  );
}
