import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
      <PageHeader
        title={t("submitRevision")}
        description={t("submitRevisionDescription")}
      />

      <Link
        href={`/${locale}/profile/submissions/${id}`}
        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("backToSubmission")}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <RevisionUploadSection submissionId={id} feedback={feedback} />
      </div>
    </div>
  );
}
