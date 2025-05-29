'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button, Label, Alert, Spinner, FileInput } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';
import { FileText, Upload } from 'lucide-react';
import { submitFullPaper } from '@/app/[locale]/profile/submissions/actions';
import { 
  getFullPaperSubmissionSchema, 
  FullPaperSubmissionFormDataStatic,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '@/lib/schemas/submission';

interface FullPaperUploadSectionProps {
  submissionId: string;
}

export default function FullPaperUploadSection({ submissionId }: FullPaperUploadSectionProps) {
  const t = useTranslations('Submissions');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const schema = getFullPaperSubmissionSchema(t);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<FullPaperSubmissionFormDataStatic>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      submission_id: submissionId
    }
  });

  const selectedFile = watch('full_paper_file');

  const onSubmit = async (data: FullPaperSubmissionFormDataStatic) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitFullPaper(data);
      
      if (result.success) {
        // Refresh the page to show updated status
        router.refresh();
      } else {
        setError(result.error || t('fullPaperSubmissionError'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {t('uploadFullPaper')}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert color="failure" icon={HiExclamationCircle}>
            <span className="font-medium">{t('uploadError')}</span> {error}
          </Alert>
        )}
        
        <input type="hidden" {...register('submission_id')} value={submissionId} />
        
        <Alert color="info" icon={HiInformationCircle} className="mb-3">
          <span className="font-medium">{t('fileRequirements')}</span>
          <ul className="mt-1.5 list-disc list-inside">
            <li>{t('acceptedFileFormats')}: PDF, DOC, DOCX</li>
            <li>{t('maxFileSize')}: {formatBytes(MAX_FILE_SIZE)}</li>
            <li>{t('dragAndDropAllowed')}</li>
          </ul>
        </Alert>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="full_paper_file">{t('fullPaperFile')}</Label>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="full_paper_file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {selectedFile ? (
                  <>
                    <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      {selectedFile.name} ({formatBytes(selectedFile.size)})
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('dragDropFile')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('acceptedFileTypes')}
                    </p>
                  </>
                )}
              </div>
              <FileInput
                id="full_paper_file"
                {...register('full_paper_file')}
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </label>
          </div>
          
          {errors.full_paper_file && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.full_paper_file.message}
            </p>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            color="blue"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t('uploading')}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                {t('submitFullPaper')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 