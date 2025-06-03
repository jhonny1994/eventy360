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

/**
 * FullPaperReviewComponent
 * 
 * This component provides a comprehensive interface for reviewing full paper submissions.
 * It allows reviewers to view submission details, download the paper, provide feedback
 * in multiple languages, and make decisions (accept, reject, or request revision).
 * 
 * Features:
 * - Multi-language support for viewing content and providing feedback
 * - Secure file download for the submitted paper
 * - File metadata display (name, size)
 * - Comprehensive feedback system with language-specific inputs
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

interface FullPaperReviewComponentProps {
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
type FullPaperReviewStatus = 'full_paper_accepted' | 'full_paper_rejected' | 'revision_requested';

export default function FullPaperReviewComponent({ 
  submissionId, 
  onReviewComplete 
}: FullPaperReviewComponentProps) {
  const t = useTranslations('Submissions');
  const locale = useLocale();
  const { supabase } = useAuth();
  const router = useRouter();
  
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [feedback, setFeedback] = useState<Record<string, string>>({
    ar: '',
    en: '',
    fr: ''
  });

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
            profiles:submitted_by(id, researcher_profiles(name)),
            events:event_id(id, event_name_translations)
          `)
          .eq('id', submissionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Cast the data to our type
          setSubmission(data as unknown as SubmissionWithDetails);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('unknownError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [submissionId, supabase, t]);

  // Handle feedback change for the active language
  const handleFeedbackChange = (value: string) => {
    setFeedback(prev => ({
      ...prev,
      [activeLanguage]: value
    }));
  };

  // Handle status update actions
  const handleStatusUpdate = async (newStatus: FullPaperReviewStatus) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Call the review_full_paper database function
      const { data, error } = await supabase.rpc('review_full_paper', {
        p_submission_id: submissionId,
        p_status: newStatus,
        p_feedback_translations: feedback
      });
      
      if (error) throw error;
      
      if (data) {
        // Refresh submission data or call the onReviewComplete callback
        if (onReviewComplete) {
          onReviewComplete();
        } else {
          // Get event_id directly from the submission
          if (submission?.event_id) {
            // Use locale from our standardized hook instead of pathname parsing
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

  // Render language selector tabs
  const renderLanguageSelector = () => (
    <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
      <button 
        className={`py-2 px-4 ${activeLanguage === 'ar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('ar')}
      >
        العربية
      </button>
      <button 
        className={`py-2 px-4 ${activeLanguage === 'en' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('en')}
      >
        English
      </button>
      <button 
        className={`py-2 px-4 ${activeLanguage === 'fr' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('fr')}
      >
        Français
      </button>
    </div>
  );
  
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
        <span className="font-medium">{t('error')}</span> {t('submissionNotFound')}
      </Alert>
    );
  }
  
  // Extract submission details from the fetched data
  const title = submission.title_translations[activeLanguage] || submission.title_translations.ar || '';
  const abstract = submission.abstract_translations[activeLanguage] || submission.abstract_translations.ar || '';
  const eventTitle = submission.events?.event_name_translations[activeLanguage] || submission.events?.event_name_translations.ar || '';
  const submitterName = submission.profiles?.researcher_profiles?.name || t('unknownUser');
  
  // Get file metadata as human-readable info
  let paperFileName = t('unknownFile');
  let paperFileSize = t('unknownSize');

  try {
  const paperFileMetadata = submission.full_paper_file_metadata as unknown as FileMetadata;
    paperFileName = paperFileMetadata?.originalName || t('unknownFile');
    paperFileSize = paperFileMetadata?.size && !isNaN(paperFileMetadata.size)
    ? Math.round(paperFileMetadata.size / 1024) + ' KB' 
    : t('unknownSize');
  } catch  {
    // Keep default values if there's an error
  }
  
  // Determine if full paper can be reviewed
  // Only when status is 'full_paper_submitted' or if it's a revision under review
  const canReview = submission.full_paper_status === 'full_paper_submitted' || 
                   submission.full_paper_status === 'revision_requested';

  // Use isRtl based on the active language for content directionality
  const isRtl = activeLanguage === 'ar';
  
  return (
    <Card className="w-full">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {t('fullPaperReview')}
      </h5>
      
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          <span className="font-medium">{t('error')}</span> {error}
        </Alert>
      )}
      
      {!canReview && (
        <Alert color="warning" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">{t('cannotReview')}</span> 
          {t('fullPaperStatus')}: {t(`status.${submission.full_paper_status}` || 'unknown')}
        </Alert>
      )}
      
      {/* Submission Info Section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('event')}</h6>
            <p className="text-lg font-semibold">{eventTitle}</p>
          </div>
          <div>
            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('submittedBy')}</h6>
            <p className="text-lg font-semibold">{submitterName}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('title')}</h6>
          <p className="text-lg font-semibold" dir={isRtl ? 'rtl' : 'ltr'}>{title}</p>
        </div>
        
        <div className="mb-6">
          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('abstract')}</h6>
          {renderLanguageSelector()}
          <div 
            className="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600" 
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <p className="whitespace-pre-wrap">{abstract}</p>
          </div>
        </div>
        
        {/* Full Paper Download Section */}
        {submission.full_paper_file_url ? (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('fullPaperFile')}</h6>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-3 md:mb-0">
                <p className="font-medium">{paperFileName}</p>
                <p className="text-sm text-gray-500">{paperFileSize}</p>
              </div>
              
              <a 
                href={submission.full_paper_file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
              >
                <HiDownload className="mr-2 h-5 w-5" />
                {t('downloadPaper')}
              </a>
            </div>
          </div>
        ) : (
          <Alert color="warning" icon={HiExclamationCircle} className="mb-4">
            <span className="font-medium">{t('noPaperUploaded')}</span>
          </Alert>
        )}
      </div>
      
      {/* Feedback Form */}
      {canReview && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Label htmlFor="feedback">{t('feedback')}</Label>
              <HiInformationCircle 
                className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" 
                title={t('feedbackTooltip')} 
              />
            </div>
          </div>
          
          {renderLanguageSelector()}
          
          <Textarea
            id="feedback"
            placeholder={activeLanguage === 'ar' ? t('feedbackPlaceholderAr') : 
                         activeLanguage === 'en' ? t('feedbackPlaceholderEn') : 
                         t('feedbackPlaceholderFr')}
            rows={4}
            dir={isRtl ? 'rtl' : 'ltr'}
            value={feedback[activeLanguage]}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            disabled={submitting}
          />
          
          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              color="failure"
              onClick={() => handleStatusUpdate('full_paper_rejected')}
              disabled={submitting}
              className="mt-2 md:mt-0"
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t('reject')}
            </Button>
            <Button
              color="warning"
              onClick={() => handleStatusUpdate('revision_requested')}
              disabled={submitting}
              className="mt-2 md:mt-0"
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t('requestRevision')}
            </Button>
            <Button
              color="success"
              onClick={() => handleStatusUpdate('full_paper_accepted')}
              disabled={submitting}
              className="mt-2 md:mt-0"
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t('accept')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Current Status */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('currentStatus')}</h6>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            submission.full_paper_status === 'full_paper_accepted' ? 'bg-green-500' :
            submission.full_paper_status === 'full_paper_rejected' ? 'bg-red-500' :
            submission.full_paper_status === 'revision_requested' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}></div>
          <span>{t(`status.${submission.full_paper_status}` || 'unknown')}</span>
        </div>
      </div>
    </Card>
  );
} 