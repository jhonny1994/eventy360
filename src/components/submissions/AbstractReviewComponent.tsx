"use client";

import { useState, useEffect } from "react";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";
import { Card, Button, Label, Alert, Textarea, Spinner } from "flowbite-react";
import { HiInformationCircle, HiExclamationCircle } from "react-icons/hi";
import { Database } from "@/database.types";
import { Json } from "@/database.types";
import { useRouter } from "next/navigation";
import {
  getFeedbackForVersion,
  FeedbackItem,
} from "@/utils/submissions/feedbackHelpers";
import { MessageCircle, FileText } from "lucide-react";

/**
 * AbstractReviewComponent
 * 
 * This component provides an interface for reviewing abstract submissions.
 * It displays the abstract content, allows reviewers to provide feedback,
 * and make accept/reject decisions.
 * 
 * Features:
 * - Shows previous reviewer feedback for context
 * - Secure submission data fetching with error handling
 * - Contextual UI that adapts based on abstract status
 * - Accept/reject workflow with submission status updates
 * 
 * Standardized Patterns Used:
 * - useAuth: For Supabase client access instead of direct createClient
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and RTL support
 * - Consistent error handling and loading states
 * - Type-safe database interactions
 */

interface AbstractReviewComponentProps {
  submissionId: string;
  onReviewComplete?: () => void;
}

// Define a more specific type for JSON fields with string keys
interface TranslationObject {
  [key: string]: string;
}

// Simplified type definition for the specific data we need
interface SubmissionWithDetails {
  id: string;
  title_translations: TranslationObject;
  abstract_translations: TranslationObject;
  abstract_file_url: string | null;
  abstract_file_metadata: Json | null;
  abstract_status: Database["public"]["Enums"]["submission_status_enum"] | null;
  current_abstract_version_id: string | null;
  submitted_by: string;
  event_id: string;
  created_at: string;
  profiles?: {
    id: string;
    researcher_profiles?: {
      name: string;
    } | null;
  };
  events?: {
    id: string;
    event_name_translations: TranslationObject;
  };
}

export default function AbstractReviewComponent({ 
  submissionId, 
  onReviewComplete,
}: AbstractReviewComponentProps) {
  const t = useTranslations("Submissions");
  const locale = useLocale();
  const { supabase } = useAuth();
  const router = useRouter();
  
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[] | null>(
    null
  );

  // Fetch submission details when component mounts
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select(
            `
            id,
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata,
            abstract_status,
            current_abstract_version_id,
            submitted_by,
            event_id,
            created_at,
            profiles:submitted_by(id, researcher_profiles(name)),
            events:event_id(id, event_name_translations)
          `
          )
          .eq("id", submissionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Cast the data to our type
          const typedData = data as unknown as SubmissionWithDetails;
          setSubmission(typedData);

          // Fetch feedback items using the getFeedbackForVersion function
          if (typedData.current_abstract_version_id) {
            const items = await getFeedbackForVersion(
              supabase,
              typedData.current_abstract_version_id
            );
            if (items) {
              setFeedbackItems(items);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("unknownError"));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [submissionId, supabase, t]);

  // Handle feedback change
  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
  };

  // Handle accept/reject actions
  const handleStatusUpdate = async (
    newStatus: "abstract_accepted" | "abstract_rejected"
  ) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Call the review_abstract database function
      const { data, error } = await supabase.rpc("review_abstract", {
        p_submission_id: submissionId,
        p_status: newStatus,
        p_feedback: feedback,
      });
      
      if (error) throw error;
      
      if (data) {
        // Refresh submission data or call the onReviewComplete callback
        if (onReviewComplete) {
          onReviewComplete();
        } else {
          // Get event_id directly from the submission
          if (submission?.event_id) {
            // Use locale from our standardized hook
            router.push(
              `/${locale}/profile/events/${submission.event_id}/submissions/${submissionId}`
            );
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ar" ? "ar-DZ" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <span className="ml-2">{t("loadingSubmission")}</span>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        {t("submissionNotFound")}
      </Alert>
    );
  }
  
  // Determine if abstract can be reviewed (only when status is 'abstract_submitted')
  const canReview = submission.abstract_status === "abstract_submitted";
  
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t("abstractReview")}
      </h2>
      
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          <span className="font-medium">{t("error")}</span> {error}
        </Alert>
      )}
      
      {!canReview && (
        <Alert color="warning" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">{t("cannotReview")}</span>
          {t("abstractStatus")}:{" "}
          {t(`status.${submission.abstract_status}`)}
        </Alert>
      )}
      
      {/* Display submission info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t("submissionDetails")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("title")}
            </p>
            <p className="font-medium">
              {submission.title_translations[locale] ||
                submission.title_translations.ar ||
                ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("event")}
            </p>
            <p className="font-medium">
              {submission.events?.event_name_translations[locale] ||
                submission.events?.event_name_translations.ar ||
                ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("author")}
            </p>
            <p className="font-medium">
              {submission.profiles?.researcher_profiles?.name ||
                t("unknownAuthor")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("submissionStatus")}
            </p>
            <p className="font-medium">
              {t(`status.${submission.abstract_status}`)}
            </p>
          </div>
        </div>
        </div>
        
      {/* Abstract content */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">{t("abstract")}</h3>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="whitespace-pre-wrap">
            {submission.abstract_translations[locale] ||
              submission.abstract_translations.ar ||
              ""}
          </p>
        </div>
        
        {submission.abstract_file_url && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">{t("abstractFile")}</h4>
            <a 
              href={submission.abstract_file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              {t("downloadFile")}
            </a>
          </div>
        )}
      </div>

      {/* Previous feedback */}
      {feedbackItems && feedbackItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {t("previousFeedback")}
          </h3>
          <div className="space-y-4">
            {feedbackItems.map((item) => {
              // Determine if this is an organizer (admin/reviewer) or researcher (author) note
              const isOrganizerFeedback =
                item.role_at_submission === "organizer" ||
                item.role_at_submission === "admin";
              // Set appropriate styling based on the role
              const bgColorClass = isOrganizerFeedback
                ? "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
                : "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700";
              // Set appropriate icon based on the role
              const RoleIcon = isOrganizerFeedback ? MessageCircle : FileText;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${bgColorClass}`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <RoleIcon className="w-4 h-4" />
                      {item.provider_name ||
                        t(`roles.${item.role_at_submission}`)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {item.feedback_content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Feedback Form */}
      {canReview && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t("provideFeedback")}</h3>

          <div className="mb-4">
            <Label htmlFor="feedback" className="mb-2">
              {t("feedback")}
            </Label>
            <Alert color="info" icon={HiInformationCircle} className="mb-4">
              {t("feedbackGuidelines")}
            </Alert>
          <Textarea
            id="feedback"
              value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
              rows={6}
              placeholder={t("typeYourFeedback")}
              required
          />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              color="failure"
              onClick={() => handleStatusUpdate("abstract_rejected")}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t("reject")}
            </Button>
            <Button
              color="success"
              onClick={() => handleStatusUpdate("abstract_accepted")}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t("accept")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
} 
