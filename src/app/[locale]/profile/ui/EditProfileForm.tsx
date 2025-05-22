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
  FileInput,
  HelperText,
  Avatar,
} from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { toast } from "react-hot-toast";
import {
  getCompleteProfileFormSchema,
  type ProfileCompletionFormShape,
  institutionTypeEnumValues,
} from "@/lib/schemas/profile";
import type { Database } from "@/database.types";
import Image from "next/image";

type TranslationObject = {
  ar?: string;
  en?: string;
  fr?: string;
  [key: string]: string | undefined;
};

type ExtendedProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  researcher_profiles:
  | Database["public"]["Tables"]["researcher_profiles"]["Row"]
  | null;
  organizer_profiles:
  | Database["public"]["Tables"]["organizer_profiles"]["Row"]
  | null;
};

interface EditProfileFormProps {
  userProfileData: ExtendedProfile;
  locale: string;
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

type ProfileEditFormShape = ProfileCompletionFormShape;

type ResearcherProfileUpdate = Partial<
  Omit<
    Database["public"]["Tables"]["researcher_profiles"]["Row"],
    "id" | "profile_id" | "created_at"
  > & { bio_translations?: TranslationObject }
>;
type OrganizerProfileUpdate = Partial<
  Omit<
    Database["public"]["Tables"]["organizer_profiles"]["Row"],
    "id" | "profile_id" | "created_at"
  > & {
    name_translations?: TranslationObject;
    bio_translations?: TranslationObject;
  }
>;
type ExtendedProfileUpdateShape =
  | ResearcherProfileUpdate
  | OrganizerProfileUpdate;

const getInitialValuesForEdit = (
  profileData: ExtendedProfile
): ProfileEditFormShape => {
  const commonRequiredValues = {
    wilaya_id:
      profileData.researcher_profiles?.wilaya_id?.toString() ||
      profileData.organizer_profiles?.wilaya_id?.toString() ||
      "",
    daira_id:
      profileData.researcher_profiles?.daira_id?.toString() ||
      profileData.organizer_profiles?.daira_id?.toString() ||
      "",
  };

  const bioArResearcher =
    (profileData.researcher_profiles?.bio_translations as TranslationObject)
      ?.ar || "";
  const bioArOrganizer =
    (profileData.organizer_profiles?.bio_translations as TranslationObject)
      ?.ar || "";

  const currentProfilePictureUrl =
    profileData.user_type === "researcher"
      ? profileData.researcher_profiles?.profile_picture_url
      : profileData.organizer_profiles?.profile_picture_url;

  if (
    profileData.user_type === "researcher" &&
    profileData.researcher_profiles
  ) {
    return {
      user_type: "researcher" as const,
      name: profileData.researcher_profiles.name || "",
      institution: profileData.researcher_profiles.institution || "",
      academic_position:
        profileData.researcher_profiles.academic_position || "",
      bio_ar: bioArResearcher,
      profile_picture_url: currentProfilePictureUrl || "",
      ...commonRequiredValues,
    };
  } else if (
    profileData.user_type === "organizer" &&
    profileData.organizer_profiles
  ) {
    const nameArOrganizer =
      (profileData.organizer_profiles.name_translations as TranslationObject)
        ?.ar || "";
    return {
      user_type: "organizer" as const,
      organization_name_ar: nameArOrganizer,
      institution_type:
        profileData.organizer_profiles.institution_type ||
        institutionTypeEnumValues[0],
      bio_ar: bioArOrganizer,
      profile_picture_url: currentProfilePictureUrl || "",
      ...commonRequiredValues,
    };
  }
  const fallbackUserType =
    profileData.user_type === "researcher" ||
      profileData.user_type === "organizer"
      ? profileData.user_type
      : "researcher";
  return {
    user_type: fallbackUserType,
    name: "",
    institution: "",
    academic_position: "",
    organization_name_ar: "",
    institution_type: institutionTypeEnumValues[0],
    bio_ar: "",
    profile_picture_url: currentProfilePictureUrl || "",
    ...commonRequiredValues,
  } as ProfileEditFormShape;
};

const isResearcherError = (
  errors: FieldErrors<ProfileEditFormShape>,
  userType: string
): errors is FieldErrors<
  Extract<ProfileEditFormShape, { user_type: "researcher" }>
> => {
  return userType === "researcher";
};

const isOrganizerError = (
  errors: FieldErrors<ProfileEditFormShape>,
  userType: string
): errors is FieldErrors<
  Extract<ProfileEditFormShape, { user_type: "organizer" }>
> => {
  return userType === "organizer";
};

function EditProfileFormComponent({
  userProfileData,
  locale,
}: EditProfileFormProps) {
  const t = useTranslations("Auth.CompleteProfileForm");
  const tEdit = useTranslations("ProfilePage");
  const tEnums = useTranslations("Enums");
  const tValidation = useTranslations("Validations");
  const router = useRouter();
  const { supabase, session } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [allDairas, setAllDairas] = useState<Daira[]>([]);
  const [locationDataLoaded, setLocationDataLoaded] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialPreviewUrl =
    userProfileData.user_type === "researcher"
      ? userProfileData.researcher_profiles?.profile_picture_url
      : userProfileData.organizer_profiles?.profile_picture_url;
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const schema = useMemo(() => {
    if (
      userProfileData.user_type !== "researcher" &&
      userProfileData.user_type !== "organizer"
    ) {
      throw new Error("Unsupported user type for profile editing.");
    }
    return getCompleteProfileFormSchema(tValidation, userProfileData.user_type);
  }, [tValidation, userProfileData.user_type]);

  const defaultValuesForEdit = useMemo(
    () => getInitialValuesForEdit(userProfileData),
    [userProfileData]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<ProfileEditFormShape>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesForEdit,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(defaultValuesForEdit);
  }, [defaultValuesForEdit, reset]);

