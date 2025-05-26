"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label, TextInput, Textarea } from "flowbite-react";

import { CreateEventFormDataStatic as CreateEventFormData } from "@/lib/schemas/event";

interface ContentDetailsStepProps {
  form: UseFormReturn<CreateEventFormData>;
}

export default function ContentDetailsStep({ form }: ContentDetailsStepProps) {
  const t = useTranslations("Events.Creation");
  
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("contentDetails.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("contentDetails.description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Problem Statement */}
        <div>
          <Label htmlFor="problem_statement_ar">
            {t("contentDetails.fields.problemStatement.label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="problem_statement_ar"
            {...register("problem_statement_ar")}
            placeholder={t("contentDetails.fields.problemStatement.placeholder")}
            rows={4}
            color={errors.problem_statement_ar ? "failure" : "gray"}
            dir="rtl"
          />
          {errors.problem_statement_ar && (
            <p className="text-red-500 text-xs mt-1">{String(errors.problem_statement_ar.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.problemStatement.description")}
          </p>
        </div>        {/* Event Objectives */}
        <div>
          <Label htmlFor="event_objectives_ar">
            {t("contentDetails.fields.objectives.label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="event_objectives_ar"
            {...register("event_objectives_ar")}
            placeholder={t("contentDetails.fields.objectives.placeholder")}
            rows={4}
            color={errors.event_objectives_ar ? "failure" : "gray"}
            dir="rtl"
          />
          {errors.event_objectives_ar && (
            <p className="text-red-500 text-xs mt-1">{String(errors.event_objectives_ar.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.objectives.description")}
          </p>
        </div>{/* Event Axes */}
        <div>
          <Label htmlFor="event_axes_ar">
            {t("contentDetails.fields.eventAxes.label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="event_axes_ar"
            {...register("event_axes_ar")}
            placeholder={t("contentDetails.fields.eventAxes.placeholder")}
            rows={4}
            color={errors.event_axes_ar ? "failure" : "gray"}
            dir="rtl"
          />
          {errors.event_axes_ar && (
            <p className="text-red-500 text-xs mt-1">{String(errors.event_axes_ar.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.eventAxes.description")}
          </p>
        </div>

        {/* Submission Guidelines */}
        <div>
          <Label htmlFor="submission_guidelines_ar">
            {t("contentDetails.fields.submissionGuidelines.label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="submission_guidelines_ar"
            {...register("submission_guidelines_ar")}
            placeholder={t("contentDetails.fields.submissionGuidelines.placeholder")}
            rows={4}
            color={errors.submission_guidelines_ar ? "failure" : "gray"}
            dir="rtl"
          />
          {errors.submission_guidelines_ar && (
            <p className="text-red-500 text-xs mt-1">{String(errors.submission_guidelines_ar.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.submissionGuidelines.description")}
          </p>
        </div>

        {/* Who Organizes */}
        <div>
          <Label htmlFor="who_organizes_ar">
            {t("contentDetails.fields.whoOrganizes.label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="who_organizes_ar"
            {...register("who_organizes_ar")}
            placeholder={t("contentDetails.fields.whoOrganizes.placeholder")}
            rows={3}
            color={errors.who_organizes_ar ? "failure" : "gray"}
            dir="rtl"
          />
          {errors.who_organizes_ar && (
            <p className="text-red-500 text-xs mt-1">{String(errors.who_organizes_ar.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.whoOrganizes.description")}
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <Label htmlFor="target_audience_ar">
            {t("contentDetails.fields.targetAudience.label")}
          </Label>
          <Textarea
            id="target_audience_ar"
            {...register("target_audience_ar")}
            placeholder={t("contentDetails.fields.targetAudience.placeholder")}
            rows={3}
            dir="rtl"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t("common.optional")}
          </p>
        </div>

        {/* Scientific Committees */}
        <div>
          <Label htmlFor="scientific_committees_ar">
            {t("contentDetails.fields.scientificCommittees.label")}
          </Label>
          <Textarea
            id="scientific_committees_ar"
            {...register("scientific_committees_ar")}
            placeholder={t("contentDetails.fields.scientificCommittees.placeholder")}
            rows={4}
            dir="rtl"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t("common.optional")}
          </p>
        </div>

        {/* Speakers and Keynotes */}
        <div>
          <Label htmlFor="speakers_keynotes_ar">
            {t("contentDetails.fields.speakersKeynotes.label")}
          </Label>
          <Textarea
            id="speakers_keynotes_ar"
            {...register("speakers_keynotes_ar")}
            placeholder={t("contentDetails.fields.speakersKeynotes.placeholder")}
            rows={4}
            dir="rtl"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t("common.optional")}
          </p>
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">
            {t("contentDetails.fields.price.label")}
          </Label>
          <TextInput
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register("price", { 
              setValueAs: (value) => value === "" ? undefined : parseFloat(value) 
            })}
            placeholder={t("contentDetails.fields.price.placeholder")}
            color={errors.price ? "failure" : "gray"}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{String(errors.price.message)}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {t("contentDetails.fields.price.description")} • {t("common.optional")}
          </p>
        </div>
      </div>
    </div>
  );
}
