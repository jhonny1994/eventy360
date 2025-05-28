import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations<string>>;

// Event type and format enums from database
export const eventTypeValues = [
  "scientific_event",
  "cultural_event", 
  "sports_event",
  "competition"
] as const;

export const eventFormatValues = [
  "physical",
  "virtual", 
  "hybrid"
] as const;

export const EventTypeEnum = z.enum(eventTypeValues);
export const EventFormatEnum = z.enum(eventFormatValues);

export type EventType = z.infer<typeof EventTypeEnum>;
export type EventFormat = z.infer<typeof EventFormatEnum>;

// Step 1: Basic Information
export const getBasicInfoSchema = (t: TFunction) =>  z.object({
    event_name_ar: z.string().min(1, { message: t("required") }),
    event_subtitle_ar: z.string().optional(),
    event_type: z.union([EventTypeEnum, z.literal("")]).refine((val) => val !== "", { message: t("required") }),
    format: z.union([EventFormatEnum, z.literal("")]).refine((val) => val !== "", { message: t("required") }),
    wilaya_id: z.string().nonempty({ message: t("required") }),
    daira_id: z.string().nonempty({ message: t("required") }),
    email: z.string().email({ message: t("invalidEmail") }),
    phone: z.string().min(1, { message: t("required") }),
    website: z.string().url({ message: t("invalidUrl") }).optional().or(z.literal("")),
  });

// Step 2: Content Details
export const getContentDetailsSchema = (t: TFunction) =>
  z.object({
    problem_statement_ar: z.string().min(1, { message: t("required") }),
    event_objectives_ar: z.string().min(1, { message: t("required") }),
    event_axes_ar: z.string().min(1, { message: t("required") }),
    submission_guidelines_ar: z.string().min(1, { message: t("required") }),
    who_organizes_ar: z.string().min(1, { message: t("required") }),
    target_audience_ar: z.string().optional(),
    scientific_committees_ar: z.string().optional(),
    speakers_keynotes_ar: z.string().optional(),
    price: z.number().min(0, { message: t("invalidPrice") }).optional(),
  });

// Step 3: Dates and Deadlines
export const getBaseDatesSchema = (t: TFunction) =>
  z.object({
    event_date: z.string().min(1, { message: t("required") }),
    event_end_date: z.string().min(1, { message: t("required") }),
    abstract_submission_deadline: z.string().min(1, { message: t("required") }),
    abstract_review_result_date: z.string().min(1, { message: t("required") }),
    full_paper_submission_deadline: z.string().optional(),
    submission_verdict_deadline: z.string().min(1, { message: t("required") }),
  });

export const getDatesSchema = (t: TFunction) =>
  getBaseDatesSchema(t)
  .superRefine((data, ctx) => {
    const {
      event_date,
      event_end_date,
      abstract_submission_deadline,
      abstract_review_result_date,
      full_paper_submission_deadline,
      submission_verdict_deadline,
    } = data;

    // Convert dates to Date objects for comparison
    const eventStart = new Date(event_date);
    const eventEnd = new Date(event_end_date);
    const abstractDeadline = new Date(abstract_submission_deadline);
    const abstractResult = new Date(abstract_review_result_date);
    const verdictDeadline = new Date(submission_verdict_deadline);
    const fullPaperSubmission = full_paper_submission_deadline 
      ? new Date(full_paper_submission_deadline) 
      : null;

    // Event end date must be after start date
    if (eventEnd <= eventStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("eventEndDateMustBeAfterStart"),
        path: ["event_end_date"],
      });
    }

    // Abstract submission deadline must be before event start
    if (abstractDeadline >= eventStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("abstractDeadlineMustBeBeforeEvent"),
        path: ["abstract_submission_deadline"],
      });
    }

    // Abstract review result must be after abstract submission deadline
    if (abstractResult <= abstractDeadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("abstractResultMustBeAfterDeadline"),
        path: ["abstract_review_result_date"],
      });
    }

    // Submission verdict deadline must be after abstract review result and before event start
    if (verdictDeadline <= abstractResult) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("verdictMustBeAfterAbstractResult"),
        path: ["submission_verdict_deadline"],
      });
    }

    if (verdictDeadline >= eventStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("verdictMustBeBeforeEvent"),
        path: ["submission_verdict_deadline"],
      });
    }

    // Full paper submission deadline validations (if provided)
    if (fullPaperSubmission) {
      if (fullPaperSubmission <= abstractResult) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("fullPaperSubmissionMustBeAfterAbstractResult"),
          path: ["full_paper_submission_deadline"],
        });
      }
      
      if (fullPaperSubmission >= verdictDeadline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("fullPaperSubmissionMustBeBeforeVerdict"),
          path: ["full_paper_submission_deadline"],
        });
      }
    }
  });

