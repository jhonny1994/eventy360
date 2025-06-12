'use client';

import { Card, Badge, Button } from 'flowbite-react';
import { HiCalendar, HiLocationMarker, HiExternalLink, HiDownload, HiUser, HiAcademicCap } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import Link from 'next/link';
import type { Database } from '@/database.types';

// Extend the Paper type to include total_records, as it's added by the SQL function
type Paper = Database['public']['Functions']['discover_papers']['Returns'][0] & {
  total_records?: number;
  view_count?: number;
  download_count?: number;
  // Enriched data
  paper_title?: string;
  event_name?: string;
  wilaya_name?: string;
  daira_name?: string;
  topic_names?: string[];
};

// Types for location and topic data are no longer needed

interface PaperCardProps {
  paper: Paper;
  locale: string;
}

/**
 * Individual paper card component
 * Displays paper information in a clean, accessible format
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 * - useLocale: For locale-aware date formatting
 */
export default function PaperCard({ paper, locale }: PaperCardProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository.paperCard');
  const currentLocale = useLocale();

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Name-getter functions are no longer needed here

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Paper Content */}
      <div className="flex-1 flex flex-col space-y-4 p-4">
        {/* Paper Title */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
            {paper.paper_title ? paper.paper_title : t('paperCard.untitled')}
          </h3>
        </div>

        {/* Author */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiUser className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
          <span className="font-medium">{t('by')}:</span>
          <span className={isRtl ? 'mr-2' : 'ml-2'}>{paper.author_name}</span>
        </div>

        {/* Institution */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiAcademicCap className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
          <span className="font-medium">{t('from')}:</span>
          <span className={isRtl ? 'mr-2' : 'ml-2'}>{paper.author_institution}</span>
        </div>

        {/* Event */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiCalendar className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
          <span className="font-medium">{t('event')}:</span>
          <span className={`${isRtl ? 'mr-2' : 'ml-2'} line-clamp-1`}>{paper.event_name ? paper.event_name : t('paperCard.unknownEvent')}</span>
        </div>

        {/* Location */}
        {paper.wilaya_name && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <HiLocationMarker className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
            <span>
              {paper.wilaya_name}
              {paper.daira_name && `, ${paper.daira_name}`}
            </span>
          </div>
        )}

        {/* Submission Date */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiCalendar className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
          <span className="font-medium">{t('date')}:</span>
          <span className={isRtl ? 'mr-2' : 'ml-2'}>{formatDate(paper.submission_date)}</span>
        </div>

        {/* Topics */}
        {paper.topic_names && paper.topic_names.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {paper.topic_names.slice(0, 3).map((topicName, index) => (
              <Badge key={index} color="light" size="xs">
                {topicName}
              </Badge>
            ))}
            {paper.topic_names.length > 3 && (
              <Badge color="light" size="xs">
                +{paper.topic_names.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Analytics */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{t('viewCount', { count: paper.view_count || 0 })}</span>
          <span>{t('downloadCount', { count: paper.download_count || 0 })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <Link href={`/${locale}/profile/repository/papers/${paper.id}`}>
            <Button size="sm" color="info">
              <HiExternalLink className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} h-4 w-4`} />
              {t('viewDetails')}
            </Button>
          </Link>
        </div>
        {paper.full_paper_file_url && (
          <Button size="sm" color="light" onClick={() => window.open(paper.full_paper_file_url, '_blank')}>
            <HiDownload className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} h-4 w-4`} />
            {t('downloadPaper')}
          </Button>
        )}
      </div>
    </Card>
  );
} 