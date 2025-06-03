'use client';

import { useState, useEffect } from 'react';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Label, Alert, Textarea, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle, HiDownload } from 'react-icons/hi';
import { Database } from '@/database.types';
import { Json } from '@/database.types';
import { useRouter } from 'next/navigation';
import { getFeedbackForVersion, FeedbackItem } from '@/utils/submissions/feedbackHelpers';
import { MessageCircle, FileText } from 'lucide-react';

/**
 * RevisionReviewComponent
 * 
 * This component provides an interface for reviewing paper revisions.
 * It allows organizers to view previous feedback, review the revision,
 * and make a final decision on the paper (accept, reject, or request another revision).
 * 
 * Features:
 * - Shows previous reviewer feedback for context
 * - Secure file download for the revised paper
 * - File metadata display (name, size)
 * - Three-way decision process (accept/reject/revise)
 * - Status indicators and validation
 * 
 * Standardized Patterns Used:
 * - useAuth: For secure Supabase client access
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and RTL support
 * - Consistent error handling and loading states
 * - Type-safe database interactions with proper TypeScript interfaces
 */

interface RevisionReviewComponentProps {
  submissionId: string;
  onReviewComplete?: () => void;
}

// Define a more specific type for JSON fields with string keys
interface TranslationObject {
  [key: string]: string;
}

// Type for file metadata
interface FileMetadata {
  originalName?: string;
  size?: number;
  contentType?: string;
  [key: string]: unknown;
}

// Simplified type definition for the specific data we need
interface SubmissionWithDetails {
  id: string;
  title_translations: TranslationObject;
  abstract_translations: TranslationObject;
  abstract_file_url: string | null;
  abstract_file_metadata: Json | null;
  abstract_status: Database['public']['Enums']['submission_status_enum'] | null;
  full_paper_file_url: string | null;
  full_paper_file_metadata: Json | null;
  full_paper_status: Database['public']['Enums']['submission_status_enum'] | null;
  current_abstract_version_id: string | null;
  current_full_paper_version_id: string | null;
  submitted_by: string;
  event_id: string;
  created_at: string;
  updated_at: string;
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

// Type for the review status options
type RevisionReviewStatus = 'full_paper_accepted' | 'full_paper_rejected' | 'revision_requested';

export default function RevisionReviewComponent({ 
  submissionId, 
  onReviewComplete 
}: RevisionReviewComponentProps) {
  const t = useTranslations('Submissions');
  const locale = useLocale();
  const { supabase } = useAuth();
  const router = useRouter();
  
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[] | null>(null);

  // Fetch submission details when component mounts
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            id,
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata,
            abstract_status,
            full_paper_file_url,
            full_paper_file_metadata,
            full_paper_status,
            current_abstract_version_id,
            current_full_paper_version_id,
            submitted_by,
            event_id,
            created_at,
            updated_at,
            profiles:submitted_by(id, researcher_profiles(name)),
            events:event_id(id, event_name_translations)
          `)
          .eq('id', submissionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Cast the data to our type
          const typedData = data as unknown as SubmissionWithDetails;
          setSubmission(typedData);
          
          // Fetch feedback items using the getFeedbackForVersion function
          if (typedData.current_full_paper_version_id) {
            const items = await getFeedbackForVersion(supabase, typedData.current_full_paper_version_id);
            if (items) {
              setFeedbackItems(items);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('unknownError'));
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

  // Handle status update actions
  const handleStatusUpdate = async (newStatus: RevisionReviewStatus) => {
    if (newStatus === 'revision_requested' && !feedback.trim()) {
      setError(t('feedbackRequired'));
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Call the review_full_paper database function with plain text feedback
      const { data, error } = await supabase.rpc('review_full_paper', {
        p_submission_id: submissionId,
        p_status: newStatus,
        p_feedback: feedback
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
            router.push(`/${locale}/profile/events/${submission.event_id}/manage`);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <span className="ml-2">{t('loadingSubmission')}</span>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        {t('submissionNotFound')}
      </Alert>
    );
  }
  
  // Format file metadata for display
  const getFileMetadata = () => {
    if (!submission.full_paper_file_metadata) return { name: t('unknownFile'), size: t('unknownSize') };
    
    try {
      const metadata = submission.full_paper_file_metadata as FileMetadata;
      const fileName = metadata.originalName || t('unknownFile');
      let fileSize = t('unknownSize');
      
      if (metadata.size !== undefined && typeof metadata.size === 'number') {
        const sizeInKB = Math.round(metadata.size / 1024);
        fileSize = `${sizeInKB} KB`;
      }
      
      return { name: fileName, size: fileSize };
    } catch (err) {
      console.error("Error parsing file metadata:", err);
      return { name: t('unknownFile'), size: t('unknownSize') };
    }
  };
  
  const { name: fileName, size: fileSize } = getFileMetadata();
  
  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t('reviewRevision')}
      </h2>
      
      {/* Display submission info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('submissionDetails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('title')}</p>
            <p className="font-medium">
              {submission.title_translations[locale] || submission.title_translations.ar || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('event')}</p>
            <p className="font-medium">
              {submission.events?.event_name_translations[locale] || 
                submission.events?.event_name_translations.ar || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('author')}</p>
            <p className="font-medium">
              {submission.profiles?.researcher_profiles?.name || t('unknownAuthor')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissionStatus')}</p>
            <p className="font-medium">
              {t(`status.${submission.full_paper_status}`)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Display file download section */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{t('revisedFile')}</h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{fileSize}</p>
          </div>
          {submission.full_paper_file_url && (
            <a 
              href={submission.full_paper_file_url}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 sm:mt-0 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <HiDownload className="mr-2 h-4 w-4" />
              {t('downloadFile')}
            </a>
          )}
        </div>
      </div>
      
      {/* Previous feedback */}
      {feedbackItems && feedbackItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t('previousFeedback')}</h3>
          <div className="space-y-4">
            {feedbackItems.map((item) => {
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
                      {item.provider_name || t(`Enums.user_type_enum.${item.role_at_submission}`)}
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
      
      {/* Provide feedback section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{t('provideFeedback')}</h3>
        
        {error && (
          <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
            <span className="font-medium">{t('error')}</span> {error}
          </Alert>
        )}
        
        <div className="mb-4">
          <Label htmlFor="feedback" className="mb-2">
            {t('feedback')}
          </Label>
          <Alert color="info" icon={HiInformationCircle} className="mb-4">
            {t('feedbackGuidelines')}
          </Alert>
          <Textarea 
            id="feedback" 
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            rows={6} 
            placeholder={t('typeYourFeedback')}
            required
          />
        </div>
      </div>
      
      {/* Decision buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('makeDecision')}</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            color="success"
            onClick={() => handleStatusUpdate('full_paper_accepted')}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {t('acceptPaper')}
          </Button>
          <Button
            color="failure"
            onClick={() => handleStatusUpdate('full_paper_rejected')}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {t('rejectPaper')}
          </Button>
          <Button
            color="warning"
            onClick={() => handleStatusUpdate('revision_requested')}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {t('requestAnotherRevision')}
          </Button>
        </div>
      </div>
    </Card>
  );
} 