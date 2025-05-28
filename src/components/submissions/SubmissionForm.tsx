'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { 
  getAbstractSubmissionSchema,
  AbstractSubmissionFormDataStatic
} from '@/lib/schemas/submission';
import { Button, Label, Alert, TextInput, Textarea, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';
import { submitAbstract } from '@/app/[locale]/profile/submissions/actions';
import { useRouter } from 'next/navigation';

interface SubmissionFormProps {
  eventId: string;
  onSuccess?: (submissionId: string) => void;
}

export default function SubmissionForm({ eventId, onSuccess }: SubmissionFormProps) {
  const t = useTranslations('Submissions');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');

  const schema = getAbstractSubmissionSchema(t);
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<AbstractSubmissionFormDataStatic>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      event_id: eventId,
      title_ar: '',
      abstract_ar: ''
    }
  });

  const onSubmit = async (data: AbstractSubmissionFormDataStatic) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitAbstract(data);
      
      if (result.success && result.submissionId) {
        if (onSuccess) {
          onSuccess(result.submissionId);
        } else {
          router.push(`/profile/submissions/${result.submissionId}`);
        }
      } else {
        setError(result.error || t('unknownError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLanguageSelector = () => (
    <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
      <button 
        className={`py-2 px-4 ${activeLanguage === 'ar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('ar')}
      >
        العربية <span className="text-red-500 text-xs">*</span>
      </button>
      <button 
        className={`py-2 px-4 ${activeLanguage === 'en' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('en')}
      >
        English <span className="text-gray-400 text-xs">(اختياري)</span>
      </button>
      <button 
        className={`py-2 px-4 ${activeLanguage === 'fr' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        type="button"
        onClick={() => setActiveLanguage('fr')}
      >
        Français <span className="text-gray-400 text-xs">(اختياري)</span>
      </button>
    </div>
  );

  return (
    <div className="w-full">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
        {t('submitAbstract')}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400 mb-6">
        {t('abstractSubmissionDescription')}
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {error && (
          <Alert color="failure" icon={HiExclamationCircle}>
            <span className="font-medium">{t('submissionError')}</span> {error}
          </Alert>
        )}
        
        <input type="hidden" {...register('event_id')} value={eventId} />
        
        {/* Language note */}
        <Alert color="info" icon={HiInformationCircle} className="mb-2">
          <span className="font-medium">ملاحظة:</span> اللغة العربية مطلوبة، ويمكنك إضافة اللغة الإنجليزية و/أو الفرنسية اختيارياً.
        </Alert>
        
        {/* Title section with language tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Label htmlFor="title_ar">{t('title')}</Label>
              <span className="text-red-500 ml-1">*</span>
              <HiInformationCircle 
                className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" 
                title={t('titleTooltip')} 
              />
            </div>
          </div>
          
          {renderLanguageSelector()}

          {activeLanguage === 'ar' && (
            <div>
              <TextInput
                dir="rtl"
                id="title_ar"
                placeholder={t('titlePlaceholderAr')}
                {...register('title_ar')}
                color={errors.title_ar ? "failure" : "gray"}
              />
              {errors.title_ar && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  {errors.title_ar.message}
                </p>
              )}
            </div>
          )}

          {activeLanguage === 'en' && (
            <TextInput
              id="title_en"
              placeholder={t('titlePlaceholderEn')}
              {...register('title_en')}
              color="gray"
            />
          )}

          {activeLanguage === 'fr' && (
            <TextInput
              id="title_fr"
              placeholder={t('titlePlaceholderFr')}
              {...register('title_fr')}
              color="gray"
            />
          )}
        </div>
        
        {/* Abstract section with language tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Label htmlFor="abstract_ar">{t('abstract')}</Label>
              <span className="text-red-500 ml-1">*</span>
              <HiInformationCircle 
                className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" 
                title={t('abstractTooltip')} 
              />
            </div>
          </div>
          
          {renderLanguageSelector()}

          {activeLanguage === 'ar' && (
            <div>
              <Textarea
                dir="rtl"
                id="abstract_ar"
                placeholder={t('abstractPlaceholderAr')}
                {...register('abstract_ar')}
                rows={6}
                color={errors.abstract_ar ? "failure" : "gray"}
              />
              {errors.abstract_ar && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  {errors.abstract_ar.message}
                </p>
              )}
            </div>
          )}

          {activeLanguage === 'en' && (
            <Textarea
              id="abstract_en"
              placeholder={t('abstractPlaceholderEn')}
              {...register('abstract_en')}
              rows={6}
              color="gray"
            />
          )}

          {activeLanguage === 'fr' && (
            <Textarea
              id="abstract_fr"
              placeholder={t('abstractPlaceholderFr')}
              {...register('abstract_fr')}
              rows={6}
              color="gray"
            />
          )}
        </div>
        
        {/* Abstract file upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Label htmlFor="abstract_file">{t('abstractFile')}</Label>
              <span className="text-red-500 ml-1">*</span>
              <HiInformationCircle 
                className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-1" 
                title={t('abstractFileTooltip')} 
              />
            </div>
          </div>
          
          <Controller
            name="abstract_file"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <div>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="abstract_file_input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {value?.name || t('dragDropFile')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('acceptedFileTypes')}
                      </p>
                    </div>
                    <input
                      id="abstract_file_input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...field}
                    />
                  </label>
                </div>
                {errors.abstract_file && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.abstract_file.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          <Button color="light" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </form>
    </div>
  );
} 