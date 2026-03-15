import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProfilePageHeader from "../ui/ProfilePageHeader";
import ProfileCard from "../ui/ProfileCard";
import SubmissionsList from "./ui/SubmissionsList";

// Define types that match the Submission interface in SubmissionsList
interface Submission {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  full_paper_status?: string;
  full_paper_file_url?: string;
  title_translations: {
    ar: string;
    en?: string;
    fr?: string;
  };
  events: {
    id: string;
    event_name_translations: {
      ar: string;
      en?: string;
      fr?: string;
    };
    event_type: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Submissions");

  return {
    title: t("mySubmissions"),
    description: t("mySubmissionsDescription"),
  };
}

export default async function ProfileSubmissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Submissions");

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get user profile to verify they are a researcher
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(`/${locale}/profile/complete`);
  }

  // Only researchers can view submissions
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  // Fetch user's submissions
  const { data: submissionsData, error: submissionsError } = await supabase
    .from("submissions")
    .select(`
      id,
      created_at,
      updated_at,
      abstract_status,
      full_paper_status,
      full_paper_file_url,
      title_translations,
      events (
        id,
        event_name_translations,
        event_type
      )
    `)
    .eq("submitted_by", user.id)
    .order("updated_at", { ascending: false });

  if (submissionsError) {
    // Continue with empty submissions
  }

  // Map the submissions data to match the expected Submission type
  const submissions: Submission[] = (submissionsData || []).map(item => ({
    id: item.id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    status: item.abstract_status || 'abstract_submitted',
    full_paper_status: item.full_paper_status || undefined,
    full_paper_file_url: item.full_paper_file_url || undefined,
    title_translations: item.title_translations as {
      ar: string;
      en?: string;
      fr?: string;
    },
    events: item.events as unknown as {
      id: string;
      event_name_translations: {
        ar: string;
        en?: string;
        fr?: string;
      };
      event_type: string;
    }
  }));

  // Create a button to navigate to the events page to create a new submission
  const SubmissionActions = (
    <Link
      href={`/${locale}/profile/events`}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
    >
      <Plus className="w-4 h-4 mr-1" />
      {t("submitAbstract")}
    </Link>
  );

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={t("mySubmissions")}
        iconName="documentText"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      >
        {SubmissionActions}
      </ProfilePageHeader>

      <ProfileCard locale={locale}>
        <SubmissionsList
          submissions={submissions}
          emptyMessage={t("noSubmissions")}
        />
      </ProfileCard>
    </div>
  );
} 