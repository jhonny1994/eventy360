'use client';

import { useEffect, useState, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { Card, Checkbox, Spinner, Alert } from 'flowbite-react';
import { useTranslations, useLocale } from 'next-intl';



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
  const t = useTranslations('ProfilePage.topicSubscriptions');
  const locale = useLocale();

  const supabase = createClient();
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [subscribedTopicIds, setSubscribedTopicIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [pendingTopicIds, setPendingTopicIds] = useState<Set<string>>(new Set());

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
          setSubscribedTopicIds(prev => new Set([...prev, topicId]));
          throw deleteError;
        }
      } else {
        setSubscribedTopicIds(prev => new Set([...prev, topicId]));

        const { error: insertError } = await supabase
          .from('researcher_topic_subscriptions')
          .insert([{ profile_id: userId, topic_id: topicId }]);

        if (insertError) {
          setSubscribedTopicIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(topicId);
            return newSet;
          });
          throw insertError;
        }
      }
    } catch (err) {

      if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' && err.message.includes('Auth')) {
        setError(t('errorUserNotAuthenticated'));
      } else {
        const errorMessage = err instanceof Error ? err.message : t('errorUpdatingSubscription');
        setError(errorMessage);
      }
    } finally {
      setPendingTopicIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(topicId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Spinner aria-label={t('loadingAriaLabel')} size="xl" />
      </div>
    );
  }

  return (
    <Card className="mt-6"> {/* This className seems to come from the profile page itself */}
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4"> {/* Added mb-4 for spacing like other titles */}
        {t('title')}
      </h5>

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
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          {allTopics.map(topic => {
            const isSubscribed = subscribedTopicIds.has(topic.id);
            const isPending = pendingTopicIds.has(topic.id);
            const topicName = topic.name_translations[locale] || topic.name_translations.en;

            return (
              <li key={topic.id} className="py-3 sm:py-4 px-1"> {/* Added px-1 for slight internal padding */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    {isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={isSubscribed}
                        onChange={() => handleToggleSubscription(topic.id)}
                        disabled={isPending}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`topic-${topic.id}`}
                      className={`truncate text-sm font-medium ${isPending
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-white cursor-pointer'
                        }`}
                    >
                      {topicName}
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
} 