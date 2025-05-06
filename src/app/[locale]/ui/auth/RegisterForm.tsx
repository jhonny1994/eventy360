'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRegisterSchema, type RegisterFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button, Label, TextInput, Alert, Spinner, Radio } from 'flowbite-react';
import { HiInformationCircle, HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function RegisterForm() {
  const t = useTranslations('Auth.RegisterForm');
  const tValidation = useTranslations('Validations');
  const tAria = useTranslations('AriaLabels');

  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerSchema = getRegisterSchema(tValidation);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      userType: undefined
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);
    const toastId = toast.loading(t('submitting'));

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: data.userType
          }
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        setFormError(error.message);
        toast.error(`${t('registrationFailed')}: ${error.message}`, { id: toastId });
      } else {
        setFormSuccess(t('registrationSuccessMessage'));
        toast.success(t('registrationSuccessToast'), { id: toastId });
        reset();
      }
    } catch (err) {
      console.error('Unexpected registration error:', err);
      const message = err instanceof Error ? err.message : t('unexpectedError');
      setFormError(message);
      toast.error(`${t('registrationFailed')}: ${message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">{t('registrationFailed')}!</span> {formError}
        </Alert>
      )}
      {formSuccess && (
        <Alert color="success" icon={HiInformationCircle} className="mb-4">
           {formSuccess}
        </Alert>
      )}
      {/* Email Field */}
      <div>
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <TextInput
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          color={errors.email ? 'failure' : 'gray'}
          required
          aria-invalid={!!errors.email}
          className="mt-1"
          disabled={isLoading}
        />
        {errors.email?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <div className="relative mt-1">
          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            color={errors.password ? 'failure' : 'gray'}
            required
            aria-invalid={!!errors.password}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            disabled={isLoading}
          >
            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
        <div className="relative mt-1">
           <TextInput
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            color={errors.confirmPassword ? 'failure' : 'gray'}
            required
            aria-invalid={!!errors.confirmPassword}
            disabled={isLoading}
          />
           <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
            disabled={isLoading}
          >
            {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* User Type Selection */}
      <fieldset className="flex max-w-md flex-col gap-4 border-none p-0 m-0">
        <legend className="mb-4 font-semibold text-foreground">{t('userTypeLabel')}</legend>
        <div className="flex items-center gap-2">
          <Radio
            id="userTypeResearcher"
            value="researcher"
            {...register('userType')}
            color={errors.userType ? 'failure' : 'gray'}
            disabled={isLoading}
          />
          <Label htmlFor="userTypeResearcher">{t('userTypeResearcher')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Radio
            id="userTypeOrganizer"
            value="organizer"
            {...register('userType')}
            color={errors.userType ? 'failure' : 'gray'}
            disabled={isLoading}
          />
          <Label htmlFor="userTypeOrganizer">{t('userTypeOrganizer')}</Label>
        </div>
        {errors.userType?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
        )}
      </fieldset>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="mt-4 w-full">
        {isLoading && (
          <Spinner aria-label={tAria('submittingRegistration')} size="sm" className="me-2" />
        )}
        {isLoading ? t('loading') : t('submitButton')}
      </Button>
    </form>
  );
} 