  useEffect(() => {
    const currentPreview = previewUrl;
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const currentProfilePic =
      userProfileData.user_type === "researcher"
        ? userProfileData.researcher_profiles?.profile_picture_url
        : userProfileData.organizer_profiles?.profile_picture_url;
    setPreviewUrl(currentProfilePic || null);
    setSelectedFile(null);
    setUploadError(null);
  }, [
    userProfileData.user_type,
    userProfileData.researcher_profiles?.profile_picture_url,
    userProfileData.organizer_profiles?.profile_picture_url,
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLocationData() {
      if (!locationDataLoaded) {
        try {
          const { data: wilayasData, error: wilayasError } = await supabase
            .from("wilayas")
            .select("id, name_ar, name_other")
            .order("id");
          if (wilayasError) throw wilayasError;

          const { data: dairasData, error: dairasError } = await supabase
            .from("dairas")
            .select("id, wilaya_id, name_ar, name_other")
            .order("id");
          if (dairasError) throw dairasError;

          if (isMounted) {
            setWilayas(wilayasData || []);
            setAllDairas(dairasData || []);
            setLocationDataLoaded(true);
            if (
              defaultValuesForEdit.wilaya_id &&
              defaultValuesForEdit.daira_id
            ) {
              setValue("daira_id", defaultValuesForEdit.daira_id, {
                shouldDirty: false,
                shouldValidate: false,
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch location data:", error);
          if (isMounted) setFormError(t("locationDataFetchError"));
        }
      }
    }
    fetchLocationData();
    return () => {
      isMounted = false;
    };
  }, [supabase, t, locationDataLoaded, setValue, defaultValuesForEdit]);

  const selectedWilayaId = watch("wilaya_id");

  const filteredDairas = useMemo(() => {
    if (!selectedWilayaId || !allDairas.length) return [];
    return allDairas.filter(
      (d) => d.wilaya_id === parseInt(selectedWilayaId as string, 10)
    );
  }, [selectedWilayaId, allDairas]);

  useEffect(() => {
    if (selectedWilayaId && isDirty) {
      const currentDairaIsValid = filteredDairas.some(
        (d) => d.id.toString() === watch("daira_id")
      );
      if (!currentDairaIsValid) {
        setValue("daira_id", "", { shouldDirty: true });
      }
    }
  }, [selectedWilayaId, filteredDairas, watch, setValue, isDirty]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      const maxSizeInMB = 2;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setUploadError(
          tValidation("fileTypeInvalid", { types: allowedTypes.join(", ") })
        );
        setSelectedFile(null);

        setValue(
          "profile_picture_url",
          defaultValuesForEdit.profile_picture_url || "",
          { shouldDirty: true, shouldValidate: false }
        );
        return;
      }
      if (file.size > maxSizeInBytes) {
        setUploadError(
          tValidation("fileSizeTooLarge", { maxSize: maxSizeInMB })
        );
        setSelectedFile(null);

        setValue(
          "profile_picture_url",
          defaultValuesForEdit.profile_picture_url || "",
          { shouldDirty: true, shouldValidate: false }
        );
        return;
      }

      setSelectedFile(file);
      const newObjectUrl = URL.createObjectURL(file);
      setPreviewUrl(newObjectUrl);
      setValue("profile_picture_url", newObjectUrl, {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
      setSelectedFile(null);

      const originalProfilePic =
        userProfileData.user_type === "researcher"
          ? userProfileData.researcher_profiles?.profile_picture_url
          : userProfileData.organizer_profiles?.profile_picture_url;
      setPreviewUrl(originalProfilePic || null);
      setValue(
        "profile_picture_url",
        defaultValuesForEdit.profile_picture_url || "",
        { shouldDirty: true, shouldValidate: false }
      );
    }
  };

  const getTranslatedErrorMessage = useCallback(
    (
      error:
        | { code?: string; status?: number; message?: string }
        | Error
        | null,
      tToasts: ReturnType<typeof useTranslations>
    ): string => {
      console.error("Supabase operation failed:", error);

      if (!error || typeof error !== "object") {
        return tToasts("updateErrorGeneric");
      }

      if ("code" in error && typeof error.code === "string") {
        switch (error.code) {
          case "23505":
            return tToasts("errorDuplicateEntry");
          default:
            break;
        }
      }

      if ("status" in error && typeof error.status === "number") {
        switch (error.status) {
          case 400:
          case 404:
            if (error.message && typeof error.message === "string") {
              if (
                error.message.includes("File type not allowed") ||
                error.message.includes("Invalid file format")
              ) {
                return tValidation("profilePicture.invalidFileType");
              }
              if (error.message.includes("Payload too large")) {
                return tValidation("profilePicture.fileSizeTooLarge", {
                  maxSizeMB: 2,
                });
              }
            }

            break;
          case 413:
            return tValidation("profilePicture.fileSizeTooLarge", {
              maxSizeMB: 2,
            });
          case 403:
          case 401:
            return tToasts("errorStoragePolicy");
          default:
            return tToasts("errorStorageUploadFailed");
        }
      }

      if ("message" in error && typeof error.message === "string") {
        if (error.message === "Failed to fetch") {
          return tToasts("errorNetwork");
        }

        return tToasts("errorBackendGeneric");
      }

      return tToasts("updateErrorGeneric");
    },
    [tValidation]
  );

  const onSubmit = useCallback(
    async (data: ProfileEditFormShape) => {
      setIsLoading(true);
      setFormError(null);
      setUploadError(null);

      if (!supabase || !session?.user?.id) {
        setFormError(t("authenticationError"));
        setIsLoading(false);
        return;
      }

      const currentActualProfilePictureUrl =
        userProfileData.user_type === "researcher"
          ? userProfileData.researcher_profiles?.profile_picture_url
          : userProfileData.organizer_profiles?.profile_picture_url;
      let finalProfilePictureUrl = currentActualProfilePictureUrl || null;
      let filePath: string | null = null;

      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split(".").pop();
        filePath = `${session.user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });
        setUploading(false);

        if (uploadError) {
          toast.error(getTranslatedErrorMessage(uploadError, tEdit));
          setUploadError(getTranslatedErrorMessage(uploadError, tEdit));
          filePath = null;
        } else {
          finalProfilePictureUrl = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath).data.publicUrl;

          setUploadError(null);
        }
      }

      const commonUpdateData = {
        updated_at: new Date().toISOString(),

        wilaya_id: data.wilaya_id
          ? parseInt(data.wilaya_id.toString(), 10)
          : undefined,
        daira_id: data.daira_id
          ? parseInt(data.daira_id.toString(), 10)
          : undefined,
      };

      let profileUpdatePayload: ExtendedProfileUpdateShape;
      let profileUpdateTable: "researcher_profiles" | "organizer_profiles";

      const mainProfileUpdatePayload: Partial<
        Database["public"]["Tables"]["profiles"]["Row"]
      > = {
        updated_at: new Date().toISOString(),
      };

      if (data.user_type === "researcher") {
        profileUpdateTable = "researcher_profiles";
        profileUpdatePayload = {
          name: data.name,
          institution: data.institution,
          academic_position: data.academic_position,
          bio_translations: {
            ...((userProfileData.researcher_profiles
              ?.bio_translations as TranslationObject) || {}),
            ar: data.bio_ar,
          },
          profile_picture_url: finalProfilePictureUrl,
          wilaya_id: commonUpdateData.wilaya_id,
          daira_id: commonUpdateData.daira_id,
          updated_at: commonUpdateData.updated_at,
        };
      } else if (data.user_type === "organizer") {
        profileUpdateTable = "organizer_profiles";
        profileUpdatePayload = {
          name_translations: {
            ...((userProfileData.organizer_profiles
              ?.name_translations as TranslationObject) || {}),
            ar: data.organization_name_ar,
          },
          institution_type: data.institution_type,
          bio_translations: {
            ...((userProfileData.organizer_profiles
              ?.bio_translations as TranslationObject) || {}),
            ar: data.bio_ar,
          },
          profile_picture_url: finalProfilePictureUrl,
          wilaya_id: commonUpdateData.wilaya_id,
          daira_id: commonUpdateData.daira_id,
          updated_at: commonUpdateData.updated_at,
        };
      } else {
        setFormError("Invalid user type encountered during submission.");
        setIsLoading(false);
        return;
      }

      const { error: mainProfileError } = await supabase
        .from("profiles")
        .update(mainProfileUpdatePayload)
        .eq("id", session.user.id);

      if (mainProfileError) {
        toast.error(getTranslatedErrorMessage(mainProfileError, tEdit));
        setIsLoading(false);
        return;
      }

      const { error: roleProfileError } = await supabase
        .from(profileUpdateTable)
        .update(profileUpdatePayload)
        .eq("profile_id", session.user.id);

      setIsLoading(false);

      if (roleProfileError) {
        toast.error(getTranslatedErrorMessage(roleProfileError, tEdit));
      } else {
        toast.success(tEdit("Toasts.updateSuccess"));
        setFormError(null);
        reset(data);
        router.refresh();

        if (filePath && finalProfilePictureUrl && !uploadError) {
          supabase.functions
            .invoke("clean-orphan-avatars", {
              body: { newAvatarPath: filePath },
            })
            .then((response) => {
              if (response.error) {
                console.error(
                  "Error invoking clean-orphan-avatars function:",
                  response.error
                );
              } else {
                console.log(
                  "Clean-orphan-avatars function invoked successfully.",
                  response.data
                );
              }
            })
            .catch((err) => {
              console.error(
                "Exception invoking clean-orphan-avatars function:",
                err
              );
            });
        }
      }
    },
    [
      supabase,
      session,
      userProfileData,
      router,
      reset,
      t,
      tEdit,
      selectedFile,
      uploadError,
      getTranslatedErrorMessage,
    ]
  );

  if (!locationDataLoaded) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner aria-label={t("loading")} />
        <p className="ms-2">{t("loading")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle}>
          {formError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile picture */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {tEdit("profilePictureLabel")}
            </h3>
            
            {/* Profile picture preview */}
            {previewUrl && (
              <div className="my-4 flex justify-center">
                <Avatar
                  alt={tEdit("profilePicturePreviewAlt")}
                  rounded
                  size="xl"
                  img={(props) => {
                    const { className: avatarProvidedClassName, ...restProps } =
                      props;
                    return (
                      <Image
                        {...restProps}
                        src={previewUrl}
                        alt={tEdit("profilePicturePreviewAlt")}
                        width={128}
                        height={128}
                        referrerPolicy="no-referrer"
                        className={
                          avatarProvidedClassName || "rounded-full object-cover"
                        }
                        priority
                        onError={() => {
                          console.warn(
                            "Failed to load image preview from URL:",
                            previewUrl
                          );
                        }}
                      />
                    );
                  }}
                />
              </div>
            )}
            
            <FileInput
              id="profilePictureFile"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="mt-3"
            />
            <HelperText className="mt-1">
              {tEdit("profilePictureHelperText")}
            </HelperText>
            
            {uploadError && (
              <Alert color="failure" className="mt-3 text-sm">
                {uploadError}
              </Alert>
            )}
            
            {uploading && (
              <div className="flex items-center space-x-2 mt-3">
                <Spinner size="sm" aria-label={tEdit("uploadingSpinnerLabel")} />
                <span>{tEdit("uploadingText")}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Profile information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {userProfileData.user_type === "researcher" 
                ? t("subtitleResearcher") 
                : t("subtitleOrganizer")}
            </h3>
            
            <div className="space-y-6">
              {userProfileData.user_type === "researcher" && (
                <>
                  <div>
                    <Label htmlFor="name" className="mb-2 block">
                      {t("researcherNameLabel")}
                    </Label>
                    <TextInput
                      id="name"
                      {...register("name")}
                      placeholder={t("researcherNameLabel")}
                    />
                    {isResearcherError(errors, userProfileData.user_type) &&
                      errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="institution">
                      {t("institutionLabel")}
                    </Label>
                    <TextInput
                      id="institution"
                      {...register("institution")}
                      placeholder={t("institutionLabel")}
                    />
                    {isResearcherError(errors, userProfileData.user_type) &&
                      errors.institution && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.institution.message}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="academic_position">
                      {t("academicPositionLabel")}
                    </Label>
                    <TextInput
                      id="academic_position"
                      {...register("academic_position")}
                      placeholder={t("academicPositionLabel")}
                    />
                    {isResearcherError(errors, userProfileData.user_type) &&
                      errors.academic_position && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.academic_position.message}
                        </p>
                      )}
                  </div>
                </>
              )}

              {userProfileData.user_type === "organizer" && (
                <>
                  <div>
                    <Label htmlFor="organization_name_ar">
                      {t("organizationNameLabel")}
                    </Label>
                    <TextInput
                      id="organization_name_ar"
                      {...register("organization_name_ar")}
                      placeholder={t("organizationNameLabel")}
                      dir="rtl"
                    />
                    {isOrganizerError(errors, userProfileData.user_type) &&
                      errors.organization_name_ar && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.organization_name_ar.message}
                        </p>
                      )}
                  </div>
                  <div>
                    <Label htmlFor="institution_type">
                      {t("institutionTypeLabel")}
                    </Label>
                    <Controller
                      name="institution_type"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Select 
                            id="institution_type" 
                            {...field}
                            dir={locale === "ar" ? "rtl" : "ltr"}
                            style={locale === "ar" ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
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
                    {isOrganizerError(errors, userProfileData.user_type) &&
                      errors.institution_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.institution_type.message}
                        </p>
                      )}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="bio_ar">
                  {t("bioLabel")}
                </Label>
                <Textarea
                  id="bio_ar"
                  {...register("bio_ar")}
                  placeholder={t("bioLabel")}
                  rows={4}
                  dir="rtl"
                />
                {errors.bio_ar && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio_ar.message}</p>
                )}
              </div>

              {/* Location fields section with a divider */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t("locationTitle") || "Location Information"}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wilaya_id">
                      {t("wilayaLabel")}
                    </Label>
                    <Controller
                      name="wilaya_id"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Select 
                            id="wilaya_id" 
                            {...field}
                            dir={locale === "ar" ? "rtl" : "ltr"}
                            style={locale === "ar" ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                          >
                            <option value="">{t("selectPlaceholder")}</option>
                            {wilayas.map((wilaya) => (
                              <option key={wilaya.id} value={wilaya.id.toString()}>
                                {locale === "ar" ? wilaya.name_ar : wilaya.name_other}
                              </option>
                            ))}
                          </Select>
                        </div>
                      )}
                    />
                    {errors.wilaya_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.wilaya_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="daira_id">
                      {t("dairaLabel")}
                    </Label>
                    <Controller
                      name="daira_id"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Select
                            id="daira_id"
                            {...field}
                            disabled={!selectedWilayaId || filteredDairas.length === 0}
                            dir={locale === "ar" ? "rtl" : "ltr"}
                            style={locale === "ar" ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
                          >
                            <option value="">{t("selectPlaceholder")}</option>
                            {filteredDairas.map((daira) => (
                              <option key={daira.id} value={daira.id.toString()}>
                                {locale === "ar" ? daira.name_ar : daira.name_other}
                              </option>
                            ))}
                          </Select>
                        </div>
                      )}
                    />
                    {errors.daira_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.daira_id.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className={`flex flex-col sm:flex-row ${locale === 'ar' ? 'sm:justify-start' : 'sm:justify-end'} gap-3 mt-6`}>
        {locale === 'ar' ? (
          <>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="w-full sm:w-auto"
              color="primary"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ms-3">{t("loadingButton")}</span>
                </>
              ) : (
                tEdit("editProfileButton")
              )}
            </Button>
            <Button
              type="button"
              onClick={() => router.push(`/${locale}/profile`)}
              disabled={isLoading}
              className="w-full sm:w-auto"
              color="light"
            >
              {t("cancelButton") || "Cancel"}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => router.push(`/${locale}/profile`)}
              disabled={isLoading}
              className="w-full sm:w-auto"
              color="light"
            >
              {t("cancelButton") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="w-full sm:w-auto"
              color="primary"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ms-3">{t("loadingButton")}</span>
                </>
              ) : (
                tEdit("editProfileButton")
              )}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}

export default memo(EditProfileFormComponent);
