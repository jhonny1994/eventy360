'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Label, TextInput, Spinner, Alert } from 'flowbite-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { HiExclamationCircle } from 'react-icons/hi';
import { getTopicSchema, generateSlug, TopicFormData } from '@/lib/schemas/topicSchema';
import { createTopic } from '@/utils/admin/topics';

interface CreateTopicModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTopicModal({ 
  show, 
  onClose,
  onSuccess
}: CreateTopicModalProps) {
  const t = useTranslations('AdminTopics.create');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState('');
  
  const schema = getTopicSchema(useTranslations('AdminTopics.create'));
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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

  // Watch Arabic name to generate slug
  const arabicName = watch('name_translations.ar');
  
  // Generate slug when Arabic name changes
  useEffect(() => {
    if (arabicName) {
      const slug = generateSlug(arabicName);
      setGeneratedSlug(slug);
      setValue('slug', slug);
    } else {
      setGeneratedSlug('');
      setValue('slug', '');
    }
  }, [arabicName, setValue]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      reset();
      setError(null);
    }
  }, [show, reset]);

  const onSubmit = async (data: TopicFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the utility function to create topic
      const result = await createTopic(data, {
        SLUG_EXISTS: t('slugExistsError'),
        CREATE_FAILED: t('error'),
        UNEXPECTED: t('error')
      });
      
      if (!result.success) {
        setError(result.error || t('error'));
        return;
      }
      
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error in CreateTopicModal:', err);
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
              disabled={!isValid || isSubmitting}
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