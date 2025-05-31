import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import ProfilePageHeader from "../../../ui/ProfilePageHeader";
import ProfileCard from "../../../ui/ProfileCard";
import BackButton from "@/components/ui/BackButton";
import RevisionUploadSection from "../../ui/RevisionUploadSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Submissions");

  return {
    title: t("submitRevision"),
    description: t("submitRevisionDescription"),
  };
}

interface SubmitRevisionPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

// Define the TranslationsObject type to match the expected structure
interface TranslationsObject {
  ar: string;
  en?: string;
  fr?: string;
}

export default async function SubmitRevisionPage({
  params,
}: SubmitRevisionPageProps) {
  const { id, locale } = await params;
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Submissions");

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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

  // Only researchers can submit revisions
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  // Fetch the specific submission to verify ownership and status
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      `
      id,
      abstract_status,
      full_paper_status,
      review_feedback_translations,
      review_date,
      events (
        id
      )
    `
    )
    .eq("id", id)
    .eq("submitted_by", user.id)
    .single();

  if (submissionError || !submission) {
    console.error("Error fetching submission:", submissionError);
    redirect(`/${locale}/profile/submissions`);
  }

  // Verify that revision was requested
  if (submission.full_paper_status !== "revision_requested") {
    redirect(`/${locale}/profile/submissions/${id}`);
  }

  // Prepare feedback data for the RevisionUploadSection with proper typing
  const feedback = {
    review_feedback_translations:
      submission.review_feedback_translations as unknown as
        | TranslationsObject
        | undefined,
    review_date: submission.review_date || undefined,
  };

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={t("submitRevision")}
        iconName="documentText"
        iconBgColor="bg-amber-100 dark:bg-amber-900"
        iconTextColor="text-amber-600 dark:text-amber-300"
        locale={locale}
      />

      <BackButton
        href={`/${locale}/profile/submissions/${id}`}
        label={t("backToSubmission")}
      />

      <ProfileCard locale={locale}>
        <RevisionUploadSection submissionId={id} feedback={feedback} />
      </ProfileCard>
    </div>
  );
}
