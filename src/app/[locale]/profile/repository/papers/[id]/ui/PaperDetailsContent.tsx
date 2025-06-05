'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard';
import PaperMetadata from './PaperMetadata';
import PaperDownload from './PaperDownload';
import LoadingState from './LoadingState';
import type { Database } from '@/database.types';

// Extend the Paper type to include analytics data
type Paper = Database['public']['Functions']['discover_papers']['Returns'][0] & {
  view_count?: number;
  download_count?: number;
};

interface PaperDetailsContentProps {
  paper: Paper;
  eventName: string;
  title: string;
  abstract: string;
  locale: string;
}

export default function PaperDetailsContent({
  paper,
  eventName,
  title,
  abstract,
  locale
}: PaperDetailsContentProps) {
  const t = useTranslations('ResearchRepository.paperDetails');
  const isRtl = locale === 'ar';
  const [isLoading, setIsLoading] = useState(true);

  // For now, just use a simple timeout for loading
  // We'll improve this later by updating the child components
  useEffect(() => {
    // Give time for all components to load their data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Use a longer timeout to ensure everything is loaded
    
    return () => clearTimeout(timer);
  }, []);

  // If still loading, show loading skeleton
  if (isLoading) {
    return <LoadingState locale={locale} />;
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Paper Header */}
      <ProfileCard locale={locale}>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h1>

            {paper.author_name && (
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('author')}: {paper.author_name}
                    </p>
                    {paper.author_institution && (
                      <p className="text-sm text-gray-600">
                        {paper.author_institution}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProfileCard>

      {/* Paper Content Sections */}
      <div className="space-y-6">
        {/* Metadata Section */}
        <ProfileCard title={t('metadata')} locale={locale}>
          <PaperMetadata 
            paper={paper} 
            eventName={eventName} 
            locale={locale} 
          />
        </ProfileCard>

        {/* Abstract Section */}
        {abstract && (
          <ProfileCard title={t('abstract')} locale={locale}>
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {abstract}
              </div>
            </div>
          </ProfileCard>
        )}

        {/* Download Section */}
        <ProfileCard title={t('download')} locale={locale}>
          <PaperDownload 
            paper={paper} 
            locale={locale} 
          />
        </ProfileCard>
      </div>
    </div>
  );
} 