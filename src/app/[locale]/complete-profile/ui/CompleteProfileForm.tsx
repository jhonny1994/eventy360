'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Label, TextInput, Textarea, Select, Alert, Spinner } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import type { UserProfile } from '@/lib/schemas/profile';
import {
  getCompleteProfileFormSchema,
  type ProfileCompletionFormShape,
  institutionTypeEnumValues
} from '@/lib/schemas/profile';
import { FieldErrors } from 'react-hook-form';

interface CompleteProfileFormProps {
  userProfile: UserProfile;
}

// Helper function to generate initial values
const getInitialValues = (profile: UserProfile): ProfileCompletionFormShape => {
  // Common initial values for OPTIONAL fields
  const commonOptionalValues = {
    bio_ar: '',
    profile_picture_url: '',
  };

  // Common initial values for REQUIRED fields (empty string is typical starting point)
  const commonRequiredValues = {
    wilaya_id: '',
    daira_id: '',
  };

  if (profile.user_type === 'researcher') {
    return {
      user_type: 'researcher' as const,
      name: '', // Required
      institution: '', // Required
      academic_position: '', // Optional
      ...commonRequiredValues, // wilaya_id, daira_id are required
      ...commonOptionalValues,
    };
  } else { // 'organizer'
    const organizerValues: Extract<ProfileCompletionFormShape, { user_type: 'organizer' }> = {
      user_type: 'organizer' as const,
      organization_name_ar: '', // Required
      institution_type: '' as any, // Required, initial empty string for Select. Zod enum handles '' as invalid.
      ...commonRequiredValues, // wilaya_id, daira_id are required
      ...commonOptionalValues,
    };
    return organizerValues;
  }
};

