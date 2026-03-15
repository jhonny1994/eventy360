import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge, Card } from "flowbite-react";
import { FileText, ExternalLink, Calendar, MessageCircle, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Json } from "@/database.types";
import FullPaperUploadSection from "../ui/FullPaperUploadSection";
import RevisionUploadSection from "../ui/RevisionUploadSection";
import ProfilePageHeader from "../../ui/ProfilePageHeader";
import ProfileCard from "../../ui/ProfileCard";
import BackButton from "@/components/ui/BackButton";
import { getFeedbackForVersion, FeedbackItem } from "@/utils/submissions/feedbackHelpers";

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
  review_date?: string;
  feedback_items?: FeedbackItem[];
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

// Define interface for timeline items
interface TimelineItem {
  status: string;
  changed_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: string;
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailProps) {
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

  // Only researchers can view submissions
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
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
      current_abstract_version_id,
      current_full_paper_version_id,
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
    redirect(`/${locale}/profile/submissions`);
  }

  if (!submission) {
    redirect(`/${locale}/profile/submissions`);
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
    current_abstract_version_id?: string;
    current_full_paper_version_id?: string;
  };

  // Fetch feedback for the current version
  let feedbackItems: FeedbackItem[] | null = null;
  if (!submissionError && submission) {
    const versionId = submission.current_full_paper_version_id || submission.current_abstract_version_id;
    if (versionId) {
      feedbackItems = await getFeedbackForVersion(supabase, versionId);
    }
  }

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
    feedback: typedSubmission.review_date || feedbackItems?.length ? {
      review_date: typedSubmission.review_date,
      feedback_items: feedbackItems || undefined
    } : undefined
  };

  // Determine if action buttons should be shown based on status
  const showFullPaperUpload = submissionData.abstract_status === 'abstract_accepted' &&
    !submissionData.full_paper_file_url &&
    (!submissionData.full_paper_status || submissionData.full_paper_status === '');
  const showRevisionUpload = submissionData.full_paper_status === 'revision_requested';

  // Get file metadata as human-readable info
  let paperFileName = t('unknownFile');
  let paperFileSize = t('unknownSize');

  if (submissionData.full_paper_file_metadata) {
    try {
      const metadata = submissionData.full_paper_file_metadata as { originalName?: string; size?: number };
      paperFileName = metadata?.originalName || t('unknownFile');

      // More robust size calculation to prevent NaN
      if (metadata?.size !== undefined && metadata?.size !== null && !isNaN(Number(metadata.size))) {
        const sizeInKB = Math.round(Number(metadata.size) / 1024);
        paperFileSize = `${sizeInKB} KB`;
      }
    } catch {
      // Keep default values if there's an error
    }
  }

  // Add full paper status to timeline if it exists
  const statusHistoryItems: TimelineItem[] = [{
    status: submissionData.abstract_status,
    changed_at: submissionData.created_at,
    file_url: submissionData.abstract_file_url,
    file_name: submissionData.abstract_file_metadata ?
      (submissionData.abstract_file_metadata as { originalName?: string })?.originalName || t('abstractFile') :
      t('abstractFile'),
    file_type: 'abstract'
  }];

  if (submissionData.full_paper_status) {
    statusHistoryItems.push({
      status: submissionData.full_paper_status,
      changed_at: submissionData.updated_at,
      file_url: submissionData.full_paper_file_url,
      file_name: paperFileName,
      file_type: 'full_paper',
      file_size: paperFileSize
    });
  }

  return (
    <div className="space-y-6">
      <ProfilePageHeader
        title={t("submissionDetails")}
        iconName="documentText"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      />

      <BackButton
        href={`/${locale}/profile/submissions`}
        label={t('backToSubmissions')}
      />

      <ProfileCard locale={locale}>
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
                {submissionData.full_paper_status && (
                  <Badge color={statusColors[submissionData.full_paper_status] || 'gray'}>
                    {t(`status.${submissionData.full_paper_status}`)}
                  </Badge>
                )}
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

                      {/* Add file download button if this item has a file */}
                      {item.file_url && (
                        <div className="mt-2 mb-4">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                              <p className="font-medium">{item.file_name}</p>
                              {'file_size' in item && item.file_size && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.file_size}</p>
                              )}
                            </div>
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {item.file_type === 'abstract' ? t("downloadAbstract") : t("downloadPaper")}
                            </a>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reviewer Feedback Section - Only show if available */}
              {submissionData.feedback && (
                <div className="mt-8">
                  <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t("reviewerFeedback")}
                    </h3>
                    {submissionData.feedback.review_date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {formatDateTime(submissionData.feedback.review_date)}
                      </p>
                    )}

                    {/* Display feedback items */}
                    {submissionData.feedback.feedback_items && submissionData.feedback.feedback_items.length > 0 ? (
                      <div className="space-y-4">
                        {submissionData.feedback.feedback_items.map((item) => {
                          // Determine if this is an organizer (admin/reviewer) or researcher (author) note
                          const isOrganizerFeedback = item.role_at_submission === 'organizer' || item.role_at_submission === 'admin';
                          // Set appropriate styling based on the role
                          const bgColorClass = isOrganizerFeedback
                            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
                          // Set appropriate icon based on the role
                          const RoleIcon = isOrganizerFeedback ? MessageCircle : FileText;

                          return (
                            <div key={item.id} className={`p-3 rounded-lg border ${bgColorClass}`}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                  <RoleIcon className="w-4 h-4" />
                                  {item.provider_name || t(`roles.${item.role_at_submission}`)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                {item.feedback_content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("noFeedbackProvided")}
                      </p>
                    )}
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

              {/* Full Paper Upload Section - Only show if abstract is accepted */}
              {showFullPaperUpload && (
                <FullPaperUploadSection submissionId={id} />
              )}

              {/* Revision Upload Section - Only show if revision is requested */}
              {showRevisionUpload && (
                <RevisionUploadSection submissionId={id} />
              )}
            </div>
          </div>

          {/* Right column - Event info */}
          <div className="space-y-6">
            <ProfileCard
              title={t("eventInformation")}
              locale={locale}
              iconName="calendar"
              className="h-fit"
            >
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
            </ProfileCard>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
} 