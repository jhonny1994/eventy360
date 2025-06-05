'use client';

import { Card } from 'flowbite-react';
import { HiDocumentText } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import type { Database } from '@/database.types';
import PaperCard from './PaperCard';

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

interface PaperCardGridProps {
  papers: Paper[];
  isLoading: boolean;
  locale: string;
  wilayas: Wilaya[];
  dairas: Daira[];
  topics: Topic[];
}

/**
 * Grid layout for paper cards
 * Features:
 * - Responsive grid layout for displaying paper cards
 * - Handles loading states with skeleton UI
 * - Provides empty state when no papers are available
 * - Supports right-to-left layout for Arabic locale
 */
export default function PaperCardGrid({
  papers,
  isLoading,
  locale,
  wilayas,
  dairas,
  topics
}: PaperCardGridProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository');

  if (isLoading && papers.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-[400px] animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <HiDocumentText className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('emptyState.title')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('emptyState.description')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {papers.map((paper) => (
        <PaperCard 
          key={paper.id} 
          paper={paper} 
          locale={locale}
          wilayas={wilayas}
          dairas={dairas}
          topics={topics}
        />
      ))}
    </div>
  );
} 