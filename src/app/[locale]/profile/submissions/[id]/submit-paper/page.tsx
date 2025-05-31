import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FullPaperUploadSection from "../../ui/FullPaperUploadSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Submissions");
  
  return {
    title: t("submitFullPaper"),
    description: t("fullPaperSubmissionDescription"),
  };
}

interface SubmitPaperPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function SubmitPaperPage({ params }: SubmitPaperPageProps) {
  const { id, locale } = await params;
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

  // Only researchers can submit papers
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  // Fetch the specific submission to check if abstract was accepted
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(`
      id,
      abstract_status,
      full_paper_status,
      full_paper_file_url,
      submitted_by
    `)
    .eq("id", id)
    .eq("submitted_by", user.id)
    .single();

  if (submissionError || !submission) {
    redirect(`/${locale}/profile/submissions`);
  }

  // Check if abstract was accepted
  if (submission.abstract_status !== 'abstract_accepted') {
    redirect(`/${locale}/profile/submissions/${id}`);
  }

  // Check if a full paper has already been submitted
  if (submission.full_paper_file_url || submission.full_paper_status) {
    // Paper already submitted, redirect back to submission details
    redirect(`/${locale}/profile/submissions/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("submitFullPaper")}
        description={t("fullPaperSubmissionDescription")}
      />

      <Link 
        href={`/${locale}/profile/submissions/${id}`}
        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('backToSubmission')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <FullPaperUploadSection submissionId={id} />
      </div>
    </div>
  );
} 