'use client';

import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button, Label, TextInput, Textarea, Select, Alert, Spinner } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import {
  getCompleteProfileFormSchema,
  type ProfileCompletionFormShape,
  institutionTypeEnumValues,
} from '@/lib/schemas/profile';
import type { Database } from '@/database.types';

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

  if (profileData.user_type === 'researcher' && profileData.researcher_profiles) {
    return {
      user_type: 'researcher' as const,
      name: profileData.researcher_profiles.name || '',
      institution: profileData.researcher_profiles.institution || '',
      academic_position: profileData.researcher_profiles.academic_position || '',
      bio_ar: bioArResearcher,
      profile_picture_url: '', 
      ...commonRequiredValues,
    };
  } else if (profileData.user_type === 'organizer' && profileData.organizer_profiles) {
    const nameArOrganizer = (profileData.organizer_profiles.name_translations as TranslationObject)?.ar || '';
    return {
      user_type: 'organizer' as const,
      organization_name_ar: nameArOrganizer,
      institution_type: profileData.organizer_profiles.institution_type || institutionTypeEnumValues[0],
      bio_ar: bioArOrganizer,
      profile_picture_url: '', 
      ...commonRequiredValues,
    };
  }
  console.warn("EditProfileForm: Profile data incomplete or invalid user_type for initial values");
  return { 
    user_type: profileData.user_type as 'researcher' | 'organizer', 
    name: '', institution: '', academic_position: '', bio_ar: '', profile_picture_url: '',
    organization_name_ar: '', institution_type: institutionTypeEnumValues[0],
    ...commonRequiredValues
  };
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
  }, [selectedWilayaId, setValue, filteredDairas, watch, isDirty]);

  const onSubmit = useCallback(async (data: ProfileEditFormShape) => {
    if (!session?.user?.id) {
      setFormError("User not authenticated.");
      return;
    }
    setIsLoading(true);
    setFormError(null);
    const toastId = toast.loading(t('loadingButton'));

    try {
      let extendedProfileUpdates: ExtendedProfileUpdateShape;
      let extendedProfileTable: 'researcher_profiles' | 'organizer_profiles';

      const commonData = {
        wilaya_id: data.wilaya_id ? parseInt(data.wilaya_id as string, 10) : null,
        daira_id: data.daira_id ? parseInt(data.daira_id as string, 10) : null,
        bio_translations: { ar: data.bio_ar || '' },
        updated_at: new Date().toISOString(),
      };

      if (data.user_type === 'researcher') {
        extendedProfileTable = 'researcher_profiles';
        extendedProfileUpdates = {
          ...commonData,
          name: data.name,
          institution: data.institution,
          academic_position: data.academic_position || null,
        } as ResearcherProfileUpdate;
      } else if (data.user_type === 'organizer') {
        extendedProfileTable = 'organizer_profiles';
        extendedProfileUpdates = {
          ...commonData,
          name_translations: { ar: data.organization_name_ar },
          institution_type: data.institution_type,
        } as OrganizerProfileUpdate;
      } else {
        throw new Error("Invalid user type for submission");
      }

      const { error: updateError } = await supabase
        .from(extendedProfileTable)
        .update(extendedProfileUpdates)
        .eq('profile_id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success(t('successToast'), { id: toastId });
      router.push('/profile');
      router.refresh();

    } catch (error) {
      const err = error as Error;
      console.error("Failed to update profile:", err);
      setFormError(err.message || t('errorToast'));
      toast.error(t('errorToast'), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, router, t]);

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