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
};

// Types for location and topic data
interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface Daira {
  id: number;
  name_ar: string;
  name_other: string;
  wilaya_id: number;
}

interface Topic {
  id: string;
  name_translations: Record<string, string>;
  slug: string;
}

interface PaperCardProps {
  paper: Paper;
  locale: string;
  wilayas: Wilaya[];
  dairas: Daira[];
  topics: Topic[];
}

/**
 * Individual paper card component
 * Displays paper information in a clean, accessible format
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 * - useLocale: For locale-aware date formatting
 */
export default function PaperCard({ paper, locale, wilayas, dairas, topics }: PaperCardProps) {
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

  // Get paper title in the current locale or fallback to another available locale
  const getPaperTitle = () => {
    const titleTranslations = paper.paper_title_translations as Record<string, string>;
    if (titleTranslations[locale]) {
      return titleTranslations[locale];
    }
    // Fallback to any available translation
    const availableLocale = Object.keys(titleTranslations).find(key => titleTranslations[key]);
    return availableLocale ? titleTranslations[availableLocale] : t('untitled');
  };

  // Get event name in the current locale or fallback to another available locale
  const getEventName = () => {
    const eventNameTranslations = paper.event_name_translations as Record<string, string>;
    if (eventNameTranslations[locale]) {
      return eventNameTranslations[locale];
    }
    // Fallback to any available translation
    const availableLocale = Object.keys(eventNameTranslations).find(key => eventNameTranslations[key]);
    return availableLocale ? eventNameTranslations[availableLocale] : t('unknownEvent');
  };

  // Get wilaya name based on ID
  const getWilayaName = (wilayaId: number) => {
    const wilaya = wilayas.find(w => w.id === wilayaId);
    if (wilaya) {
      return locale === 'ar' ? wilaya.name_ar : wilaya.name_other;
    }
    return `${t('wilaya')} ${wilayaId}`;
  };

  // Get daira name based on ID
  const getDairaName = (dairaId: number) => {
    const daira = dairas.find(d => d.id === dairaId);
    if (daira) {
      return locale === 'ar' ? daira.name_ar : daira.name_other;
    }
    return `${t('daira')} ${dairaId}`;
  };

  // Get topic name based on ID
  const getTopicName = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      const nameTranslations = topic.name_translations as Record<string, string>;
      if (nameTranslations[locale]) {
        return nameTranslations[locale];
      }
      // Fallback to any available translation
      const availableLocale = Object.keys(nameTranslations).find(key => nameTranslations[key]);
      return availableLocale ? nameTranslations[availableLocale] : topic.slug;
    }
    return topicId;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Paper Content */}
      <div className="flex-1 flex flex-col space-y-4 p-4">
        {/* Paper Title */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
            {getPaperTitle()}
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
          <span className={`${isRtl ? 'mr-2' : 'ml-2'} line-clamp-1`}>{getEventName()}</span>
        </div>

        {/* Location */}
        {paper.author_wilaya_id && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <HiLocationMarker className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 flex-shrink-0`} />
            <span>
              {getWilayaName(paper.author_wilaya_id)}
              {paper.author_daira_id && `, ${getDairaName(paper.author_daira_id)}`}
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
        {paper.event_topic_ids && paper.event_topic_ids.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {paper.event_topic_ids.slice(0, 3).map((topicId, index) => (
              <Badge key={index} color="light" size="xs">
                {getTopicName(topicId)}
              </Badge>
            ))}
            {paper.event_topic_ids.length > 3 && (
              <Badge color="light" size="xs">
                +{paper.event_topic_ids.length - 3}
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