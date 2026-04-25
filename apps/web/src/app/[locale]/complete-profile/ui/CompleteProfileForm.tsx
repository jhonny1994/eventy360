"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Select,
  Alert,
  Spinner,
} from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";
import type { UserProfile } from "@/lib/schemas/profile";
import {
  getCompleteProfileFormSchema,
  type ProfileCompletionFormShape,
  institutionTypeEnumValues,
  InstitutionType,
} from "@/lib/schemas/profile";

interface CompleteProfileFormProps {
  userProfile: UserProfile;
}

interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface Daira {
  id: number;
  wilaya_id: number;
  name_ar: string;
  name_other: string;
}

const getInitialValues = (profile: UserProfile): ProfileCompletionFormShape => {
  const commonOptionalValues = {
    bio_ar: "",
    profile_picture_url: "",
  };

  const commonRequiredValues = {
    wilaya_id: "",
    daira_id: "",
  };

  if (profile.user_type === "researcher") {
    return {
      user_type: "researcher" as const,
      name: "",
      institution: "",
      academic_position: "",
      ...commonRequiredValues,
      ...commonOptionalValues,
    };
  } else {
    return {
      user_type: "organizer" as const,
      organization_name_ar: "",
      institution_type: institutionTypeEnumValues[0],
      ...commonRequiredValues,
      ...commonOptionalValues,
    };
  }
};

interface ProfileDataPayload {
  profile_picture_url: string | null;
  wilaya_id: number | null;
  daira_id: number | null;
  name?: string;
  institution?: string;
  academic_position?: string | undefined;
  bio_translations?: { ar: string };
  name_translations?: { ar: string };
  institution_type?: string;
}

const isResearcherError = (
  errors: FieldErrors<ProfileCompletionFormShape>,
  userType: string
): errors is FieldErrors<
  Extract<ProfileCompletionFormShape, { user_type: "researcher" }>
> => {
  return userType === "researcher";
};

const isOrganizerError = (
  errors: FieldErrors<ProfileCompletionFormShape>,
  userType: string
): errors is FieldErrors<
  Extract<ProfileCompletionFormShape, { user_type: "organizer" }>
> => {
  return userType === "organizer";
};

