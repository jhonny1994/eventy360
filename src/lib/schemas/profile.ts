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

// Create a Zod schema for the institution type enum
export const InstitutionTypeEnum = z.enum(institutionTypeEnumValues);
export type InstitutionType = z.infer<typeof InstitutionTypeEnum>;

const getBaseOrganizerProfileSchema = (t: TFunction) => z.object({
  organization_name_ar: z.string().min(1, { message: t('required') }),
  institution_type: InstitutionTypeEnum, 
  bio_ar: z.string().optional().or(z.literal('')),
  profile_picture_url: z.string().url({ message: t('invalidUrl') }).optional().or(z.literal('')),
  wilaya_id: z.string().nonempty({ message: t('required') }),
  daira_id: z.string().nonempty({ message: t('required') }),
});

// --- Discriminated Union Zod Schema for the Form ---
const getDiscriminatedUnionSchema = (t: TFunction, userType?: UserType) => {
  // If userType is specified, return only that schema
  if (userType === 'researcher') {
    return z.discriminatedUnion('user_type', [
      getBaseResearcherProfileSchema(t).extend({ user_type: z.literal('researcher') })
    ]);
  } else if (userType === 'organizer') {
    return z.discriminatedUnion('user_type', [
      getBaseOrganizerProfileSchema(t).extend({ user_type: z.literal('organizer') })
    ]);
  }
  
  // Otherwise return the full discriminated union
  return z.discriminatedUnion('user_type', [
    getBaseResearcherProfileSchema(t).extend({ user_type: z.literal('researcher') }),
    getBaseOrganizerProfileSchema(t).extend({ user_type: z.literal('organizer') }),
  ]);
};

// --- Exported Form Data Type from the Discriminated Union Schema ---
type BaseResearcherProfileShape = {
  name: string;
  institution: string;
  academic_position?: string;
  bio_ar?: string;
  profile_picture_url?: string;
  wilaya_id: string;
  daira_id: string;
};

type BaseOrganizerProfileShape = {
  organization_name_ar: string;
  institution_type: InstitutionType;
  bio_ar?: string;
  profile_picture_url?: string;
  wilaya_id: string;
  daira_id: string;
};

export type ProfileCompletionFormShape = 
  | (BaseResearcherProfileShape & { user_type: 'researcher' })
  | (BaseOrganizerProfileShape & { user_type: 'organizer' });


// --- Schema Generator Function for the Complete Form ---
export const getCompleteProfileFormSchema = (t: TFunction, userType?: UserType) => {
  // Get the appropriate discriminated union schema with translations
  const schemaWithTranslations = getDiscriminatedUnionSchema(t, userType);

  return schemaWithTranslations.superRefine(() => {
    // SuperRefine can be used for more complex cross-field validations if needed in the future.
  });
};

// Remove old getResearcherProfileSchema and getOrganizerProfileSchema functions
// They are replaced by getCompleteProfileFormSchema with superRefine
// export const getResearcherProfileSchema = ... (old)
// export const getOrganizerProfileSchema = ... (old) 