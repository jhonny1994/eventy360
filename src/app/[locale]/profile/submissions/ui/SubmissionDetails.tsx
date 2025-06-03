'use client';

import { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'flowbite-react';
import { FileText, Clock, Calendar, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';

// Define submission status colors
const statusColors: Record<string, string> = {
  'abstract_submitted': 'blue',
  'abstract_under_review': 'purple',
  'abstract_accepted': 'green',
  'abstract_rejected': 'red',
  'full_paper_submitted': 'blue',
  'full_paper_under_review': 'purple',
  'full_paper_accepted': 'green',
  'full_paper_rejected': 'red',
  'revision_requested': 'yellow',
  'revision_submitted': 'blue',
  'revision_under_review': 'purple',
  'revision_accepted': 'green',
  'revision_rejected': 'red',
  'published': 'indigo'
};

// Define a proper type for the submission object
interface Submission {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  title_translations: {
    ar: string;
    en?: string;
    fr?: string;
  };
  abstract_translations?: {
    ar: string;
    en?: string;
    fr?: string;
  };
  abstract_file_url?: string;
  full_paper_file_url?: string;
  abstract_review_date?: string;
  full_paper_submission_date?: string;
  revision_request_date?: string;
  revision_submission_date?: string;
  final_decision_date?: string;
  reviewer_comments?: string;  events: {
    id: string;
    event_name_translations: {
      ar: string;
      en?: string;
      fr?: string;
    };
    event_type: string;
    abstract_submission_deadline?: string;
    full_paper_submission_deadline?: string;
  };
}

interface SubmissionDetailsProps {
  submission: Submission;
}

/**
 * SubmissionDetails Component
 * 
 * This component displays detailed information about a submission, including its timeline,
 * status, content, and available actions. It provides a comprehensive view of a submission's
 * lifecycle and enables users to take appropriate actions based on its current status.
 * 
 * Features:
 * - Timeline visualization of submission history
 * - Multi-language support for submission content
 * - File download capabilities for abstract and full paper
 * - Status-based action buttons (submit full paper, submit revision)
 * - Deadline awareness and validation
 * - Responsive design for all device sizes
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - useLocale: Custom hook for locale-aware formatting and rendering
 * - Component-based architecture with clear separation of concerns
 * - Consistent status color coding for visual coherence
 * - Type-safe props with TypeScript interfaces
 * - Conditional rendering based on submission status
 * - Localized date formatting
 */
export default function SubmissionDetails({ submission }: SubmissionDetailsProps) {
  const t = useTranslations('Submissions');
  const locale = useLocale();
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ar');

  // Get title based on locale
  const getTitle = (translations: { ar: string; en?: string; fr?: string }) => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };

  // Format date based on locale
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if submission can be updated with a full paper
  const canSubmitFullPaper = 
    submission.status === 'abstract_accepted' && 
    submission.events.full_paper_submission_deadline && 
    new Date(submission.events.full_paper_submission_deadline) > new Date();

  // Check if submission needs revision
  const needsRevision = submission.status === 'revision_requested';

  return (
    <div className="relative p-6">
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-gray-800/75 flex items-center justify-center z-10">
          <Spinner size="xl" />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Main submission details */}
        <div className="flex-grow space-y-6">
          {/* Title and status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getTitle(submission.title_translations)}
            </h2>
            <div className="flex items-center gap-2">
              <Badge color={statusColors[submission.status] || 'gray'} size="lg">
                {t(`status.${submission.status}`)}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: {submission.id}
              </span>
            </div>
          </div>
          
          {/* Submission timeline */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">{t('submissionTimeline')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{t('abstractSubmitted')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(submission.created_at)}
                  </div>
                </div>
              </div>
              
              {submission.abstract_review_date && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className={`w-5 h-5 ${submission.status.includes('rejected') ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <div className="font-medium">
                      {submission.status.includes('rejected') 
                        ? t('abstractRejected') 
                        : t('abstractAccepted')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(submission.abstract_review_date)}
                    </div>
                  </div>
                </div>
              )}
              
              {submission.full_paper_submission_date && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{t('fullPaperSubmitted')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(submission.full_paper_submission_date)}
                    </div>
                  </div>
                </div>
              )}
              
              {submission.revision_request_date && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">{t('revisionRequested')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(submission.revision_request_date)}
                    </div>
                  </div>
                </div>
              )}
              
              {submission.revision_submission_date && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{t('revisionSubmitted')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(submission.revision_submission_date)}
                    </div>
                  </div>
                </div>
              )}
              
              {submission.final_decision_date && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className={`w-5 h-5 ${submission.status.includes('rejected') ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <div className="font-medium">
                      {submission.status.includes('rejected') 
                        ? t('finalRejection') 
                        : t('finalAcceptance')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(submission.final_decision_date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Abstract content */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">{t('abstractContent')}</h3>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    onClick={() => setActiveTab('ar')}
                    className={`inline-block p-4 border-b-2 rounded-t-lg ${
                      activeTab === 'ar'
                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                    }`}
                  >
                    {t('abstractArabic')}
                  </button>
                </li>
                {submission.abstract_translations?.en && (
                  <li className="mr-2">
                    <button
                      onClick={() => setActiveTab('en')}
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'en'
                          ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                          : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                      }`}
                    >
                      {t('abstractEnglish')}
                    </button>
                  </li>
                )}
                {submission.abstract_translations?.fr && (
                  <li>
                    <button
                      onClick={() => setActiveTab('fr')}
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${
                        activeTab === 'fr'
                          ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                          : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                      }`}
                    >
                      {t('abstractFrench')}
                    </button>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="mb-4">
              {activeTab === 'ar' && submission.abstract_translations?.ar && (
                <p dir="rtl" className="whitespace-pre-line">
                  {submission.abstract_translations.ar}
                </p>
              )}
              {activeTab === 'en' && submission.abstract_translations?.en && (
                <p className="whitespace-pre-line">
                  {submission.abstract_translations.en}
                </p>
              )}
              {activeTab === 'fr' && submission.abstract_translations?.fr && (
                <p className="whitespace-pre-line">
                  {submission.abstract_translations.fr}
                </p>
              )}
            </div>
            
            {/* Download abstract file if available */}
            {submission.abstract_file_url && (
              <div className="mt-4">
                <Button
                  as="a"
                  href={submission.abstract_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="light"
                  size="sm"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {t('downloadAbstractFile')}
                </Button>
              </div>
            )}
          </Card>
          
          {/* Download full paper if available */}
          {submission.full_paper_file_url && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">{t('fullPaper')}</h3>
              <Button
                as="a"
                href={submission.full_paper_file_url}
                target="_blank"
                rel="noopener noreferrer"
                color="light"
                className="w-auto inline-flex"
              >
                <Download className="mr-2 h-5 w-5" />
                {t('downloadFullPaper')}
              </Button>
            </Card>
          )}
        </div>
        
        {/* Sidebar with actions and event details */}
        <div className="md:w-1/3 space-y-6">
          {/* Event info */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">
              {t('eventDetails')}
            </h3>
            <p className="font-medium text-gray-900 dark:text-white mb-4">
              {getTitle(submission.events.event_name_translations)}
            </p>
            
            {submission.events.abstract_submission_deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{t('abstractDeadline')}:</span>
                <span>{formatDate(submission.events.abstract_submission_deadline)}</span>
              </div>
            )}
            
            {submission.events.full_paper_submission_deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{t('fullPaperDeadline')}:</span>
                <span>{formatDate(submission.events.full_paper_submission_deadline)}</span>
              </div>
            )}
            
            <div className="mt-4">
              <Link href={`/${locale}/events/${submission.events.id}`} passHref>
                <Button color="light" size="sm" className="w-full">
                  {t('viewEventDetails')}
                </Button>
              </Link>
            </div>
          </Card>
          
          {/* Upload full paper button if eligible */}
          {canSubmitFullPaper && (
            <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
                {t('submitFullPaperTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('submitFullPaperDescription')}
              </p>
              <Button color="blue" className="w-full">
                <Link href={`/${locale}/profile/submissions/${submission.id}/submit-full-paper`} className="w-full flex items-center justify-center">
                  <Upload className="mr-2 h-5 w-5" />
                  {t('submitFullPaper')}
                </Link>
              </Button>
            </Card>
          )}
          
          {/* Upload revision button if needed */}
          {needsRevision && (
            <Card className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-semibold mb-2 text-amber-700 dark:text-amber-300">
                {t('submitRevisionTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('submitRevisionDescription')}
              </p>
              <Button color="warning" className="w-full">
                <Link href={`/${locale}/profile/submissions/${submission.id}/submit-revision`} className="w-full flex items-center justify-center">
                  <Upload className="mr-2 h-5 w-5" />
                  {t('submitRevision')}
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 