'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Spinner, Alert } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiExclamationCircle } from 'react-icons/hi';
import { deleteTopic, getTopicUsage } from '@/utils/admin/topics';
import type { TopicData } from './TopicActionButtons';
import { useAuth } from '@/components/providers/AuthProvider';

interface DeleteTopicConfirmationProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topic: TopicData;
}

export default function DeleteTopicConfirmation({
  show,
  onClose,
  onSuccess,
  topic
}: DeleteTopicConfirmationProps) {
  const t = useTranslations('AdminTopics');
  const { supabase } = useAuth();
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for usage counts
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [usageData, setUsageData] = useState<{
    eventCount: number;
    subscriptionCount: number;
  } | null>(null);
  
  // Function to load topic usage data
  const loadUsageData = useCallback(async () => {
    setIsLoadingUsage(true);
    
    try {
      const result = await getTopicUsage(supabase, topic.id);
      
      if (result.success) {
        setUsageData({
          eventCount: result.eventCount,
          subscriptionCount: result.subscriptionCount
        });
      } else {
        console.error('Error fetching topic usage:', result.error);
        // Still continue, but without usage data
        setUsageData({ eventCount: 0, subscriptionCount: 0 });
      }
    } catch (err) {
      console.error('Unexpected error fetching topic usage:', err);
      setUsageData({ eventCount: 0, subscriptionCount: 0 });
    } finally {
      setIsLoadingUsage(false);
    }
  }, [topic.id, supabase]);
  
  // Load usage data when modal is shown
  useEffect(() => {
    if (show && topic.id) {
      loadUsageData();
    }
  }, [show, topic.id, loadUsageData]);
  
  // Function to handle topic deletion
  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deleteTopic(supabase, topic.id, {
        name: topic.name_translations.ar || 'Unknown',
        slug: topic.slug
      });
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || t('errors.deleteFailed'));
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      setError(t('errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if topic is in use
  const isInUse = usageData && (usageData.eventCount > 0 || usageData.subscriptionCount > 0);
  
  return (
    <Modal show={show} onClose={onClose} size="md" popup>
      <ModalHeader>
        {t('delete.title')}
      </ModalHeader>
      <ModalBody className="px-6 py-6">
        <div className="space-y-6">
          {error && (
            <Alert color="failure" icon={HiExclamationCircle}>
              {error}
            </Alert>
          )}
          
          <div className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
            <p className="mb-4">
              {t('delete.confirmMessage')}
            </p>
            
            {isLoadingUsage ? (
              <div className="flex items-center justify-center p-4">
                <Spinner size="sm" className="mr-2" />
                <span>Loading usage data...</span>
              </div>
            ) : isInUse ? (
              <Alert color="warning" icon={HiExclamationCircle} className="mb-4">
                <p>
                  {t('delete.inUseWarning', { 
                    eventCount: usageData?.eventCount || 0, 
                    subscriptionCount: usageData?.subscriptionCount || 0 
                  })}
                </p>
              </Alert>
            ) : null}
            
            <div className="mb-2 font-semibold">
              {t('table.name')}: 
              <span className="font-normal ml-2">
                {topic.name_translations.ar || topic.name_translations.en || t('table.untitled')}
              </span>
            </div>
            
            <div className="mb-2 font-semibold">
              {t('table.slug')}: 
              <span className="font-normal ml-2">
                {topic.slug}
              </span>
            </div>
            
            {!isLoadingUsage && usageData && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="mb-2 font-semibold">
                  {t('table.usageCount')}:
                </div>
                <ul className="list-disc list-inside pl-2 text-sm">
                  <li>
                    {t('table.eventCount', { eventCount: usageData.eventCount })}
                  </li>
                  <li>
                    {t('table.subscriptionCount', { subscriptionCount: usageData.subscriptionCount })}
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              color="light"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('delete.cancelButton')}
            </Button>
            <Button
              color="failure"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {t('delete.submitting')}
                </>
              ) : isInUse ? (
                t('delete.deleteAnyway')
              ) : (
                t('delete.confirmButton')
              )}
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}