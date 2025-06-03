'use client';

import { useState, useEffect } from 'react';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Label, Alert, Textarea, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';
import { Database } from '@/database.types';
import { Json } from '@/database.types';
import { useRouter } from 'next/navigation';

/**
 * AbstractReviewComponent
 * 
 * This component provides an interface for reviewing abstract submissions.
 * It displays the abstract content, allows reviewers to provide feedback
 * in multiple languages, and make accept/reject decisions.
 * 
 * Features:
 * - Multi-language support for viewing abstracts and providing feedback
 * - Secure submission data fetching with error handling
 * - Contextual UI that adapts based on abstract status
 * - Feedback input with language-specific placeholders
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
  abstract_status: Database['public']['Enums']['submission_status_enum'] | null;
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
  onReviewComplete 
}: AbstractReviewComponentProps) {
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
            current_abstract_version_id,
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

  // Handle accept/reject actions
  const handleStatusUpdate = async (newStatus: 'abstract_accepted' | 'abstract_rejected') => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Call the review_abstract database function
      const { data, error } = await supabase.rpc('review_abstract', {
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
            // Use locale from our standardized hook
            router.push(`/${locale}/profile/events/${submission.event_id}/submissions/${submissionId}`);
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
  
  // Determine if abstract can be reviewed (only when status is 'abstract_submitted')
  const canReview = submission.abstract_status === 'abstract_submitted';
  
  // Use isRtl based on the active language for content directionality
  const isRtl = activeLanguage === 'ar';
  
  return (
    <Card className="w-full">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        {t('abstractReview')}
      </h5>
      
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          <span className="font-medium">{t('error')}</span> {error}
        </Alert>
      )}
      
      {!canReview && (
        <Alert color="warning" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">{t('cannotReview')}</span> 
          {t('abstractStatus')}: {t(submission.abstract_status || 'unknown')}
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
        
        <div>
          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('abstract')}</h6>
          {renderLanguageSelector()}
          <div 
            className="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600" 
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <p className="whitespace-pre-wrap">{abstract}</p>
          </div>
        </div>
        
        {submission.abstract_file_url && (
          <div className="mt-4">
            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('abstractFile')}</h6>
            <a 
              href={submission.abstract_file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {t('downloadFile')}
            </a>
          </div>
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
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              color="failure"
              onClick={() => handleStatusUpdate('abstract_rejected')}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t('reject')}
            </Button>
            <Button
              color="success"
              onClick={() => handleStatusUpdate('abstract_accepted')}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : null}
              {t('accept')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
} 