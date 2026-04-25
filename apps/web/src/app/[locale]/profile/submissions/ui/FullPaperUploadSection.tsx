"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { Button, Label, Alert, Spinner } from "flowbite-react";
import { HiInformationCircle, HiExclamationCircle } from "react-icons/hi";
import { FileText, Upload } from "lucide-react";
import { submitFullPaper } from "@/app/[locale]/profile/submissions/actions";
import {
  getFullPaperSubmissionSchema,
  MAX_FILE_SIZE,
} from "@/lib/schemas/submission";
import useTranslations from "@/hooks/useTranslations";

interface FullPaperUploadSectionProps {
  submissionId: string;
}

interface FullPaperSubmissionForm {
  submission_id: string;
  full_paper_file?: File;
}

/**
 * FullPaperUploadSection Component
 *
 * This component allows users to upload a full paper file for their submission.
 * It provides a form with file validation, progress feedback, and error handling.
 *
 * Features:
 * - File type validation (.pdf, .doc, .docx only)
 * - File size validation (max 10MB)
 * - Form validation using zod schema
 * - Upload progress indicator
 * - Error handling and user feedback
 * - Responsive design
 *
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - Form validation with react-hook-form and zod
 * - Component-based architecture with clear separation of concerns
 * - Consistent error handling and user feedback
 */
export default function FullPaperUploadSection({
  submissionId,
}: FullPaperUploadSectionProps) {
  const t = useTranslations("Submissions");
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = getFullPaperSubmissionSchema(t);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FullPaperSubmissionForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      submission_id: submissionId,
    },
  });

  const selectedFile = watch("full_paper_file");

  const onSubmit = async (data: FullPaperSubmissionForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitFullPaper(data);

      if (result.success) {
        // Instead of just refreshing, navigate to the submission page with a timestamp to force reload
        router.push(
          `/${
            params.locale
          }/profile/submissions/${submissionId}?t=${Date.now()}`
        );
      } else {
        setError(result.error || t("fullPaperSubmissionError"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {t("uploadFullPaper")}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert color="failure" icon={HiExclamationCircle}>
            <span className="font-medium">{t("uploadError")}</span> {error}
          </Alert>
        )}

        <input
          type="hidden"
          {...register("submission_id")}
          value={submissionId}
        />

        <Alert color="info" icon={HiInformationCircle} className="mb-3">
          <span className="font-medium">{t("fileRequirements")}</span>
          <ul className="mt-1.5 list-disc list-inside">
            <li>{t("acceptedFileFormats")}: PDF, DOC, DOCX</li>
            <li>
              {t("maxFileSize")}: {formatBytes(MAX_FILE_SIZE)}
            </li>
            <li>{t("dragAndDropAllowed")}</li>
          </ul>
        </Alert>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="full_paper_file">{t("fullPaperFile")}</Label>
          </div>

          <Controller
            name="full_paper_file"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="full_paper_file_input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {value ? (
                      <>
                        <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {value.name}{" "}
                          {value.size ? `(${formatBytes(value.size)})` : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {t("dragDropFile")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("acceptedFileTypes")}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="full_paper_file_input"
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
            )}
          />

          {errors.full_paper_file && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.full_paper_file.message as string}
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
                {t("uploading")}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                {t("submitFullPaper")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
