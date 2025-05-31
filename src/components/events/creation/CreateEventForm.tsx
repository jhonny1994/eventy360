"use client";

import { useState, useCallback } from "react";
// import { useRouter } from "next/navigation"; // Removed unused import
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Alert, Button, Progress } from "flowbite-react";
import { HiExclamationTriangle, HiCheckCircle } from "react-icons/hi2";

import { 
  getCreateEventSchema, 
  type CreateEventFormDataStatic as CreateEventFormData,
  type EventType,
  type EventFormat
} from "@/lib/schemas/event";
import { useSubscription } from "@/hooks/useSubscription";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { withSubscriptionGuard } from "@/components/hoc/withSubscriptionGuard";

import BasicInfoStep from "./steps/BasicInfoStep";
import ContentDetailsStep from "./steps/ContentDetailsStep";
import DatesStep from "./steps/DatesStep";
import TopicSelectionStep from "./steps/TopicSelectionStep";

const STEPS = [
  "basicInfo",
  "contentDetails", 
  "dates",
  "topics"
] as const;

type Step = typeof STEPS[number];

interface CreateEventFormProps {
  className?: string;
}

function CreateEventForm({ className }: CreateEventFormProps) {
  const { user } = useAuth();
  const t = useTranslations("Events.Creation");
  const tValidation = useTranslations("Events.Creation.validation");
  
  const [currentStep, setCurrentStep] = useState<Step>("basicInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { subscriptionData, loading: subscriptionLoading } = useSubscription();  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(getCreateEventSchema(tValidation)),
    mode: "onChange",    defaultValues: {
      event_name_ar: "",
      event_subtitle_ar: "",
      event_type: "",
      format: "",
      wilaya_id: "",
      daira_id: "",
      email: "",
      phone: "",
      website: "",
      problem_statement_ar: "",
      event_objectives_ar: "",
      event_axes_ar: "",
      submission_guidelines_ar: "",
      who_organizes_ar: "",
      target_audience_ar: "",
      scientific_committees_ar: "",
      speakers_keynotes_ar: "",
      price: undefined,
      event_date: "",
      event_end_date: "",
      abstract_submission_deadline: "",
      abstract_review_result_date: "",
      full_paper_submission_deadline: "",
      submission_verdict_deadline: "",
      topic_ids: [],
    },
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;  // Check subscription limits before allowing event creation
  const canCreateEvent = useCallback(() => {
    if (subscriptionLoading || !subscriptionData) return false;
    
    // Check if user has an active subscription or is in trial period
    // Free users cannot create events
    if (!subscriptionData.subscription || 
        subscriptionData.subscription.tier === 'free' ||
        (subscriptionData.subscription.status !== "active" && 
         subscriptionData.subscription.status !== "trial")) {
      return false;
    }
    
    // If user has a valid subscription (paid or trial), they can create events
    return true;
  }, [subscriptionData, subscriptionLoading]);const getStepComponent = () => {
    switch (currentStep) {
      case "basicInfo":
        return <BasicInfoStep form={form} />;
      case "contentDetails":
        return <ContentDetailsStep form={form} />;
      case "dates":
        return <DatesStep form={form} />;
      case "topics":
        return <TopicSelectionStep form={form} />;
      default:
        return null;
    }
  };const validateCurrentStep = async () => {
  const stepFields = getStepFields(currentStep);
  // TypeScript will now correctly understand that stepFields contains valid keys of CreateEventFormData
  const isValid = await form.trigger(stepFields);
  return isValid;
};
  const getStepFields = (step: Step): (keyof CreateEventFormData)[] => {
    switch (step) {
      case "basicInfo":
        return [
          "event_name_ar",
          "event_type", 
          "format",
          "wilaya_id",
          "daira_id",
          "email",
          "phone",
          "website"
        ];
      case "contentDetails":
        return [
          "problem_statement_ar",
          "event_objectives_ar",
          "event_axes_ar",
          "submission_guidelines_ar",
          "who_organizes_ar",
          "target_audience_ar",
          "scientific_committees_ar",
          "speakers_keynotes_ar",
          "price"
        ];      case "dates":
        return [
          "event_date",
          "event_end_date",
          "abstract_submission_deadline",
          "abstract_review_result_date",
          "full_paper_submission_deadline",
          "submission_verdict_deadline"
        ];
      case "topics":
        return ["topic_ids"];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };
  const handleSubmit = async (data: CreateEventFormData) => {
    if (!user) {
      setSubmitError(t("mustBeLoggedIn"));
      return;
    }

    // Check if user has reached their event limit
    if (!canCreateEvent()) { 
      setSubmitError(t("subscriptionLimitReached"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const supabase = createClient();      const { data: eventData, error: insertEventError } = await supabase
        .from("events")
        .insert({
          created_by: user.id,
          event_name_translations: { ar: data.event_name_ar },
          event_subtitle_translations: { ar: data.event_subtitle_ar },
          event_type: data.event_type as EventType,          format: data.format as EventFormat,
          wilaya_id: parseInt(data.wilaya_id),
          daira_id: parseInt(data.daira_id),
          email: data.email,
          phone: data.phone,
          website: data.website || null,
          problem_statement_translations: { ar: data.problem_statement_ar },
          event_objectives_translations: { ar: data.event_objectives_ar },
          event_axes_translations: { ar: data.event_axes_ar },
          submission_guidelines_translations: { ar: data.submission_guidelines_ar },
          who_organizes_translations: { ar: data.who_organizes_ar },
          target_audience_translations: { ar: data.target_audience_ar },
          scientific_committees_translations: { ar: data.scientific_committees_ar },
          speakers_keynotes_translations: { ar: data.speakers_keynotes_ar },
          price: data.price,event_date: data.event_date,          event_end_date: data.event_end_date,
          abstract_submission_deadline: data.abstract_submission_deadline,
          abstract_review_result_date: data.abstract_review_result_date,
          full_paper_submission_deadline: data.full_paper_submission_deadline || null,
          submission_verdict_deadline: data.submission_verdict_deadline,
        })
        .select("id")
        .single();

      if (insertEventError) throw insertEventError;
      const event = eventData;

      if (event && data.topic_ids && data.topic_ids.length > 0) {
        const topicAssociations = data.topic_ids.map((topicId: string) => ({
          event_id: event.id,
          topic_id: topicId, 
        }));

        const { error: topicInsertError } = await supabase
          .from("event_topics")
          .insert(topicAssociations);

        if (topicInsertError) throw topicInsertError;
      }

      setSubmitSuccess(true);
      // Optionally redirect or show a success message
      // router.push(`/events/${event.id}`); 
    } catch (error: unknown) { // Changed error type from any to unknown
      if (error instanceof Error) {
        setSubmitError(error.message || t("submissionError"));
      } else {
        setSubmitError(t("submissionError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };  // Show subscription limit error if user cannot create events
  if (!subscriptionLoading && !canCreateEvent() && subscriptionData?.subscription) {
    const maxEvents = subscriptionData.subscription.tier === "free" ? 1 : 5;
    
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert color="warning" icon={HiExclamationTriangle}>
          <span className="font-medium">{t("subscription.limitReached.title")}</span>
          <div className="mt-2">
            {subscriptionData.subscription.status === "expired" ? (
              <p>{t("subscription.limitReached.freeDescription")}</p>
            ) : (
              <p>
                {subscriptionData.subscription.tier === "free" 
                  ? t("subscription.limitReached.freeDescription")
                  : t("subscription.limitReached.paidDescription", { limit: maxEvents })
                }
              </p>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  if (submitSuccess) {
    return (      <div className={`space-y-6 ${className}`}>
        <Alert color="success" icon={HiCheckCircle}>
          <span className="font-medium">{t("success.title")}</span>
          <div className="mt-2">
            <p>{t("success.description")}</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
          <span>{t("progress.step", { current: currentStepIndex + 1, total: STEPS.length })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress progress={progress} size="lg" color="blue" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${
              index <= currentStepIndex
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-600"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStepIndex
                  ? "bg-blue-600 text-white"
                  : index === currentStepIndex
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span className="hidden sm:block ml-2 text-sm font-medium">
              {t(`steps.${step}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Error Alert */}      {submitError && (
        <Alert color="failure" icon={HiExclamationTriangle}>
          <span className="font-medium">{t("errors.title")}</span>
          <div className="mt-2">
            <p>{submitError}</p>
          </div>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Current Step Component */}
        <div className="min-h-[400px]">
          {getStepComponent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">          <Button
            type="button"
            color="gray"
            onClick={handlePrevious}
            disabled={isFirstStep || isSubmitting}
          >
            {t("navigation.previous")}
          </Button>
          
          <div className="flex gap-3">
            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {t("navigation.next")}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("loading.creating") : t("navigation.submit")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>  );
}

// Apply subscription guard to ensure only users with appropriate
// subscription can create events
export default withSubscriptionGuard(CreateEventForm);
