'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Label, TextInput, Spinner, Alert } from 'flowbite-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { HiExclamationCircle } from 'react-icons/hi';
import { getTopicSchema, generateSlug, TopicFormData } from '@/lib/schemas/topicSchema';
import { updateTopic } from '@/utils/admin/topics';
import { useAuth } from '@/components/providers/AuthProvider';

interface TopicData {
  id: string;
  slug: string;
  name_translations: {
    ar?: string;
    en?: string;
    fr?: string;
    [key: string]: string | undefined;
  };
}

interface EditTopicModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  topic: TopicData | null;
}

export default function EditTopicModal({
  show,
  onClose,
  onSuccess,
  topic
}: EditTopicModalProps) {
  const t = useTranslations('AdminTopics.edit');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { supabase } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [originalArName, setOriginalArName] = useState('');

  const schema = getTopicSchema(useTranslations('AdminTopics.edit'));

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue
  } = useForm<TopicFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name_translations: {
        ar: '',
        en: '',
        fr: '',
      }
    }
  });

  // Load topic data when the topic prop changes
  useEffect(() => {
    if (topic) {
      // Set form values
      setValue('name_translations.ar', topic.name_translations.ar || '');
      setValue('name_translations.en', topic.name_translations.en || '');
      setValue('name_translations.fr', topic.name_translations.fr || '');
      setValue('slug', topic.slug);

      // Store original Arabic name to check if it's changed for slug regeneration
      setOriginalArName(topic.name_translations.ar || '');
      setGeneratedSlug(topic.slug);
    }
  }, [topic, setValue]);

  // Watch Arabic name to regenerate slug if necessary
  const arabicName = watch('name_translations.ar');

  // Regenerate slug only if Arabic name has changed from original
  useEffect(() => {
    if (arabicName && arabicName !== originalArName) {
      const slug = generateSlug(arabicName);
      setGeneratedSlug(slug);
      setValue('slug', slug);
    }
  }, [arabicName, originalArName, setValue]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      reset();
      setError(null);
    }
  }, [show, reset]);

  const onSubmit = async (data: TopicFormData) => {
    if (!topic) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Use the utility function to update topic
      const result = await updateTopic(supabase, topic.id, data, {
        SLUG_EXISTS: t('slugExistsError'),
        UPDATE_FAILED: t('error'),
        UNEXPECTED: t('error')
      });

      if (!result.success) {
        setError(result.error || t('error'));
        return;
      }

      reset();
      onSuccess();
      onClose();
    } catch {
      setError(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="md"
      position="center"
      popup
      dismissible
    >
      <ModalHeader className={isRtl ? "text-right" : "text-left"}>
        {t('title')}
      </ModalHeader>

      <ModalBody className={isRtl ? "rtl text-right" : "ltr text-left"}>
        {error && (
          <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div>
            <div className={`mb-2 block ${isRtl ? "text-right" : "text-left"}`}>
              <Label
                htmlFor="name_ar"
                className="text-sm font-medium"
              >
                {t('nameArLabel')}
                <span className="text-red-500 mr-1 ml-1">*</span>
              </Label>
            </div>
            <TextInput
              id="name_ar"
              placeholder={t('nameArPlaceholder')}
              {...register('name_translations.ar')}
              color={errors.name_translations?.ar ? 'failure' : undefined}
              dir="rtl"
            />
            {errors.name_translations?.ar && (
              <p className={`mt-1 text-sm text-red-600 ${isRtl ? "text-right" : "text-left"}`}>
                {errors.name_translations.ar.message}
              </p>
            )}
          </div>

          <div>
            <div className={`mb-2 block ${isRtl ? "text-right" : "text-left"}`}>
              <Label
                htmlFor="name_en"
                className="text-sm font-medium"
              >
                {t('nameEnLabel')}
              </Label>
            </div>
            <TextInput
              id="name_en"
              placeholder={t('nameEnPlaceholder')}
              {...register('name_translations.en')}
              color={errors.name_translations?.en ? 'failure' : undefined}
              dir="ltr"
            />
            {errors.name_translations?.en && (
              <p className={`mt-1 text-sm text-red-600 ${isRtl ? "text-right" : "text-left"}`}>
                {errors.name_translations.en.message}
              </p>
            )}
          </div>

          <div>
            <div className={`mb-2 block ${isRtl ? "text-right" : "text-left"}`}>
              <Label
                htmlFor="name_fr"
                className="text-sm font-medium"
              >
                {t('nameFrLabel')}
              </Label>
            </div>
            <TextInput
              id="name_fr"
              placeholder={t('nameFrPlaceholder')}
              {...register('name_translations.fr')}
              color={errors.name_translations?.fr ? 'failure' : undefined}
              dir="ltr"
            />
            {errors.name_translations?.fr && (
              <p className={`mt-1 text-sm text-red-600 ${isRtl ? "text-right" : "text-left"}`}>
                {errors.name_translations.fr.message}
              </p>
            )}
          </div>

          <div>
            <div className={`mb-2 block ${isRtl ? "text-right" : "text-left"}`}>
              <Label
                htmlFor="slug_preview"
                className="text-sm font-medium"
              >
                {t('slugPreviewLabel')}
              </Label>
            </div>
            <TextInput
              id="slug_preview"
              value={generatedSlug}
              readOnly
              disabled
              dir="ltr"
            />
          </div>

          <div className={`flex ${isRtl ? "flex-row-reverse" : "flex-row"} justify-end gap-2 mt-6`}>
            <Button
              type="submit"
              color="blue"
              disabled={!isValid || isSubmitting || !isDirty}
              className={isSubmitting ? 'flex items-center gap-2' : ''}
            >
              {isSubmitting && <Spinner size="sm" className={isRtl ? "ml-2" : "mr-2"} />}
              {isSubmitting ? t('submitting') : t('submitButton')}
            </Button>

            <Button
              color="light"
              onClick={onClose}
            >
              {t('cancelButton')}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
} 