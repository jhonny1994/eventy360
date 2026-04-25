'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ExternalLink, FileText, Edit } from 'lucide-react';
import useTranslations from '@/hooks/useTranslations';
import type { Submission } from './SubmissionsList';

interface ActionButtonsProps {
  submission: Submission;
}

/**
 * ActionButtons component for rendering contextual submission action links
 * 
 * Note: This component follows the standardized hook pattern by using:
 * - useTranslations - For i18n translations
 * 
 * This is a pure UI component that displays different action buttons
 * based on the submission status.
 */
export default function ActionButtons({ submission }: ActionButtonsProps) {
  const t = useTranslations('Submissions');
  const locale = useLocale();
  
  // Generate action buttons based on submission status
  const renderActionButtons = () => {
    const buttons = [];
    
    // View details button (always present)
    buttons.push(
      <Link 
        key="view-details"
        href={`/${locale}/profile/submissions/${submission.id}`}
        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500"
      >
        <ExternalLink className="w-4 h-4" />
        {t('viewDetails')}
      </Link>
    );
    
    // Submit full paper button (for accepted abstracts)
    if (submission.status === 'abstract_accepted' && 
        !submission.full_paper_file_url && 
        (!submission.full_paper_status || submission.full_paper_status === '')) {
      buttons.push(
        <Link 
          key="submit-paper"
          href={`/${locale}/profile/submissions/${submission.id}/submit-paper`}
          className="flex items-center gap-1 text-green-600 hover:underline dark:text-green-500"
        >
          <FileText className="w-4 h-4" />
          {t('submitFullPaper')}
        </Link>
      );
    }
    
    // Submit revision button (for revision requested)
    if (submission.status === 'revision_requested' || 
        (submission.full_paper_status === 'revision_requested')) {
      buttons.push(
        <Link 
          key="submit-revision"
          href={`/${locale}/profile/submissions/${submission.id}/submit-revision`}
          className="flex items-center gap-1 text-amber-600 hover:underline dark:text-amber-500"
        >
          <Edit className="w-4 h-4" />
          {t('submitRevision')}
        </Link>
      );
    }
    
    return buttons;
  };
  
  return (
    <div className="flex flex-col gap-2">
      {renderActionButtons()}
    </div>
  );
} 