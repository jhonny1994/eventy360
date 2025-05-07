import type { UserType } from './auth'; // Assuming user_type enum/type is defined here or directly from db types
import { z } from 'zod';
import type { useTranslations } from 'next-intl';

export interface UserProfile {
  id: string;
  user_type: UserType; // 'researcher' | 'organizer' | 'admin' - ensure this matches your actual type
  is_extended_profile_complete: boolean;
  // Add other fields from the 'profiles' table that might be useful globally
  // email?: string; // Usually available from auth.user() directly
  // created_at?: string;
  // updated_at?: string;
  // is_verified?: boolean;
}

// More detailed profile types can be defined here later, e.g., for researcher_profiles, organizer_profiles

// Example: If your UserType is an enum from Supabase generated types, you might import it directly
// import { definitions } from '@/types/supabase'; // Adjust path if you have generated types
// export type UserType = definitions['profiles']['user_type']; 

// Type for the translation function `t` (can be shared with auth.ts or defined here)
type TFunction = ReturnType<typeof useTranslations<string>>;

// --- Researcher Profile Schema ---
const getBaseResearcherProfileSchema = (t: TFunction) => z.object({
  name: z.string().min(1, { message: t('required') }), 
  institution: z.string().min(1, { message: t('required') }),
  academic_position: z.string().optional().or(z.literal('')),
  bio_ar: z.string().optional().or(z.literal('')),
  profile_picture_url: z.string().url({ message: t('invalidUrl') }).optional().or(z.literal('')),
  wilaya_id: z.string().nonempty({ message: t('required') }), 
  daira_id: z.string().nonempty({ message: t('required') }),
});

// --- Organizer Profile Schema ---
export const institutionTypeEnumValues = [
  'university', 'university_center', 'national_school', 'research_center',
  'research_laboratory', 'activities_service', 'research_team'
] as const;
const institutionTypeEnum = z.enum(institutionTypeEnumValues);

const getBaseOrganizerProfileSchema = (t: TFunction) => z.object({
  organization_name_ar: z.string().min(1, { message: t('required') }),
  institution_type: z.enum(institutionTypeEnumValues, { required_error: t('required'), invalid_type_error: t('required') }), 
  bio_ar: z.string().optional().or(z.literal('')),
  profile_picture_url: z.string().url({ message: t('invalidUrl') }).optional().or(z.literal('')),
  wilaya_id: z.string().nonempty({ message: t('required') }),
  daira_id: z.string().nonempty({ message: t('required') }),
});

// --- Discriminated Union Zod Schema for the Form ---
// We need to pass `t` to the base schema generators
const getDiscriminatedUnionSchema = (t: TFunction) => z.discriminatedUnion('user_type', [
  getBaseResearcherProfileSchema(t).extend({ user_type: z.literal('researcher') }),
  getBaseOrganizerProfileSchema(t).extend({ user_type: z.literal('organizer') }),
]);

// --- Exported Form Data Type from the Discriminated Union Schema ---
// This type will depend on `t`, which is not ideal for a static type export.
// Let's define the shape without `t` first for the type, then use `t` in the schema function.

// Define shapes without messages for static type export
const BaseResearcherProfileShapeSchema = z.object({
  name: z.string(), 
  institution: z.string(),
  academic_position: z.string().optional(),
  bio_ar: z.string().optional(),
  profile_picture_url: z.string().url().optional(),
  wilaya_id: z.string(), 
  daira_id: z.string(),
});
const BaseOrganizerProfileShapeSchema = z.object({
  organization_name_ar: z.string(),
  institution_type: institutionTypeEnum, 
  bio_ar: z.string().optional(),
  profile_picture_url: z.string().url().optional(),
  wilaya_id: z.string(),
  daira_id: z.string(),
});

export type ProfileCompletionFormShape = 
  | (z.infer<typeof BaseResearcherProfileShapeSchema> & { user_type: 'researcher' })
  | (z.infer<typeof BaseOrganizerProfileShapeSchema> & { user_type: 'organizer' });


// --- Schema Generator Function for the Complete Form ---
export const getCompleteProfileFormSchema = (t: TFunction, userType: UserType) => {
  // Get the appropriate discriminated union schema with translations
  const schemaWithTranslations = getDiscriminatedUnionSchema(t);

  return schemaWithTranslations.superRefine((data, ctx) => {
    // URL checks moved to base schemas with .url().optional().or(z.literal(''))
    // Required checks are now part of base schemas with messages.
    // SuperRefine can be used for more complex cross-field validations if needed in the future.

    // Example: If profile_picture_url is provided, ensure it's a valid URL (already handled by .url())
    // This explicit check here is redundant if base schema has .url() and it's optional.
    // if (data.profile_picture_url && data.profile_picture_url.length > 0) {
    //   const urlCheck = z.string().url({ message: t('invalidUrl') }).safeParse(data.profile_picture_url);
    //   if (!urlCheck.success) {
    //       ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('invalidUrl'), path: ['profile_picture_url'] });
    //   }
    // }

    // The previous explicit required checks like `!data.name` or `!data.institution_type` 
    // are now handled by the min(1, {message: t(...)}) or by making enum non-optional in base schemas.
  });
};

// Remove old getResearcherProfileSchema and getOrganizerProfileSchema functions
// They are replaced by getCompleteProfileFormSchema with superRefine
// export const getResearcherProfileSchema = ... (old)
// export const getOrganizerProfileSchema = ... (old) 