// Step 4: Topic Selection
export const getTopicSelectionSchema = (t: TFunction) =>
  z.object({
    topic_ids: z.array(z.string()).min(1, { message: t("selectAtLeastOneTopic") }),
  });

// Combined schema for the entire form
export const getCreateEventSchema = (t: TFunction) =>
  getBasicInfoSchema(t)
    .merge(getContentDetailsSchema(t))
    .merge(getBaseDatesSchema(t)) // Merge the base dates schema first
    .merge(getTopicSelectionSchema(t))
    .superRefine((data, ctx) => {
      // Apply the same validation logic from getDatesSchema
      const {
        event_date,
        event_end_date,
        abstract_submission_deadline,
        abstract_review_result_date,
        full_paper_submission_deadline,
        submission_verdict_deadline,
      } = data;

      // Convert dates to Date objects for comparison
      const eventStart = new Date(event_date);
      const eventEnd = new Date(event_end_date);
      const abstractDeadline = new Date(abstract_submission_deadline);
      const abstractResult = new Date(abstract_review_result_date);
      const verdictDeadline = new Date(submission_verdict_deadline);
      const fullPaperSubmission = full_paper_submission_deadline 
        ? new Date(full_paper_submission_deadline) 
        : null;

      // Event end date must be after start date
      if (eventEnd <= eventStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("eventEndDateMustBeAfterStart"),
          path: ["event_end_date"],
        });
      }

      // Abstract submission deadline must be before event start
      if (abstractDeadline >= eventStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("abstractDeadlineMustBeBeforeEvent"),
          path: ["abstract_submission_deadline"],
        });
      }

      // Abstract review result must be after abstract submission deadline
      if (abstractResult <= abstractDeadline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("abstractResultMustBeAfterDeadline"),
          path: ["abstract_review_result_date"],
        });
      }

      // Submission verdict deadline must be after abstract review result and before event start
      if (verdictDeadline <= abstractResult) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("verdictMustBeAfterAbstractResult"),
          path: ["submission_verdict_deadline"],
        });
      }

      if (verdictDeadline >= eventStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("verdictMustBeBeforeEvent"),
          path: ["submission_verdict_deadline"],
        });
      }

      // Full paper submission deadline validations (if provided)
      if (fullPaperSubmission) {
        if (fullPaperSubmission <= abstractResult) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("fullPaperSubmissionMustBeAfterAbstractResult"),
            path: ["full_paper_submission_deadline"],
          });
        }
        
        if (fullPaperSubmission >= verdictDeadline) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("fullPaperSubmissionMustBeBeforeVerdict"),
            path: ["full_paper_submission_deadline"],
          });
        }
      }
    });

export type CreateEventFormData = z.infer<ReturnType<typeof getCreateEventSchema>>;

// Create a static version of the type for better TypeScript inference
export interface CreateEventFormDataStatic {
  event_name_ar: string;
  event_subtitle_ar?: string;
  event_type: EventType | "";
  format: EventFormat | "";
  wilaya_id: string;
  daira_id: string;
  email: string;
  phone: string;
  website?: string;
  problem_statement_ar: string;
  event_objectives_ar: string;
  event_axes_ar: string;
  submission_guidelines_ar: string;
  who_organizes_ar: string;
  target_audience_ar?: string;
  scientific_committees_ar?: string;
  speakers_keynotes_ar?: string;
  price?: number;
  event_date: string;
  event_end_date: string;
  abstract_submission_deadline: string;
  abstract_review_result_date: string;
  full_paper_submission_deadline?: string;
  submission_verdict_deadline: string;
  topic_ids: string[];
}

// Individual step types
export type BasicInfoFormData = z.infer<ReturnType<typeof getBasicInfoSchema>>;
export type ContentDetailsFormData = z.infer<ReturnType<typeof getContentDetailsSchema>>;
export type DatesFormData = z.infer<ReturnType<typeof getDatesSchema>>;
export type TopicSelectionFormData = z.infer<ReturnType<typeof getTopicSelectionSchema>>;
