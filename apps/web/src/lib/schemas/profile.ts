import type { UserType } from "./auth";
import { z } from "zod";
import type { useTranslations } from "next-intl";

export interface UserProfile {
  id: string;
  user_type: UserType;
  is_extended_profile_complete: boolean;
}

type TFunction = ReturnType<typeof useTranslations<string>>;

const getBaseResearcherProfileSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, { message: t("required") }),
    institution: z.string().min(1, { message: t("required") }),
    academic_position: z.string().optional().or(z.literal("")),
    bio_ar: z.string().optional().or(z.literal("")),
    profile_picture_url: z
      .string()
      .url({ message: t("invalidUrl") })
      .optional()
      .or(z.literal("")),
    wilaya_id: z.string().nonempty({ message: t("required") }),
    daira_id: z.string().nonempty({ message: t("required") }),
  });

export const institutionTypeEnumValues = [
  "university",
  "university_center",
  "national_school",
  "research_center",
  "research_laboratory",
  "activities_service",
  "research_team",
] as const;

export const InstitutionTypeEnum = z.enum(institutionTypeEnumValues);
export type InstitutionType = z.infer<typeof InstitutionTypeEnum>;

const getBaseOrganizerProfileSchema = (t: TFunction) =>
  z.object({
    organization_name_ar: z.string().min(1, { message: t("required") }),
    institution_type: InstitutionTypeEnum,
    bio_ar: z.string().optional().or(z.literal("")),
    profile_picture_url: z
      .string()
      .url({ message: t("invalidUrl") })
      .optional()
      .or(z.literal("")),
    wilaya_id: z.string().nonempty({ message: t("required") }),
    daira_id: z.string().nonempty({ message: t("required") }),
  });

const getDiscriminatedUnionSchema = (t: TFunction, userType?: UserType) => {
  if (userType === "researcher") {
    return z.discriminatedUnion("user_type", [
      getBaseResearcherProfileSchema(t).extend({
        user_type: z.literal("researcher"),
      }),
    ]);
  } else if (userType === "organizer") {
    return z.discriminatedUnion("user_type", [
      getBaseOrganizerProfileSchema(t).extend({
        user_type: z.literal("organizer"),
      }),
    ]);
  }

  return z.discriminatedUnion("user_type", [
    getBaseResearcherProfileSchema(t).extend({
      user_type: z.literal("researcher"),
    }),
    getBaseOrganizerProfileSchema(t).extend({
      user_type: z.literal("organizer"),
    }),
  ]);
};

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
  | (BaseResearcherProfileShape & { user_type: "researcher" })
  | (BaseOrganizerProfileShape & { user_type: "organizer" });

export const getCompleteProfileFormSchema = (
  t: TFunction,
  userType?: UserType
) => {
  const schemaWithTranslations = getDiscriminatedUnionSchema(t, userType);

  return schemaWithTranslations.superRefine(() => {});
};
