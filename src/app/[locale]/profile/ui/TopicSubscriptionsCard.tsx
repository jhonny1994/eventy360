'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Checkbox, Spinner, Alert, Badge, Toast } from 'flowbite-react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import useTranslations from '@/hooks/useTranslations';
import { HiCheck, HiX } from 'react-icons/hi';
import PremiumFeatureGuard from './PremiumFeatureGuard';

interface Topic {
  id: string;
  name_translations: {
    en: string;
    fr: string;
    ar: string;
    [key: string]: string;
  };
}

export default function TopicSubscriptionsCard() {
  return (
    <PremiumFeatureGuard>
      <TopicSubscriptionsContent />
    </PremiumFeatureGuard>
  );
}

// Separate the content to allow for the premium feature guard wrapper
function TopicSubscriptionsContent() {
  const t = useTranslations('ProfilePage.topicSubscriptions');
  const locale = useLocale();

  const { supabase } = useAuth();
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [subscribedTopicIds, setSubscribedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingTopicIds, setPendingTopicIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(t('errorFetchingData'));
        setIsLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setError(t('errorUserNotAuthenticated'));
        setUserId(null);
        setIsLoading(false);
        return;
      }

      const currentUserId = session.user.id;
      setUserId(currentUserId);

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, name_translations');

      if (topicsError) throw topicsError;

      const typedTopics: Topic[] = topicsData?.map(topic => ({
        id: topic.id,
        name_translations: topic.name_translations as Topic['name_translations']
      })) || [];

      setAllTopics(typedTopics);

      const { data: subsData, error: subsError } = await supabase
        .from('researcher_topic_subscriptions')
        .select('topic_id')
        .eq('profile_id', currentUserId);

      if (subsError) throw subsError;

      setSubscribedTopicIds(new Set((subsData || []).map(sub => sub.topic_id)));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorFetchingData');
      setError(errorMessage);
    }

    setIsLoading(false);
  }, [supabase, t]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleToggleSubscription = async (topicId: string) => {
    if (!userId) {
      setError(t('errorUserNotAuthenticated'));
      return;
    }

    const isCurrentlySubscribed = subscribedTopicIds.has(topicId);
    setPendingTopicIds(prev => new Set([...prev, topicId]));
    setError(null);

    try {
      if (isCurrentlySubscribed) {
        // Optimistically update UI first
        setSubscribedTopicIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(topicId);
          return newSet;
        });

        const { error: deleteError } = await supabase
          .from('researcher_topic_subscriptions')
          .delete()
          .match({ profile_id: userId, topic_id: topicId });

        if (deleteError) {
          // Revert change if error
          setSubscribedTopicIds(prev => new Set([...prev, topicId]));
          throw deleteError;
        }
        
        // Show success toast
        setToast({
          show: true,
          message: t('unsubscribeSuccess'),
          type: 'success'
        });
      } else {
        // Optimistically update UI first
        setSubscribedTopicIds(prev => new Set([...prev, topicId]));

        const { error: insertError } = await supabase
          .from('researcher_topic_subscriptions')
          .insert([{ profile_id: userId, topic_id: topicId }]);

        if (insertError) {
          // Revert change if error
          setSubscribedTopicIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(topicId);
            return newSet;
          });
          throw insertError;
        }
        
        // Show success toast
        setToast({
          show: true,
          message: t('subscribeSuccess'),
          type: 'success'
        });
      }
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' && err.message.includes('Auth')) {
        setError(t('errorUserNotAuthenticated'));
      } else {
        const errorMessage = err instanceof Error ? err.message : t('errorUpdatingSubscription');
        setError(errorMessage);
        
        // Show error toast
        setToast({
          show: true,
          message: errorMessage,
          type: 'error'
        });
      }
    } finally {
      setPendingTopicIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(topicId);
        return newSet;
      });
    }
  };

  const getTopicCount = () => {
    if (allTopics.length === 0) return t('noTopicsCount');
    return t('topicsCount', { count: allTopics.length });
  };

  const getSubscribedCount = () => {
    const count = subscribedTopicIds.size;
    return t('subscribedCount', { count });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Spinner aria-label={t('loadingAriaLabel')} size="xl" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t('title')}
      </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Badge color="gray" className="font-normal">
              {getTopicCount()}
            </Badge>
            <Badge color="blue" className="font-normal">
              {getSubscribedCount()}
            </Badge>
          </div>
        </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

        {/* Mimic the placeholder style of other cards */}
      {allTopics.length === 0 && !isLoading && !error && (
        <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {t('noTopicsAvailable')}
          </p>
        </div>
      )}

      {allTopics.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {allTopics.map(topic => {
            const isSubscribed = subscribedTopicIds.has(topic.id);
            const isPending = pendingTopicIds.has(topic.id);
                const topicName = topic.name_translations[locale] || topic.name_translations.ar;
                const isDisabled = isPending;

            return (
                  <li 
                    key={topic.id} 
                    className={`py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${isSubscribed ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${!isDisabled ? 'cursor-pointer' : ''}`}
                    onClick={() => !isDisabled && handleToggleSubscription(topic.id)}
                  >
                    <div className="flex items-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="flex-shrink-0 w-8 flex justify-center">
                    {isPending ? (
                          <div className="w-5 h-5 flex items-center justify-center">
                      <Spinner size="sm" />
                          </div>
                    ) : (
                          <div className="relative">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={isSubscribed}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleSubscription(topic.id);
                              }}
                              disabled={isDisabled}
                              className={isSubscribed ? 'text-blue-600 border-blue-600 focus:ring-blue-500' : ''}
                      />
                            {isSubscribed && (
                              <div className={`absolute top-2 ${locale === 'ar' ? 'right-auto -left-1' : '-right-1'} w-2 h-2 bg-blue-500 rounded-full animate-pulse`}></div>
                            )}
                          </div>
                    )}
                  </div>
                      <div className="min-w-0 flex-1 px-3">
                    <label
                      htmlFor={`topic-${topic.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-sm font-medium ${
                            isDisabled
                          ? 'text-gray-400 dark:text-gray-500'
                              : isSubscribed
                                ? 'text-blue-700 dark:text-blue-300 cursor-pointer'
                          : 'text-gray-900 dark:text-white cursor-pointer'
                        }`}
                    >
                      {topicName}
                    </label>
                  </div>
                      {isSubscribed && !isPending && (
                        <Badge color="blue" size="sm" className="flex-shrink-0">
                          {t('subscribed')}
                        </Badge>
                      )}
                </div>
              </li>
            );
          })}
        </ul>
          </div>
      )}
    </Card>

      {/* Toast notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              {toast.type === 'success' ? (
                <HiCheck className="h-5 w-5 text-green-500" />
              ) : (
                <HiX className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-white"
            >
              <span className="sr-only">Close</span>
              <HiX className="w-5 h-5" />
            </button>
          </Toast>
        </div>
      )}
    </>
  );
} 