export default function CompleteProfileForm({ userProfile }: CompleteProfileFormProps) {
  const t = useTranslations('Auth.CompleteProfileForm');
  const tEnums = useTranslations('Enums');
  const tValidation = useTranslations('Validations');
  const locale = useLocale();
  const router = useRouter();
  const { supabase } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const currentSchema = getCompleteProfileFormSchema(tValidation, userProfile.user_type);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileCompletionFormShape>({
    resolver: zodResolver(currentSchema),
    defaultValues: getInitialValues(userProfile),
  });

  useEffect(() => {
    reset(getInitialValues(userProfile));
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileCompletionFormShape) => {
    setIsLoading(true);
    setFormError(null);
    const toastId = toast.loading(t('loadingButton'));

    let profileDataPayload: any = {
      profile_picture_url: data.profile_picture_url || null,
      wilaya_id: data.wilaya_id ? parseInt(data.wilaya_id, 10) : null,
      daira_id: data.daira_id ? parseInt(data.daira_id, 10) : null,
    };

    if (data.user_type === 'researcher') {
      profileDataPayload = {
        ...profileDataPayload,
        name: data.name,
        institution: data.institution,
        academic_position: data.academic_position,
        bio_translations: { ar: data.bio_ar },
      };
    } else if (data.user_type === 'organizer') {
      profileDataPayload = {
        ...profileDataPayload,
        name_translations: { ar: data.organization_name_ar },
        institution_type: data.institution_type,
        bio_translations: { ar: data.bio_ar },
      };
    }

    try {
      const { error: rpcError } = await supabase.rpc('complete_my_profile', {
        profile_data: profileDataPayload,
      });

      if (rpcError) {
        throw rpcError;
      }

      toast.success(t('successToast'), { id: toastId });
      router.push(`/${locale}/profile`);
      router.refresh();
    } catch (error: any) {
      console.error('Error completing profile:', error);
      setFormError(error.message || t('errorToast'));
      toast.error(error.message || t('errorToast'), { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const [wilayas, setWilayas] = useState<{ id: number; name_ar: string; name_other: string; }[]>([]);
  const [dairas, setDairas] = useState<{ id: number; wilaya_id: number; name_ar: string; name_other: string; }[]>([]);
  const [allDairas, setAllDairas] = useState<typeof dairas>([]);

  const selectedWilayaId = watch('wilaya_id');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/wilayas.json');
        const data = await response.json();
        setWilayas(data.wilayas || []);
        setAllDairas(data.dairas || []);
        if (selectedWilayaId && data.dairas) {
            setDairas(data.dairas.filter((d: any) => d.wilaya_id === parseInt(selectedWilayaId,10)));
        } else {
            setDairas([]);
        }
      } catch (error) {
        console.error("Failed to fetch wilayas/dairas", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedWilayaId) {
      setDairas(allDairas.filter(d => d.wilaya_id === parseInt(selectedWilayaId, 10)));
    } else {
      setDairas([]);
    }
  }, [selectedWilayaId, allDairas]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card dark:bg-card-dark p-6 sm:p-8 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold text-center text-foreground mb-2">
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        {userProfile.user_type === 'researcher' ? t('subtitleResearcher') : t('subtitleOrganizer')}
      </p>

      {formError && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          {formError}
        </Alert>
      )}

      {userProfile.user_type === 'researcher' && (
        <>
          <div>
            <Label htmlFor="name" className="mb-1 block text-sm font-medium">{t('researcherNameLabel')}</Label>
            <TextInput id="name" {...register('name')} disabled={isLoading} color={(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).name ? 'failure' : 'gray'} />
            {(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).name && <p className="mt-1 text-sm text-red-600">{(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).name?.message}</p>}
          </div>
          <div>
            <Label htmlFor="institution" className="mb-1 block text-sm font-medium">{t('institutionLabel')}</Label>
            <TextInput id="institution" {...register('institution')} disabled={isLoading} color={(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).institution ? 'failure' : 'gray'} />
            {(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).institution && <p className="mt-1 text-sm text-red-600">{(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).institution?.message}</p>}
          </div>
          <div>
            <Label htmlFor="academic_position" className="mb-1 block text-sm font-medium">{t('academicPositionLabel')}</Label>
            <TextInput id="academic_position" {...register('academic_position')} disabled={isLoading} color={(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).academic_position ? 'failure' : 'gray'} />
            {(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).academic_position && <p className="mt-1 text-sm text-red-600">{(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'researcher' }>>).academic_position?.message}</p>}
          </div>
        </>
      )}

      {userProfile.user_type === 'organizer' && (
        <>
          <div>
            <Label htmlFor="organization_name_ar" className="mb-1 block text-sm font-medium">{t('organizationNameLabel')}</Label>
            <TextInput id="organization_name_ar" {...register('organization_name_ar')} disabled={isLoading} color={(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).organization_name_ar ? 'failure' : 'gray'} />
            {(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).organization_name_ar && <p className="mt-1 text-sm text-red-600">{(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).organization_name_ar?.message}</p>}
          </div>
          <div>
            <Label htmlFor="institution_type" className="mb-1 block text-sm font-medium">{t('institutionTypeLabel')}</Label>
            <Controller
                name="institution_type"
                control={control}
                render={({ field }) => (
                    <Select id="institution_type" {...field} disabled={isLoading} color={(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).institution_type ? 'failure' : 'gray'}>
                        <option value="">{t('selectPlaceholder') || "-- Select --"}</option>
                        {institutionTypeEnumValues.map(type => (
                            <option key={type} value={type}>
                                {tEnums(`InstitutionType.${type}`)}
                            </option>
                        ))}
                    </Select>
                )}
            />
            {(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).institution_type && <p className="mt-1 text-sm text-red-600">{(errors as FieldErrors<Extract<ProfileCompletionFormShape, { user_type: 'organizer' }>>).institution_type?.message}</p>}
          </div>
        </>
      )}

      <div>
        <Label htmlFor="bio_ar" className="mb-1 block text-sm font-medium">{t('bioLabel')}</Label>
        <Textarea id="bio_ar" {...register('bio_ar')} rows={4} disabled={isLoading} color={errors.bio_ar ? 'failure' : 'gray'} />
        {errors.bio_ar && <p className="mt-1 text-sm text-red-600">{errors.bio_ar.message}</p>}
      </div>
      <div>
        <Label htmlFor="profile_picture_url" className="mb-1 block text-sm font-medium">{t('profilePictureUrlLabel')}</Label>
        <TextInput id="profile_picture_url" type="url" {...register('profile_picture_url')} disabled={isLoading} color={errors.profile_picture_url ? 'failure' : 'gray'} />
        {errors.profile_picture_url && <p className="mt-1 text-sm text-red-600">{errors.profile_picture_url.message}</p>}
      </div>

      <div>
        <Label htmlFor="wilaya_id" className="mb-1 block text-sm font-medium">{t('wilayaLabel')}</Label>
        <Controller
            name="wilaya_id"
            control={control}
            defaultValue=""
            render={({ field }) => (
                <Select id="wilaya_id" {...field} disabled={isLoading || wilayas.length === 0} color={errors.wilaya_id ? 'failure' : 'gray'}>
                    <option value="">{t('selectPlaceholder') || "-- Select Wilaya --"}</option>
                    {wilayas.map(w => (
                        <option key={w.id} value={w.id.toString()}>{w.name_ar} ({w.id})</option>
                    ))}
                </Select>
            )}
        />
        {errors.wilaya_id && <p className="mt-1 text-sm text-red-600">{errors.wilaya_id.message}</p>}
      </div>
       <div>
        <Label htmlFor="daira_id" className="mb-1 block text-sm font-medium">{t('dairaLabel')}</Label>
        <Controller
            name="daira_id"
            control={control}
            defaultValue=""
            render={({ field }) => (
                <Select id="daira_id" {...field} disabled={isLoading || dairas.length === 0 || !selectedWilayaId} color={errors.daira_id ? 'failure' : 'gray'}>
                    <option value="">{t('selectPlaceholder') || "-- Select Daira --"}</option>
                    {dairas.map(d => (
                        <option key={d.id} value={d.id.toString()}>{d.name_ar} ({d.id})</option>
                    ))}
                </Select>
            )}
        />
        {errors.daira_id && <p className="mt-1 text-sm text-red-600">{errors.daira_id.message}</p>}
      </div>

      <Button type="submit" color="primary" disabled={isLoading} className="w-full">
        {isLoading ? (
            <>
                <Spinner size="sm" />
                <span className="pl-3">{t('loadingButton')}</span>
            </>
        ) : (
            t('submitButton')
        )}
      </Button>
    </form>
  );
} 