function CompleteProfileFormComponent({
  userProfile,
}: CompleteProfileFormProps) {
  const t = useTranslations("Auth.CompleteProfileForm");
  const tEnums = useTranslations("Enums");
  const tValidation = useTranslations("Validations");
  const router = useRouter();
  const { supabase } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [locationDataLoaded, setLocationDataLoaded] = useState(false);
  const [dairasLoading, setDairasLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const schema = useMemo(
    () => getCompleteProfileFormSchema(tValidation, userProfile.user_type),
    [tValidation, userProfile.user_type]
  );

  const defaultValues = useMemo(
    () => getInitialValues(userProfile),
    [userProfile]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ProfileCompletionFormShape>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!formInitialized) {
      reset(defaultValues);
      setFormInitialized(true);
    }
  }, [formInitialized, reset, defaultValues]);

  useEffect(() => {
    let isMounted = true;

    async function fetchWilayas() {
      if (!locationDataLoaded) {
        try {
          const { data: wilayasData, error: wilayasError } = await supabase
            .from("wilayas")
            .select("id, name_ar, name_other")
            .order("id");

          if (wilayasError) throw wilayasError;

          if (isMounted) {
            setWilayas(wilayasData || []);
            setLocationDataLoaded(true);
          }
        } catch {
          if (isMounted) {
            setFormError(t("locationDataFetchError") || "Failed to load location data");
          }
        }
      }
    }

    fetchWilayas();

    return () => {
      isMounted = false;
    };
  }, [supabase, t, locationDataLoaded]);

  const selectedWilayaId = watch("wilaya_id");

  useEffect(() => {
    let isMounted = true;
    const fetchDairas = async () => {
      if (selectedWilayaId) {
        setDairasLoading(true);
        setDairas([]);
        try {
          const { data, error } = await supabase
            .from('dairas')
            .select('id, wilaya_id, name_ar, name_other')
            .eq('wilaya_id', parseInt(selectedWilayaId, 10));

          if (error) throw error;

          if (isMounted) {
            setDairas(data || []);
          }
        } catch {
          if (isMounted) {
            toast.error(t('dairaDataFetchError') || "Failed to load dairas for the selected wilaya.");
          }
        } finally {
          if (isMounted) {
            setDairasLoading(false);
          }
        }
      } else {
        setDairas([]);
      }
    };

    fetchDairas();

    return () => {
      isMounted = false;
    };
  }, [selectedWilayaId, supabase, t]);

  useEffect(() => {
    if (selectedWilayaId && formInitialized) {
      setValue("daira_id", "");
    }
  }, [selectedWilayaId, setValue, formInitialized]);

  const onSubmit = useCallback(
    async (data: ProfileCompletionFormShape) => {
      setIsLoading(true);
      setFormError(null);
      const toastId = toast.loading(t("loadingButton"));

      let profileDataPayload: ProfileDataPayload = {
        profile_picture_url: data.profile_picture_url || null,
        wilaya_id: data.wilaya_id ? parseInt(data.wilaya_id, 10) : null,
        daira_id: data.daira_id ? parseInt(data.daira_id, 10) : null,
      };

      if (data.user_type === "researcher") {
        profileDataPayload = {
          ...profileDataPayload,
          name: data.name || "",
          institution: data.institution || "",
          academic_position: data.academic_position || "",
          bio_translations: { ar: data.bio_ar || "" },
        };
      } else if (data.user_type === "organizer") {
        profileDataPayload = {
          ...profileDataPayload,
          name_translations: { ar: data.organization_name_ar || "" },
          institution_type: data.institution_type || "",
          bio_translations: { ar: data.bio_ar || "" },
        };
      }

      try {
        const { error: rpcError } = await supabase.rpc("complete_my_profile", {
          profile_data: profileDataPayload,
        });

        if (rpcError) {
          throw rpcError;
        }

        toast.success(t("successToast"), { id: toastId });
        router.push("/redirect");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errorToast");
        setFormError(errorMessage);
        toast.error(errorMessage, { id: toastId });
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router, t]
  );

  const renderResearcherFields = useCallback(() => {
    const researcherErrors = isResearcherError(errors, userProfile.user_type)
      ? errors
      : ({} as FieldErrors<
        Extract<ProfileCompletionFormShape, { user_type: "researcher" }>
      >);

    return (
      <>
        <div>
          <Label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t("researcherNameLabel")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="name"
            {...register("name")}
            disabled={isLoading}
            color={researcherErrors.name ? "failure" : "gray"}
          />
          {researcherErrors.name && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="institution"
            className="mb-1 block text-sm font-medium"
          >
            {t("institutionLabel")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="institution"
            {...register("institution")}
            disabled={isLoading}
            color={researcherErrors.institution ? "failure" : "gray"}
          />
          {researcherErrors.institution && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="academic_position"
            className="mb-1 block text-sm font-medium"
          >
            {t("academicPositionLabel")}
          </Label>
          <TextInput
            id="academic_position"
            {...register("academic_position")}
            disabled={isLoading}
            color={researcherErrors.academic_position ? "failure" : "gray"}
          />
          {researcherErrors.academic_position && (
            <p className="mt-1 text-sm text-red-600">
              {researcherErrors.academic_position.message}
            </p>
          )}
        </div>
      </>
    );
  }, [isLoading, t, tValidation, register, errors, userProfile.user_type]);

  const renderOrganizerFields = useCallback(() => {
    const organizerErrors = isOrganizerError(errors, userProfile.user_type)
      ? errors
      : ({} as FieldErrors<
        Extract<ProfileCompletionFormShape, { user_type: "organizer" }>
      >);

    return (
      <>
        <div>
          <Label
            htmlFor="organization_name_ar"
            className="mb-1 block text-sm font-medium"
          >
            {t("organizationNameLabel")} <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="organization_name_ar"
            {...register("organization_name_ar")}
            disabled={isLoading}
            color={organizerErrors.organization_name_ar ? "failure" : "gray"}
          />
          {organizerErrors.organization_name_ar && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="institution_type"
            className="mb-1 block text-sm font-medium"
          >
            {t("institutionTypeLabel")} <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="institution_type"
            control={control}
            defaultValue={institutionTypeEnumValues[0] as InstitutionType}
            render={({ field }) => (
              <div className="relative">
                <Select
                  id="institution_type"
                  value={field.value}
                  onChange={(e) => {
                    const selectedValue = e.target.value as InstitutionType;
                    field.onChange(selectedValue);
                  }}
                  onBlur={field.onBlur}
                  disabled={isLoading}
                  color={organizerErrors.institution_type ? "failure" : "gray"}
                  className="w-full rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  style={{ textAlign: "right", paddingRight: "2.5rem" }}
                >
                  {institutionTypeEnumValues.map((type) => (
                    <option key={type} value={type}>
                      {tEnums(`InstitutionType.${type}`)}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          />
          {organizerErrors.institution_type && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>
      </>
    );
  }, [
    isLoading,
    t,
    tEnums,
    tValidation,
    register,
    control,
    errors,
    userProfile.user_type,
  ]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-card dark:bg-card-dark p-6 sm:p-8 rounded-lg shadow-xl"
    >
      <h2 className="text-xl font-semibold text-center text-foreground mb-2">
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {userProfile.user_type === "researcher"
          ? t("subtitleResearcher")
          : t("subtitleOrganizer")}
      </p>

      {formError && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          {formError}
        </Alert>
      )}

      {userProfile.user_type === "researcher"
        ? renderResearcherFields()
        : renderOrganizerFields()}

      <div>
        <Label htmlFor="bio_ar" className="mb-1 block text-sm font-medium">
          {t("bioLabel")}
        </Label>
        <Textarea
          id="bio_ar"
          {...register("bio_ar")}
          rows={4}
          disabled={isLoading}
          color={errors.bio_ar ? "failure" : "gray"}
        />
        {errors.bio_ar && (
          <p className="mt-1 text-sm text-red-600">{errors.bio_ar.message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-1 flex-1">
          <Label htmlFor="wilaya_id" className="mb-1 block text-sm font-medium">
            {t("wilayaLabel")} <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="wilaya_id"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Select
                  id="wilaya_id"
                  {...field}
                  disabled={isLoading || !locationDataLoaded}
                  color={errors.wilaya_id ? "failure" : "gray"}
                  className="w-full rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  style={{ textAlign: "right", paddingRight: "2.5rem" }}
                >
                  <option value="">{t("selectPlaceholder")}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.id} value={wilaya.id.toString()}>
                      {wilaya.name_ar}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          />
          {errors.wilaya_id && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <Label htmlFor="daira_id" className="mb-1 block text-sm font-medium">
            {t("dairaLabel")} <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="daira_id"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Select
                  id="daira_id"
                  {...field}
                  disabled={dairasLoading || !selectedWilayaId || !locationDataLoaded}
                  color={errors.daira_id ? "failure" : "gray"}
                  className="w-full rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  style={{ textAlign: "right", paddingRight: "2.5rem" }}
                >
                  <option value="">
                    {dairasLoading ? t('loadingDairas') : t('selectPlaceholder')}
                  </option>
                  {dairas.map(daira => (
                    <option key={daira.id} value={daira.id.toString()}>
                      {daira.name_ar}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          />
          {errors.daira_id && (
            <p className="mt-1 text-sm text-red-600">
              {tValidation("required")}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Spinner className="mr-2" size="sm" />
            {t("loadingButton")}
          </>
        ) : (
          t("submitButton")
        )}
      </Button>
    </form>
  );
}

const CompleteProfileForm = memo(CompleteProfileFormComponent);
export default CompleteProfileForm;
