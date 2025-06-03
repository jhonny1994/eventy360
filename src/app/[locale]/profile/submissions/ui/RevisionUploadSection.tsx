'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { Button, Label, Alert, Spinner, Textarea } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';
import { FileText, Upload, MessageCircle } from 'lucide-react';
import { submitRevision } from '@/app/[locale]/profile/submissions/actions';
import { 
  getRevisionSubmissionSchema, 
  MAX_FILE_SIZE
} from '@/lib/schemas/submission';
import useTranslations from '@/hooks/useTranslations';

interface RevisionUploadSectionProps {
  submissionId: string;
  feedback?: {
    review_feedback_translations?: {
      ar: string;
      en?: string;
      fr?: string;
    };
    review_date?: string;
  };
}

interface RevisionSubmissionForm {
  submission_id: string;
  full_paper_file?: File;
  revision_notes?: string;
}

/**
 * RevisionUploadSection Component
 * 
 * This component allows users to upload a revised paper file for their submission.
 * It provides a form with file validation, progress feedback, revision notes, and error handling.
 * It also displays reviewer feedback when available to guide the revision process.
 * 
 * Features:
 * - File type validation (.pdf, .doc, .docx only)
 * - File size validation (max 10MB)
 * - Form validation using zod schema
 * - Upload progress indicator
 * - Revision notes field for explaining changes
 * - Reviewer feedback display with proper localization
 * - Error handling and user feedback
 * - Responsive design
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - Form validation with react-hook-form and zod
 * - Component-based architecture with clear separation of concerns
 * - Consistent error handling and user feedback
 * - Locale-aware date formatting
 */
export default function RevisionUploadSection({ submissionId, feedback }: RevisionUploadSectionProps) {
  const t = useTranslations('Submissions');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const schema = getRevisionSubmissionSchema(t);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<RevisionSubmissionForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      submission_id: submissionId
    }
  });

  const selectedFile = watch('full_paper_file');

  const onSubmit = async (data: RevisionSubmissionForm) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitRevision(data);
      
      if (result.success) {
        // Instead of just refreshing, navigate to the submission page with a timestamp to force reload
        router.push(`/${params.locale}/profile/submissions/${submissionId}?t=${Date.now()}`);
      } else {
        setError(result.error || t('revisionSubmissionError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get feedback text based on locale
  const getFeedbackText = () => {
    if (!feedback?.review_feedback_translations) return null;
    
    if (locale === 'ar') return feedback.review_feedback_translations.ar;
    if (locale === 'en' && feedback.review_feedback_translations.en) 
      return feedback.review_feedback_translations.en;
    if (locale === 'fr' && feedback.review_feedback_translations.fr) 
      return feedback.review_feedback_translations.fr;
    
    return feedback.review_feedback_translations.ar; // Default to Arabic
  };

  // Format review date
  const formatReviewDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {t('uploadRevision')}
      </h3>
      
      {/* Show reviewer feedback if available */}
      {feedback && getFeedbackText() && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mb-2">
            <MessageCircle className="w-4 h-4" />
            {t('reviewerFeedback')}
            {feedback.review_date && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ms-2">
                ({formatReviewDate(feedback.review_date)})
              </span>
            )}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
            {getFeedbackText()}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert color="failure" icon={HiExclamationCircle}>
            <span className="font-medium">{t('uploadError')}</span> {error}
          </Alert>
        )}
        
        <input type="hidden" {...register('submission_id')} value={submissionId} />
        
        <Alert color="info" icon={HiInformationCircle} className="mb-3">
          <span className="font-medium">{t('fileRequirements')}</span>
          <ul className="mt-1.5 list-disc list-inside">
            <li>{t('acceptedFileFormats')}: PDF, DOC, DOCX</li>
            <li>{t('maxFileSize')}: {formatBytes(MAX_FILE_SIZE)}</li>
            <li>{t('dragAndDropAllowed')}</li>
          </ul>
        </Alert>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="full_paper_file">{t('revisedPaperFile')}</Label>
          </div>
          
          <Controller
            name="full_paper_file"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="full_paper_file_input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {value ? (
                      <>
                        <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {value.name} {value.size ? `(${formatBytes(value.size)})` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('dragDropFile')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('acceptedFileTypes')}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="full_paper_file_input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                      }
                    }}
                    {...field}
                  />
                </label>
              </div>
            )}
          />
          
          {errors.full_paper_file && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.full_paper_file.message as string}
            </p>
          )}
        </div>
        
        {/* Revision notes field */}
        <div>
          <div className="mb-2">
            <Label htmlFor="revision_notes">{t('revisionNotes')}</Label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('revisionNotesHelp')}
            </p>
          </div>
          <Textarea
            id="revision_notes"
            {...register('revision_notes')}
            rows={4}
            placeholder={t('revisionNotesPlaceholder')}
            className="w-full"
          />
          {errors.revision_notes && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.revision_notes.message as string}
            </p>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            color="warning"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t('uploading')}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                {t('submitRevision')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 