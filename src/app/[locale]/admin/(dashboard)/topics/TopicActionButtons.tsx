'use client';

import { useState } from 'react';
import { Button } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import dynamic from "next/dynamic";
import DeleteTopicConfirmation from './DeleteTopicConfirmation';

const CreateTopicModal = dynamic(() => import("./CreateTopicModal"), {
  loading: () => null,
  ssr: false,
});
const EditTopicModal = dynamic(() => import("./EditTopicModal"), {
  loading: () => null,
  ssr: false,
});

export interface TopicData {
  id: string;
  slug: string;
  name_translations: {
    ar?: string;
    en?: string;
    fr?: string;
    [key: string]: string | undefined;
  };
}

interface TopicActionButtonsProps {
  variant: 'create' | 'row';
  topic?: TopicData;
  onSuccess: () => void;
}

export default function TopicActionButtons({ variant, topic, onSuccess }: TopicActionButtonsProps) {
  const t = useTranslations('AdminTopics');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Create button only
  if (variant === 'create') {
    return (
      <>
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <HiPlus className="h-5 w-5" />
          {t('createTopicButton')}
        </Button>

        <CreateTopicModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={onSuccess}
        />
      </>
    );
  }

  // Row actions (edit/delete)
  return (
    <>
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Button
          size="xs"
          color="light"
          className="border-gray-300"
          onClick={() => setShowEditModal(true)}
        >
          <span className="flex items-center gap-1">
            <HiPencil className="h-4 w-4" />
            {t('table.edit')}
          </span>
        </Button>

        <Button
          size="xs"
          color="light"
          className="text-red-700 border-gray-300"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <span className="flex items-center gap-1">
            <HiTrash className="h-4 w-4" />
            {t('table.delete')}
          </span>
        </Button>
      </div>

      {topic && (
        <>
          <EditTopicModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={onSuccess}
            topic={topic}
          />

          <DeleteTopicConfirmation
            show={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onSuccess={onSuccess}
            topic={topic}
          />
        </>
      )}
    </>
  );
}