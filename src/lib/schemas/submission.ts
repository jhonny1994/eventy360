import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations<string>>;

// Maximum file size: 5MB (matching the storage bucket setting)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types for submissions
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Base schema for common abstract submission fields
export const getAbstractSubmissionSchema = (t: TFunction) => 
  z.object({
    event_id: z.string().uuid({ message: t("invalidEventId") }),
    title_ar: z.string().min(1, { message: t("required") }),
    title_en: z.string().optional(),
    title_fr: z.string().optional(),
    abstract_ar: z.string().min(50, { message: t("abstractTooShort") }),
    abstract_en: z.string().optional(),
    abstract_fr: z.string().optional(),
    abstract_file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: t("fileTooLarge", { maxSize: "5MB" })
      })
      .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), {
        message: t("invalidFileType", { types: "PDF, DOC, DOCX" })
      })
  });

// Schema for full paper submission
export const getFullPaperSubmissionSchema = (t: TFunction) => 
  z.object({
    submission_id: z.string().uuid({ message: t("invalidSubmissionId") }),
    full_paper_file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: t("fileTooLarge", { maxSize: "5MB" })
      })
      .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), {
        message: t("invalidFileType", { types: "PDF, DOC, DOCX" })
      })
  });

// Schema for revision submission (similar to full paper but with different context)
export const getRevisionSubmissionSchema = (t: TFunction) => 
  z.object({
    submission_id: z.string().uuid({ message: t("invalidSubmissionId") }),
    full_paper_file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: t("fileTooLarge", { maxSize: "5MB" })
      })
      .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), {
        message: t("invalidFileType", { types: "PDF, DOC, DOCX" })
      })
  });

// Type exports
export type AbstractSubmissionFormData = z.infer<ReturnType<typeof getAbstractSubmissionSchema>>;
export type FullPaperSubmissionFormData = z.infer<ReturnType<typeof getFullPaperSubmissionSchema>>;
export type RevisionSubmissionFormData = z.infer<ReturnType<typeof getRevisionSubmissionSchema>>;

// Create static versions of the types for better TypeScript inference
export interface AbstractSubmissionFormDataStatic {
  event_id: string;
  title_ar: string;
  title_en?: string;
  title_fr?: string;
  abstract_ar: string;
  abstract_en?: string;
  abstract_fr?: string;
  abstract_file: File;
}

export interface FullPaperSubmissionFormDataStatic {
  submission_id: string;
  full_paper_file: File;
}

export interface RevisionSubmissionFormDataStatic {
  submission_id: string;
  full_paper_file: File;
} 