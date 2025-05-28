'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, Badge, Button, Spinner } from 'flowbite-react';
import { FileText, Clock, Calendar, Download, Upload } from 'lucide-react';
import Link from 'next/link';

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
  reviewer_comments?: string;
  events: {
    id: string;
    title_translations: {
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
                  <li className="mr-2">
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
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {activeTab === 'ar' && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.abstract_translations?.ar || t('notProvided')}
                </p>
              )}
              {activeTab === 'en' && submission.abstract_translations?.en && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.abstract_translations.en}
                </p>
              )}
              {activeTab === 'fr' && submission.abstract_translations?.fr && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.abstract_translations.fr}
                </p>
              )}
            </div>
          </Card>
          
          {/* Reviewer comments if any */}
          {submission.reviewer_comments && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">{t('reviewerComments')}</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.reviewer_comments}
                </p>
              </div>
            </Card>
          )}
        </div>
        
        {/* Sidebar with actions and event info */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          {/* Actions card */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">{t('actions')}</h3>
            <div className="space-y-3">
              {/* Download abstract */}
              {submission.abstract_file_url && (
                <Button 
                  as="a"
                  href={submission.abstract_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="light"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('downloadAbstract')}
                </Button>
              )}
              
              {/* Download full paper */}
              {submission.full_paper_file_url && (
                <Button 
                  as="a"
                  href={submission.full_paper_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="light"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('downloadFullPaper')}
                </Button>
              )}
              
              {/* Submit full paper button */}
              {canSubmitFullPaper && (
                <Button 
                  as={Link}
                  href={`/${locale}/profile/submissions/${submission.id}/submit-paper`}
                  color="green"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('submitFullPaper')}
                </Button>
              )}
              
              {/* Submit revision button */}
              {needsRevision && (
                <Button 
                  as={Link}
                  href={`/${locale}/profile/submissions/${submission.id}/submit-revision`}
                  color="yellow"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t('submitRevision')}
                </Button>
              )}
            </div>
          </Card>
          
          {/* Event information */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">{t('eventInformation')}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('eventName')}</div>
                <div className="font-medium">{getTitle(submission.events.title_translations)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('eventType')}</div>
                <div className="font-medium">{t(`eventTypes.${submission.events.event_type}`)}</div>
              </div>
              
              {submission.events.abstract_submission_deadline && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('abstractDeadline')}</div>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(submission.events.abstract_submission_deadline)}
                  </div>
                </div>
              )}
              
              {submission.events.full_paper_submission_deadline && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('fullPaperDeadline')}</div>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(submission.events.full_paper_submission_deadline)}
                  </div>
                </div>
              )}
              
              <Button 
                as={Link}
                href={`/${locale}/profile/events/${submission.events.id}`}
                color="light"
                className="w-full mt-2"
              >
                {t('viewEvent')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 