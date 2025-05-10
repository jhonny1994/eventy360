'use client';

import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button, Label, TextInput, Textarea, Select, Alert, Spinner, FileInput, HelperText, Avatar } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import {
  getCompleteProfileFormSchema,
  type ProfileCompletionFormShape,
  institutionTypeEnumValues,
} from '@/lib/schemas/profile';
import type { Database } from '@/database.types';
import Image from 'next/image';

// Define a simple type for the expected JSONB translation structure
type TranslationObject = { ar?: string; en?: string; fr?: string; [key: string]: string | undefined };

// Define the shape of the data passed to the form for pre-filling
type ExtendedProfile = Database['public']['Tables']['profiles']['Row'] & {
  researcher_profiles: Database['public']['Tables']['researcher_profiles']['Row'] | null;
  organizer_profiles: Database['public']['Tables']['organizer_profiles']['Row'] | null;
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

// Define a more specific type for profile updates
type ResearcherProfileUpdate = Partial<Omit<Database['public']['Tables']['researcher_profiles']['Row'], 'id' | 'profile_id' | 'created_at'> & { bio_translations?: TranslationObject }>;
type OrganizerProfileUpdate = Partial<Omit<Database['public']['Tables']['organizer_profiles']['Row'], 'id' | 'profile_id' | 'created_at'> & { name_translations?: TranslationObject, bio_translations?: TranslationObject }>;
type ExtendedProfileUpdateShape = ResearcherProfileUpdate | OrganizerProfileUpdate;


const getInitialValuesForEdit = (profileData: ExtendedProfile): ProfileEditFormShape => {
  const commonRequiredValues = {
    wilaya_id: profileData.researcher_profiles?.wilaya_id?.toString() || profileData.organizer_profiles?.wilaya_id?.toString() || '',
    daira_id: profileData.researcher_profiles?.daira_id?.toString() || profileData.organizer_profiles?.daira_id?.toString() || '',
  };
  
  const bioArResearcher = (profileData.researcher_profiles?.bio_translations as TranslationObject)?.ar || '';
  const bioArOrganizer = (profileData.organizer_profiles?.bio_translations as TranslationObject)?.ar || '';
  // Get profile_picture_url from role-specific profile
  const currentProfilePictureUrl = profileData.user_type === 'researcher' 
    ? profileData.researcher_profiles?.profile_picture_url 
    : profileData.organizer_profiles?.profile_picture_url;

  if (profileData.user_type === 'researcher' && profileData.researcher_profiles) {
    return {
      user_type: 'researcher' as const,
      name: profileData.researcher_profiles.name || '',
      institution: profileData.researcher_profiles.institution || '',
      academic_position: profileData.researcher_profiles.academic_position || '',
      bio_ar: bioArResearcher,
      profile_picture_url: currentProfilePictureUrl || '', // Use from role-specific
      ...commonRequiredValues,
    };
  } else if (profileData.user_type === 'organizer' && profileData.organizer_profiles) {
    const nameArOrganizer = (profileData.organizer_profiles.name_translations as TranslationObject)?.ar || '';
    return {
      user_type: 'organizer' as const,
      organization_name_ar: nameArOrganizer,
      institution_type: profileData.organizer_profiles.institution_type || institutionTypeEnumValues[0],
      bio_ar: bioArOrganizer,
      profile_picture_url: currentProfilePictureUrl || '', // Use from role-specific
      ...commonRequiredValues,
    };
  }
  console.warn("EditProfileForm: Profile data incomplete or invalid user_type for initial values");
  const fallbackUserType = profileData.user_type === 'researcher' || profileData.user_type === 'organizer' ? profileData.user_type : 'researcher';
  return { 
    user_type: fallbackUserType, 
    name: '', // For researcher
    institution: '', // For researcher
    academic_position: '', // For researcher
    organization_name_ar: '', // For organizer
    institution_type: institutionTypeEnumValues[0], // For organizer
    bio_ar: '',
    profile_picture_url: currentProfilePictureUrl || '', 
    ...commonRequiredValues
  } as ProfileEditFormShape; // Added type assertion for fallback
};

const isResearcherError = (
  errors: FieldErrors<ProfileEditFormShape>, 
  userType: string
): errors is FieldErrors<Extract<ProfileEditFormShape, { user_type: 'researcher' }>> => {
  return userType === 'researcher';
};

const isOrganizerError = (
  errors: FieldErrors<ProfileEditFormShape>, 
  userType: string
): errors is FieldErrors<Extract<ProfileEditFormShape, { user_type: 'organizer' }>> => {
  return userType === 'organizer';
};

function EditProfileFormComponent({ userProfileData, locale }: EditProfileFormProps) {
  const t = useTranslations('Auth.CompleteProfileForm');
  const tEdit = useTranslations('ProfilePage');
  const tEnums = useTranslations('Enums');
  const tValidation = useTranslations('Validations');
  const router = useRouter();
  const { supabase, session } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [allDairas, setAllDairas] = useState<Daira[]>([]);
  const [locationDataLoaded, setLocationDataLoaded] = useState(false);
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Initialize previewUrl from role-specific profile_picture_url
  const initialPreviewUrl = userProfileData.user_type === 'researcher'
    ? userProfileData.researcher_profiles?.profile_picture_url
    : userProfileData.organizer_profiles?.profile_picture_url;
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const schema = useMemo(() => {
    if (userProfileData.user_type !== 'researcher' && userProfileData.user_type !== 'organizer') {
      console.error('EditProfileForm: Schema generation attempted for unsupported user_type:', userProfileData.user_type);
      throw new Error('Unsupported user type for profile editing.'); 
    }
    return getCompleteProfileFormSchema(tValidation, userProfileData.user_type);
  }, [tValidation, userProfileData.user_type]);
  
  const defaultValuesForEdit = useMemo(() => 
    getInitialValuesForEdit(userProfileData),
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
    mode: 'onBlur',
  });

  useEffect(() => {
    reset(defaultValuesForEdit);
  }, [defaultValuesForEdit, reset]);

  // Effect to manage revoking object URLs
  useEffect(() => {
    // This specific previewUrl is the one that was set in state.
    // We capture its value at the time the effect runs.
    const currentPreview = previewUrl;
    return () => {
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [previewUrl]); // Rerun when previewUrl changes

  // Effect to update preview when profile_picture_url from props (via role-specific profile) changes
  useEffect(() => {
    const currentProfilePic = userProfileData.user_type === 'researcher'
      ? userProfileData.researcher_profiles?.profile_picture_url
      : userProfileData.organizer_profiles?.profile_picture_url;
    setPreviewUrl(currentProfilePic || null);
    setSelectedFile(null); // Reset selected file if prop changes
    setUploadError(null);
  }, [
    userProfileData.user_type, 
    userProfileData.researcher_profiles?.profile_picture_url, 
    userProfileData.organizer_profiles?.profile_picture_url
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLocationData() {
      if (!locationDataLoaded) {
        try {
          const { data: wilayasData, error: wilayasError } = await supabase
            .from('wilayas')
            .select('id, name_ar, name_other')
            .order('id');
          if (wilayasError) throw wilayasError;
          
          const { data: dairasData, error: dairasError } = await supabase
            .from('dairas')
            .select('id, wilaya_id, name_ar, name_other')
            .order('id');
          if (dairasError) throw dairasError;
          
          if (isMounted) {
            setWilayas(wilayasData || []);
            setAllDairas(dairasData || []);
            setLocationDataLoaded(true);
            if (defaultValuesForEdit.wilaya_id && defaultValuesForEdit.daira_id) {
                setValue('daira_id', defaultValuesForEdit.daira_id, {shouldDirty: false, shouldValidate: false});
            }
          }
        } catch (error) {
          console.error("Failed to fetch location data:", error);
          if (isMounted) setFormError(t('locationDataFetchError'));
        }
      }
    }
    fetchLocationData();
    return () => { isMounted = false; };
  }, [supabase, t, locationDataLoaded, setValue, defaultValuesForEdit]);

  const selectedWilayaId = watch('wilaya_id');

  const filteredDairas = useMemo(() => {
    if (!selectedWilayaId || !allDairas.length) return [];
    return allDairas.filter(d => d.wilaya_id === parseInt(selectedWilayaId as string, 10));
  }, [selectedWilayaId, allDairas]);

  useEffect(() => {
    if (selectedWilayaId && isDirty ) {
        const currentDairaIsValid = filteredDairas.some(d => d.id.toString() === watch('daira_id'));
        if (!currentDairaIsValid) {
            setValue('daira_id', '', { shouldDirty: true });
        }
    }
  }, [selectedWilayaId, filteredDairas, watch, setValue, isDirty]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];

    // Revoke previous blob URL if it exists and a new file is being processed or selection is cleared
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const maxSizeInMB = 2;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setUploadError(tValidation('fileTypeInvalid', { types: allowedTypes.join(', ') }));
        setSelectedFile(null);
        // Optionally revert preview to original, or keep it to show current selection was invalid
        // setPreviewUrl(userProfileData.profile_picture_url || null); 
        setValue('profile_picture_url', defaultValuesForEdit.profile_picture_url || '', { shouldDirty: true, shouldValidate: false });
        return;
      }
      if (file.size > maxSizeInBytes) {
        setUploadError(tValidation('fileSizeTooLarge', { maxSize: maxSizeInMB }));
        setSelectedFile(null);
        // setPreviewUrl(userProfileData.profile_picture_url || null);
        setValue('profile_picture_url', defaultValuesForEdit.profile_picture_url || '', { shouldDirty: true, shouldValidate: false });
        return;
      }

      setSelectedFile(file);
      const newObjectUrl = URL.createObjectURL(file);
      setPreviewUrl(newObjectUrl);
      setValue('profile_picture_url', newObjectUrl, { shouldDirty: true, shouldValidate: false });
    } else {
      setSelectedFile(null);
      // Revert to original picture if selection is cleared
      const originalProfilePic = userProfileData.user_type === 'researcher'
        ? userProfileData.researcher_profiles?.profile_picture_url
        : userProfileData.organizer_profiles?.profile_picture_url;
      setPreviewUrl(originalProfilePic || null);
      setValue('profile_picture_url', defaultValuesForEdit.profile_picture_url || '', { shouldDirty: true, shouldValidate: false });
    }
  };

  const onSubmit = useCallback(async (data: ProfileEditFormShape) => {
    setIsLoading(true);
    setFormError(null);
    setUploadError(null); // Clear previous upload error

    if (!supabase || !session?.user?.id) {
      setFormError(t('authenticationError'));
      setIsLoading(false);
      return;
    }

    // Determine current profile picture URL from role-specific profile before any changes
    const currentActualProfilePictureUrl = userProfileData.user_type === 'researcher'
      ? userProfileData.researcher_profiles?.profile_picture_url
      : userProfileData.organizer_profiles?.profile_picture_url;
    let finalProfilePictureUrl = currentActualProfilePictureUrl || null;
    let filePath: string | null = null; // To store the path of the uploaded file

    // --- 1. Handle File Upload if a new file is selected ---
    if (selectedFile) {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      filePath = `${session.user.id}.${fileExt}`; // Correct: RLS-compliant path (USER_ID.EXT)

      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });
      setUploading(false);

      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        // Check for specific error messages if needed, e.g., from RLS
        if (uploadError.message.includes('policy')) {
            setUploadError(t('uploadPolicyError')); 
        } else {
            setUploadError(t('uploadError') + `: ${uploadError.message}`);
        }
        // Do not setFormError here if it's just an upload issue, allow profile text update to proceed if desired
        // setIsLoading(false); // Let it be set at the end
        // If upload fails, we might not want to proceed with DB update for profile_picture_url
        // For now, we'll let finalProfilePictureUrl remain the old one or null
        filePath = null; // Reset filePath as upload failed
      } else {
        // Get public URL only on successful upload
        finalProfilePictureUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        // console.log('File uploaded successfully, new URL:', finalProfilePictureUrl);
        // Clear any previous upload error on new success
        setUploadError(null);
      }
    }

    // --- 2. Prepare Profile Data for Update ---
    const commonUpdateData = {
      updated_at: new Date().toISOString(),
      // Ensure conversion to number or undefined for type compatibility
      wilaya_id: data.wilaya_id ? parseInt(data.wilaya_id.toString(), 10) : undefined,
      daira_id: data.daira_id ? parseInt(data.daira_id.toString(), 10) : undefined,
    };

    let profileUpdatePayload: ExtendedProfileUpdateShape;
    let profileUpdateTable: 'researcher_profiles' | 'organizer_profiles';
    // mainProfileUpdatePayload should only contain fields directly in the 'profiles' table.
    const mainProfileUpdatePayload: Partial<Database['public']['Tables']['profiles']['Row']> = {
        updated_at: new Date().toISOString(),
        // wilaya_id and daira_id are not in the main 'profiles' table based on schema.
        // They are in researcher_profiles / organizer_profiles.
      };

      if (data.user_type === 'researcher') {
      profileUpdateTable = 'researcher_profiles';
      profileUpdatePayload = {
          name: data.name,
          institution: data.institution,
        academic_position: data.academic_position,
        bio_translations: { ...((userProfileData.researcher_profiles?.bio_translations as TranslationObject) || {}), ar: data.bio_ar },
        profile_picture_url: finalProfilePictureUrl,
        wilaya_id: commonUpdateData.wilaya_id, // This is correct for role-specific table
        daira_id: commonUpdateData.daira_id,   // This is correct for role-specific table
        updated_at: commonUpdateData.updated_at, // Also update updated_at here
      };
      } else if (data.user_type === 'organizer') {
      profileUpdateTable = 'organizer_profiles';
      profileUpdatePayload = {
        name_translations: { ...((userProfileData.organizer_profiles?.name_translations as TranslationObject) || {}), ar: data.organization_name_ar },
          institution_type: data.institution_type,
        bio_translations: { ...((userProfileData.organizer_profiles?.bio_translations as TranslationObject) || {}), ar: data.bio_ar },
        profile_picture_url: finalProfilePictureUrl,
        wilaya_id: commonUpdateData.wilaya_id, // This is correct for role-specific table
        daira_id: commonUpdateData.daira_id,   // This is correct for role-specific table
        updated_at: commonUpdateData.updated_at, // Also update updated_at here
      };
      } else {
      setFormError('Invalid user type encountered during submission.');
      setIsLoading(false);
      return;
    }

    // --- 3. Update Database ---
    // First, update the main profiles table (e.g., for updated_at, wilaya_id)
    const { error: mainProfileError } = await supabase
        .from('profiles')
        .update(mainProfileUpdatePayload)
        .eq('id', session.user.id);

    if (mainProfileError) {
        setFormError(t('updateError') + ` (profiles): ${mainProfileError.message}`);
        setIsLoading(false);
        return;
    }

    // Then, update the role-specific profile table
    const { error: roleProfileError } = await supabase
      .from(profileUpdateTable)
      .update(profileUpdatePayload)
        .eq('profile_id', session.user.id);

    setIsLoading(false);

    if (roleProfileError) {
      setFormError(t('updateError') + ` (${profileUpdateTable}): ${roleProfileError.message}`);
      // If role-specific profile update fails, profile_picture_url might not be saved,
      // So, cleanup function should ideally not run or run with awareness.
      // However, for simplicity, if upload itself was successful and filePath is set, we'll try cleanup.
    } else {
      // Profile updated successfully in the database
      toast.success(t('updateSuccess'));
      reset(data); // Reset form with new successfully saved data
      router.refresh(); // Refresh to show new data including avatar

      // --- 4. Call Edge Function to Clean Orphan Avatars ---
      // Only call if a new file was successfully uploaded and its path is known
      if (filePath && finalProfilePictureUrl && !uploadError) { 
        // console.log('Invoking clean-orphan-avatars function with path:', filePath); // filePath is now USER_ID.EXT
        try {
            const { error: funcError } = await supabase
            .functions
            .invoke('clean-orphan-avatars', {
                body: { newAvatarPath: filePath }, // Pass USER_ID.EXT directly
            });

            if (funcError) {
                console.error('Error cleaning up old avatars:', funcError.message);
                toast.error(tEdit('avatarCleanupError') + `: ${funcError.message}`);
            } else {
                // console.log('Clean-orphan-avatars function response:', funcData);
                toast.success(tEdit('avatarCleanupSuccess'));
            }
        } catch (invokeCatchError: unknown) {
            let errorMessage = 'An unexpected error occurred during avatar cleanup.';
            if (invokeCatchError instanceof Error) {
                errorMessage = invokeCatchError.message;
            }
            console.error('Caught error invoking clean-orphan-avatars:', errorMessage);
            toast.error(tEdit('avatarCleanupError') + `: ${errorMessage}`);
        }
      } else if (uploadError && selectedFile) {
        // If there was an upload error but a file was selected, inform the user the cleanup won't run for the failed upload.
        // console.warn('Skipping avatar cleanup due to upload error for the selected file.');
      }
    }
  }, [supabase, session, userProfileData, router, reset, t, tEdit, selectedFile, uploadError]); // Added uploadError

  if (!locationDataLoaded) {
      return (
        <div className="flex justify-center items-center p-4">
            <Spinner aria-label={t('loading')}/>
            <p className="ms-2">{t('loading')}</p>
        </div>
      )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle}>
          {formError}
        </Alert>
      )}

      {/* Profile Picture Upload Section */}
      <div className="space-y-2">
        <Label htmlFor="profilePictureFile">{tEdit('profilePictureLabel')}</Label>
        {previewUrl && (
          <div className="mt-2 flex justify-center">
            <Avatar
              alt={tEdit('profilePicturePreviewAlt')}
              rounded
              size="xl"
              img={(props) => {
                const { className: avatarProvidedClassName, ...restProps } = props;
                return (
                  <Image
                    {...restProps}
                    src={previewUrl}
                    alt={tEdit('profilePicturePreviewAlt')}
                    width={128} 
                    height={128} 
                    referrerPolicy="no-referrer"
                    className={avatarProvidedClassName || "rounded-full object-cover"}
                    priority
                    onError={() => {
                      console.warn("Failed to load image preview from URL:", previewUrl);
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
          className="mt-1"
        />
        <HelperText className="mt-1">{tEdit('profilePictureHelperText')}</HelperText>
        {uploadError && <Alert color="failure" className="mt-2 text-sm">{uploadError}</Alert>}
        {uploading && 
          <div className="flex items-center space-x-2 mt-2">
            <Spinner size="sm" aria-label={tEdit('uploadingSpinnerLabel')} />
            <span>{tEdit('uploadingText')}</span>
          </div>
        }
      </div>

      {userProfileData.user_type === 'researcher' && (
        <>
          <div>
            <Label htmlFor="name">{t('researcherNameLabel')}</Label>
            <TextInput id="name" {...register('name')} placeholder={t('researcherNameLabel')} />
            {isResearcherError(errors, userProfileData.user_type) && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="institution">{t('institutionLabel')}</Label>
            <TextInput id="institution" {...register('institution')} placeholder={t('institutionLabel')} />
            {isResearcherError(errors, userProfileData.user_type) && errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution.message}</p>}
          </div>
          <div>
            <Label htmlFor="academic_position">{t('academicPositionLabel')}</Label>
            <TextInput id="academic_position" {...register('academic_position')} placeholder={t('academicPositionLabel')} />
            {isResearcherError(errors, userProfileData.user_type) && errors.academic_position && <p className="text-red-500 text-sm mt-1">{errors.academic_position.message}</p>}
          </div>
        </>
      )}

      {userProfileData.user_type === 'organizer' && (
        <>
          <div>
            <Label htmlFor="organization_name_ar">{t('organizationNameLabel')}</Label>
            <TextInput id="organization_name_ar" {...register('organization_name_ar')} placeholder={t('organizationNameLabel')} dir="rtl" />
            {isOrganizerError(errors, userProfileData.user_type) && errors.organization_name_ar && <p className="text-red-500 text-sm mt-1">{errors.organization_name_ar.message}</p>}
          </div>
          <div>
            <Label htmlFor="institution_type">{t('institutionTypeLabel')}</Label>
            <Controller
                name="institution_type"
                control={control}
                render={({ field }) => (
                    <Select id="institution_type" {...field}>
                        {institutionTypeEnumValues.map((type) => (
                            <option key={type} value={type}>
                                {tEnums(`InstitutionType.${type}`)}
                            </option>
                        ))}
                    </Select>
                )}
            />
            {isOrganizerError(errors, userProfileData.user_type) && errors.institution_type && <p className="text-red-500 text-sm mt-1">{errors.institution_type.message}</p>}
          </div>
        </>
      )}

      <div>
        <Label htmlFor="bio_ar">{t('bioLabel')}</Label>
        <Textarea id="bio_ar" {...register('bio_ar')} placeholder={t('bioLabel')} rows={4} dir="rtl" />
        {errors.bio_ar && <p className="text-red-500 text-sm mt-1">{errors.bio_ar.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="wilaya_id">{t('wilayaLabel')}</Label>
        <Controller
            name="wilaya_id"
            control={control}
            render={({ field }) => (
                <Select id="wilaya_id" {...field} >
                    <option value="">{t('selectPlaceholder')}</option>
                    {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id.toString()}>
                            {locale === 'ar' ? wilaya.name_ar : wilaya.name_other}
                        </option>
                    ))}
                </Select>
            )}
        />
        {errors.wilaya_id && <p className="text-red-500 text-sm mt-1">{errors.wilaya_id.message}</p>}
      </div>

      <div>
        <Label htmlFor="daira_id">{t('dairaLabel')}</Label>
        <Controller
            name="daira_id"
            control={control}
            render={({ field }) => (
                <Select id="daira_id" {...field} disabled={!selectedWilayaId || filteredDairas.length === 0}>
                    <option value="">{t('selectPlaceholder')}</option>
                    {filteredDairas.map((daira) => (
                        <option key={daira.id} value={daira.id.toString()}>
                            {locale === 'ar' ? daira.name_ar : daira.name_other}
                        </option>
                    ))}
                </Select>
            )}
        />
        {errors.daira_id && <p className="text-red-500 text-sm mt-1">{errors.daira_id.message}</p>}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
         <Button type="submit" disabled={isLoading || !isDirty} className="w-full sm:w-auto" color="primary">
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span className="ps-3">{t('loadingButton')}</span>
            </>
          ) : (
            tEdit('editProfileButton')
          )}
        </Button>
        <Button 
          type="button" 
          onClick={() => router.push('/profile')} 
          disabled={isLoading}
          className="w-full sm:w-auto"
          color="light"
        >
          {t('cancelButton') || 'Cancel'}
        </Button>
      </div>
    </form>
  );
}

export default memo(EditProfileFormComponent);