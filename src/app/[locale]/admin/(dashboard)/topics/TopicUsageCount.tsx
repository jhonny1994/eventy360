'use client';

import { useState, useEffect } from 'react';
import { Spinner, Badge, Tooltip } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { getTopicUsage } from '@/utils/admin/topics';

interface TopicUsageCountProps {
  topicId: string;
}

export default function TopicUsageCount({ topicId }: TopicUsageCountProps) {
  const t = useTranslations('AdminTopics');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<{
    eventCount: number;
    subscriptionCount: number;
  } | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      setIsLoading(true);
      
      try {
        const result = await getTopicUsage(topicId);
        
        if (result.success) {
          setUsageData({
            eventCount: result.eventCount,
            subscriptionCount: result.subscriptionCount
          });
        } else {
          setError(result.error || t('errors.usageFetchFailed'));
        }
      } catch (err) {
        console.error('Error fetching topic usage:', err);
        setError(t('errors.unexpected'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [topicId, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <span className="text-red-500 text-xs">
        {t('errors.usageLoadFailed')}
      </span>
    );
  }

  if (!usageData) {
    return <span>-</span>;
  }

  const totalUsage = usageData.eventCount + usageData.subscriptionCount;
  
  return (
    <div className="flex items-center gap-2">
      <Badge color={totalUsage > 0 ? "info" : "gray"} className="font-medium">
        {totalUsage}
      </Badge>
      
      <Tooltip content={
        <div>
          <div>{t('table.eventCount', { eventCount: usageData.eventCount })}</div>
          <div>{t('table.subscriptionCount', { subscriptionCount: usageData.subscriptionCount })}</div>
        </div>
      }>
        <HiInformationCircle className="h-4 w-4 text-gray-400" />
      </Tooltip>
    </div>
  );
} 