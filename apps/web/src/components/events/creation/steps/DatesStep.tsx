/**
 * DatesStep
 * 
 * This component provides the dates selection step in the event creation process,
 * allowing organizers to set key dates for their academic event, including:
 * - Event start and end dates
 * - Abstract submission deadline
 * - Abstract review result date
 * - Full paper submission deadline
 * - Final submission verdict deadline
 * 
 * Features:
 * - Date sequence information display
 * - Date input fields with validation
 * - Required field indicators
 * - Responsive grid layout
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and display
 * - Consistent error handling and form state management
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import useTranslations from "@/hooks/useTranslations";
import { Label, TextInput } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi2";

import { CreateEventFormDataStatic as CreateEventFormData } from "@/lib/schemas/event";

interface DatesStepProps {
  form: UseFormReturn<CreateEventFormData>;
}

export default function DatesStep({ form }: DatesStepProps) {
  const t = useTranslations("Events.Creation");
  
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("dates.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("dates.description")}
        </p>
        
        {/* Date sequence information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <HiInformationCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t("dates.sequenceInfo.title")}
              </h4>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ol className="list-decimal list-inside space-y-1">
                  <li>{t("dates.sequenceInfo.steps.abstractSubmission")}</li>
                  <li>{t("dates.sequenceInfo.steps.abstractReview")}</li>
                  <li>{t("dates.sequenceInfo.steps.fullPaperSubmission")}</li>
                  <li>{t("dates.sequenceInfo.steps.submissionVerdict")}</li>
                  <li>{t("dates.sequenceInfo.steps.fullPaperDeadline")}</li>
                  <li>{t("dates.sequenceInfo.steps.eventStart")}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Start Date */}
        <div>
          <Label htmlFor="event_date">
            {t("dates.fields.eventStartDate.label")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="event_date"
            type="datetime-local"
            {...register("event_date")}
            color={errors.event_date ? "failure" : "gray"}
          />
          {errors.event_date && (
            <p className="text-red-500 text-xs mt-1">{String(errors.event_date.message)}</p>
          )}
        </div>

        {/* Event End Date */}
        <div>
          <Label htmlFor="event_end_date">
            {t("dates.fields.eventEndDate.label")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="event_end_date"
            type="datetime-local"
            {...register("event_end_date")}
            color={errors.event_end_date ? "failure" : "gray"}
          />
          {errors.event_end_date && (
            <p className="text-red-500 text-xs mt-1">{String(errors.event_end_date.message)}</p>
          )}
        </div>

        {/* Abstract Submission Deadline */}
        <div>
          <Label htmlFor="abstract_submission_deadline">
            {t("dates.fields.abstractSubmissionDeadline.label")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="abstract_submission_deadline"
            type="datetime-local"
            {...register("abstract_submission_deadline")}
            color={errors.abstract_submission_deadline ? "failure" : "gray"}
          />
          {errors.abstract_submission_deadline && (
            <p className="text-red-500 text-xs mt-1">{String(errors.abstract_submission_deadline.message)}</p>
          )}
        </div>

        {/* Abstract Review Result Date */}
        <div>
          <Label htmlFor="abstract_review_result_date">
            {t("dates.fields.abstractReviewResultDate.label")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="abstract_review_result_date"
            type="datetime-local"
            {...register("abstract_review_result_date")}
            color={errors.abstract_review_result_date ? "failure" : "gray"}
          />
          {errors.abstract_review_result_date && (
            <p className="text-red-500 text-xs mt-1">{String(errors.abstract_review_result_date.message)}</p>
          )}
        </div>        {/* Full Paper Submission Deadline */}
        <div>
          <Label htmlFor="full_paper_submission_deadline">
            {t("dates.fields.fullPaperSubmissionDeadline.label")}
          </Label>
          <TextInput
            id="full_paper_submission_deadline"
            type="datetime-local"
            {...register("full_paper_submission_deadline")}
            color={errors.full_paper_submission_deadline ? "failure" : "gray"}
          />
          {errors.full_paper_submission_deadline && (
            <p className="text-red-500 text-xs mt-1">{String(errors.full_paper_submission_deadline.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{t("common.optional")}</p>
        </div>

        {/* Submission Verdict Deadline (Full Paper Verdict) */}
        <div>
          <Label htmlFor="submission_verdict_deadline">
            {t("dates.fields.submissionVerdictDeadline.label")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="submission_verdict_deadline"
            type="datetime-local"
            {...register("submission_verdict_deadline")}
            color={errors.submission_verdict_deadline ? "failure" : "gray"}
          />
          {errors.submission_verdict_deadline && (
            <p className="text-red-500 text-xs mt-1">{String(errors.submission_verdict_deadline.message)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
