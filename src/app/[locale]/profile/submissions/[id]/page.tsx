import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { Badge, Card } from "flowbite-react";
import { ChevronLeft, FileText, ExternalLink, Calendar, MessageCircle, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Json } from "@/database.types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Submissions");
  
  return {
    title: t("submissionDetails"), 
    description: t("submissionDetailsDescription"), 
  };
}

interface SubmissionDetailProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

// Define interfaces for type safety
interface TranslationsObject {
  ar: string;
  en?: string;
  fr?: string;
}

interface EventInfo {
  id: string;
  event_name_translations: TranslationsObject;
  event_type: string;
  event_date: string;
  event_end_date: string;
  abstract_submission_deadline?: string;
  full_paper_submission_deadline?: string;
}

interface FeedbackInfo {
  review_feedback_translations?: TranslationsObject;
  review_date?: string;
}

interface SubmissionData {
  id: string;
  created_at: string;
  updated_at: string;
  abstract_status: string;
  full_paper_status?: string;
  status?: string;
  title_translations: TranslationsObject;
  abstract_translations: TranslationsObject;
  abstract_file_url?: string;
  abstract_file_metadata?: Json;
  full_paper_file_url?: string;
  full_paper_file_metadata?: Json;
  submitted_by: string;
  submission_date: string;
  events: EventInfo;
  feedback?: FeedbackInfo;
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailProps) {
  const { id, locale } = await params;
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Submissions");

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/signin");
  }

  // Get user profile to verify they are a researcher
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/profile/complete");
  }

  // Only researchers can view submissions
  if (profile.user_type !== "researcher") {
    redirect("/profile");
  }

  // Fetch the specific submission with detailed information
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(`
      id,
      created_at,
      updated_at,
      abstract_status,
      full_paper_status,
      status,
      title_translations,
      abstract_translations,
      abstract_file_url,
      abstract_file_metadata,
      full_paper_file_url,
      full_paper_file_metadata,
      submitted_by,
      submission_date,
      review_date,
      review_feedback_translations,
      events (
        id,
        event_name_translations,
        event_type,
        event_date,
        event_end_date,
        abstract_submission_deadline,
        full_paper_submission_deadline
      )
    `)
    .eq("id", id)
    .eq("submitted_by", user.id)
    .single();

  if (submissionError) {
    console.error("Error fetching submission:", submissionError);
    redirect("/profile/submissions");
  }

  if (!submission) {
    redirect("/profile/submissions");
  }

  // Ensure we're working with the expected submission type
  const typedSubmission = submission as unknown as {
    id: string;
    created_at: string;
    updated_at: string;
    abstract_status: string;
    full_paper_status?: string;
    status?: string;
    title_translations: TranslationsObject;
    abstract_translations: TranslationsObject;
    abstract_file_url?: string;
    abstract_file_metadata?: Json;
    full_paper_file_url?: string;
    full_paper_file_metadata?: Json;
    submitted_by: string;
    submission_date: string;
    events: EventInfo;
    review_date?: string;
    review_feedback_translations?: TranslationsObject;
  };

  // Define status colors
  const statusColors: Record<string, string> = {
    abstract_submitted: "info",
    abstract_under_review: "info",
    abstract_accepted: "success",
    abstract_rejected: "failure",
    full_paper_submitted: "purple",
    full_paper_under_review: "purple",
    full_paper_accepted: "success",
    full_paper_rejected: "failure",
    revision_requested: "warning",
    revision_submitted: "info",
    revision_under_review: "info",
    revision_accepted: "success",
    revision_rejected: "failure",
    published: "success",
    completed: "success"
  };

  // Define status icons for timeline
  const statusIcons: Record<string, React.ReactNode> = {
    abstract_submitted: <FileText className="h-5 w-5" />,
    abstract_under_review: <MessageCircle className="h-5 w-5" />,
    abstract_accepted: <CheckCircle className="h-5 w-5" />,
    abstract_rejected: <XCircle className="h-5 w-5" />,
    full_paper_submitted: <FileText className="h-5 w-5" />,
    full_paper_under_review: <MessageCircle className="h-5 w-5" />,
    full_paper_accepted: <CheckCircle className="h-5 w-5" />,
    full_paper_rejected: <XCircle className="h-5 w-5" />,
    revision_requested: <AlertCircle className="h-5 w-5" />,
    revision_submitted: <FileText className="h-5 w-5" />,
    revision_under_review: <MessageCircle className="h-5 w-5" />,
    revision_accepted: <CheckCircle className="h-5 w-5" />,
    revision_rejected: <XCircle className="h-5 w-5" />,
    published: <CheckCircle className="h-5 w-5" />,
    completed: <CheckCircle className="h-5 w-5" />
  };

  // Get title based on locale
  const getTitle = (translations: TranslationsObject): string => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };

  // Format date 
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fix the type casting for submission data
  const submissionData: SubmissionData = {
    id: typedSubmission.id,
    created_at: typedSubmission.created_at,
    updated_at: typedSubmission.updated_at,
    abstract_status: typedSubmission.abstract_status,
    full_paper_status: typedSubmission.full_paper_status,
    status: typedSubmission.status,
    title_translations: typedSubmission.title_translations,
    abstract_translations: typedSubmission.abstract_translations,
    abstract_file_url: typedSubmission.abstract_file_url,
    abstract_file_metadata: typedSubmission.abstract_file_metadata,
    full_paper_file_url: typedSubmission.full_paper_file_url,
    full_paper_file_metadata: typedSubmission.full_paper_file_metadata,
    submitted_by: typedSubmission.submitted_by,
    submission_date: typedSubmission.submission_date,
    events: typedSubmission.events,
    feedback: typedSubmission.review_feedback_translations || typedSubmission.review_date ? {
      review_feedback_translations: typedSubmission.review_feedback_translations,
      review_date: typedSubmission.review_date
    } : undefined
  };

  // Determine if action buttons should be shown based on status
  const showFullPaperUpload = submissionData.abstract_status === 'abstract_accepted';
  const showRevisionUpload = submissionData.abstract_status === 'revision_requested';

  // Create timeline items from available status information
  const statusHistoryItems = [{ 
    status: submissionData.abstract_status, 
    changed_at: submissionData.created_at 
  }];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("submissionDetails")}
        description={t("submissionDetailsDescription")}
      />

      <Link 
        href={`/${locale}/profile/submissions`}
        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('backToSubmissions')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Submission info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {getTitle(submissionData.title_translations)}
              </h2>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge color={statusColors[submissionData.abstract_status] || 'gray'}>
                  {t(`status.${submissionData.abstract_status}`)}
                </Badge>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("lastUpdated")}: {formatDate(submissionData.updated_at)}
                </span>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t("abstract")}
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {submissionData.abstract_translations && 
                     getTitle(submissionData.abstract_translations)}
                  </p>
                </div>
              </div>

              {/* Status Timeline Section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t("submissionTimeline")}
                </h3>
                <ol className="relative border-s border-gray-200 dark:border-gray-700">
                  {statusHistoryItems.map((item, index) => (
                    <li key={index} className="mb-10 ms-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-800 dark:bg-blue-900">
                        {statusIcons[item.status]}
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {t(`status.${item.status}`)}
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {formatDateTime(item.changed_at)}
                      </time>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reviewer Feedback Section - Only show if available */}
              {submissionData.feedback && submissionData.feedback.review_feedback_translations && (
                <div className="mt-8">
                  <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {t("reviewerFeedback")}
                    </h3>
                    {submissionData.feedback.review_date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {formatDateTime(submissionData.feedback.review_date)}
                      </p>
                    )}
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {getTitle(submissionData.feedback.review_feedback_translations)}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Action Buttons Section - Only show if applicable */}
              {(showFullPaperUpload || showRevisionUpload) && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t("actions")}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {showFullPaperUpload && (
                      <Link 
                        href={`/${locale}/profile/submissions/${id}/submit-paper`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                      >
                        <FileText className="w-4 h-4" />
                        {t("submitFullPaper")}
                      </Link>
                    )}
                    
                    {showRevisionUpload && (
                      <Link 
                        href={`/${locale}/profile/submissions/${id}/submit-revision`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                      >
                        <FileText className="w-4 h-4" />
                        {t("submitRevision")}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Event info */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t("eventInformation")}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("eventName")}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getTitle(submissionData.events.event_name_translations)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("eventType")}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(`eventTypes.${submissionData.events.event_type}`)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("eventDates")}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(submissionData.events.event_date)} - {formatDate(submissionData.events.event_end_date)}
                  </p>
                </div>
                
                {submissionData.events.abstract_submission_deadline && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("abstractSubmissionDeadline")}</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(submissionData.events.abstract_submission_deadline)}
                    </p>
                  </div>
                )}

                {submissionData.events.full_paper_submission_deadline && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("fullPaperSubmissionDeadline")}</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(submissionData.events.full_paper_submission_deadline)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Link 
                  href={`/${locale}/profile/events/${submissionData.events.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("viewEventDetails")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 