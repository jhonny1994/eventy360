'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRegisterSchema, type RegisterFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiEye, HiEyeOff, HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineMail, HiCheckCircle } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

export default function RegisterForm() {
  const t = useTranslations('Auth.RegisterForm');
  const tValidation = useTranslations('Validations');
  const tAria = useTranslations('AriaLabels');
  const locale = useLocale();

  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const registerSchema = getRegisterSchema(tValidation);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
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

    const toastId = toast.loading(t('submitting'));

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: data.userType
          },
          emailRedirectTo: `${window.location.origin}/${locale}/redirect`
        }
      });

      if (error) {
        setFormError(error.message);
        toast.error(`${t('registrationFailed')}: ${error.message}`, { id: toastId });
      } else if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setFormSuccess(t('registrationSuccessMessage'));
        setRegisteredEmail(data.email);
        toast.success(t('registrationSuccessToast'), { id: toastId });
      } else {
        setFormSuccess(t('registrationSuccessMessage'));
        setRegisteredEmail(data.email);
        toast.success(t('registrationSuccessToast'), { id: toastId });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('unexpectedError');
      setFormError(message);
      toast.error(`${t('registrationFailed')}: ${message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!registeredEmail) return;
    setIsResendingEmail(true);
    const toastId = toast.loading(tAria('submittingResetRequest'));

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
    });

    if (error) {
      toast.error(t('resendConfirmationErrorToast') + `: ${error.message}`, { id: toastId });
    } else {
      toast.success(t('resendConfirmationSuccessToast'), { id: toastId });
    }
    setIsResendingEmail(false);
  };

  const currentUserType = watch('userType');

  if (formSuccess) {
    return (
      <Alert
        color="success"
        icon={HiCheckCircle}
        className="mb-4 p-6 text-center"
      >
        <h3 className="text-lg font-semibold mb-2">{t('registrationSuccessToast')}</h3>
        <p className="mb-4">{formSuccess}</p>
        {registeredEmail && (
          <Button
            onClick={handleResendConfirmationEmail}
            disabled={isResendingEmail || isLoading}
            color="primary"
            size="sm"
            className="mx-auto"
          >
            {isResendingEmail ? (
              <>
                <Spinner size="sm" />
                <span className="ps-3">{tAria('submittingResetRequest')}</span>
              </>
            ) : (
              t('resendConfirmationButton')
            )}
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
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
      <div>
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <TextInput
          id="email"
          type="email"
          icon={HiOutlineMail}
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          color={errors.email ? 'failure' : 'gray'}
          required
          aria-invalid={!!errors.email}
          className="mt-1"
          disabled={isLoading || !!formSuccess}
        />
        {errors.email?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

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
            disabled={isLoading || !!formSuccess}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            disabled={isLoading || !!formSuccess}
          >
            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

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
            className=""
            disabled={isLoading || !!formSuccess}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
            disabled={isLoading || !!formSuccess}
          >
            {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="">
        <label id="userTypeLabelId" className="mb-1.5 block text-sm font-medium text-foreground">
          {t('userTypeLabel')}
        </label>
        <div
          role="radiogroup"
          aria-labelledby="userTypeLabelId"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div
            role="radio"
            aria-checked={currentUserType === 'researcher'}
            tabIndex={currentUserType === 'researcher' ? 0 : -1}
            onClick={() => !formSuccess && setValue('userType', 'researcher', { shouldValidate: true })}
            onKeyDown={(e) => {
              if (!formSuccess && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                setValue('userType', 'researcher', { shouldValidate: true });
              }
            }}
            className={`group cursor-pointer rounded-lg border p-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary/60
                        ${currentUserType === 'researcher'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary shadow-lg'
                : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md'
              } ${formSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-disabled={!!formSuccess}
          >
            <HiOutlineAcademicCap
              className={`mx-auto mb-1 h-6 w-6 transition-colors group-hover:text-primary/80 
                          ${currentUserType === 'researcher' ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span
              className={`block text-sm font-semibold transition-colors group-hover:text-primary/90 
                          ${currentUserType === 'researcher' ? 'text-primary' : 'text-foreground'}`}
            >
              {t('userTypeResearcher')}
            </span>
          </div>

          <div
            role="radio"
            aria-checked={currentUserType === 'organizer'}
            tabIndex={currentUserType === 'organizer' ? 0 : -1}
            onClick={() => !formSuccess && setValue('userType', 'organizer', { shouldValidate: true })}
            onKeyDown={(e) => {
              if (!formSuccess && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                setValue('userType', 'organizer', { shouldValidate: true });
              }
            }}
            className={`group cursor-pointer rounded-lg border p-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary/60
                        ${currentUserType === 'organizer'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary shadow-lg'
                : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md'
              } ${formSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-disabled={!!formSuccess}
          >
            <HiOutlineClipboardList
              className={`mx-auto mb-1 h-6 w-6 transition-colors group-hover:text-primary/80 
                          ${currentUserType === 'organizer' ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span
              className={`block text-sm font-semibold transition-colors group-hover:text-primary/90 
                          ${currentUserType === 'organizer' ? 'text-primary' : 'text-foreground'}`}
            >
              {t('userTypeOrganizer')}
            </span>
          </div>
        </div>
        {errors.userType?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading || !!formSuccess} className="mt-2 w-full">
        {isLoading && (
          <>
            <Spinner size="sm" />
            <span className="ps-3">{t('loading')}</span>
          </>
        )}
        {!isLoading && t('submitButton')}
      </Button>
    </form>
  );
} 