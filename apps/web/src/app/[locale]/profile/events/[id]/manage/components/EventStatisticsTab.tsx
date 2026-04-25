'use client';

import { useState, useEffect } from 'react';
import { Spinner, Card, Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import useTranslations from '@/hooks/useTranslations';
import SubmissionStatusChart from './charts/SubmissionStatusChart';
import MetricsGrid from './charts/MetricsGrid';
import SubmissionTimelineChart from './charts/SubmissionTimelineChart';

// Type for the event submission stats from database
type SubmissionStats = {
  total_submissions: number;
  abstract_submitted: number;
  abstract_accepted: number;
  abstract_rejected: number;
  full_paper_submitted: number;
  full_paper_accepted: number;
  full_paper_rejected: number;
  revision_requested: number;
  completed: number;
};

interface EventStatisticsTabProps {
  eventId: string;
  locale: string;
}

/**
 * EventStatisticsTab component for displaying event statistics and metrics
 * 
 * Note: This component follows the standardized hook patterns by using:
 * - useAuth - For Supabase client access
 * - useTranslations - For i18n translations
 * 
 * This component fetches and displays submission statistics for an event,
 * including metrics overview, status distribution, and submission timeline.
 */
export default function EventStatisticsTab({ eventId, locale }: EventStatisticsTabProps) {
  const { supabase } = useAuth();
  const t = useTranslations('EventStatistics');
  const [stats, setStats] = useState<SubmissionStats>({
    total_submissions: 0,
    abstract_submitted: 0,
    abstract_accepted: 0,
    abstract_rejected: 0,
    full_paper_submitted: 0,
    full_paper_accepted: 0,
    full_paper_rejected: 0,
    revision_requested: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .rpc('get_event_submission_stats', { event_id: eventId });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setStats(data[0] as SubmissionStats);
        } else {
          setStats({
            total_submissions: 0,
            abstract_submitted: 0,
            abstract_accepted: 0,
            abstract_rejected: 0,
            full_paper_submitted: 0,
            full_paper_accepted: 0,
            full_paper_rejected: 0,
            revision_requested: 0,
            completed: 0
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('fetchError'));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [eventId, supabase, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" icon={HiInformationCircle}>
        <h3 className="text-lg font-medium">{t('errorTitle')}</h3>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      {stats.total_submissions === 0 ? (
        <Card className="text-center p-6">
          <div className="py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noSubmissionsTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              {t('noSubmissionsDescription')}
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Metrics overview */}
          <MetricsGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission status distribution */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('statusDistributionTitle')}
              </h3>
              <div className="h-80">
                <SubmissionStatusChart stats={stats} />
              </div>
            </Card>

            {/* Submission timeline */}
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('timelineTitle')}
              </h3>
              <div className="h-80">
                <SubmissionTimelineChart eventId={eventId} locale={locale} />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 