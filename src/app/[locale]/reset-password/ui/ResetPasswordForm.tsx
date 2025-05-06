'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiOutlineLockClosed, HiInformationCircle, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { getResetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/auth'; // Import schema and type
import { createTranslator } from 'next-intl'; // Import createTranslator
import { useParams } from 'next/navigation'; // Import useParams

// Define Props type including messages
interface ResetPasswordFormProps {
  messages: any; // Changed from formMessages to messages
}

export default function ResetPasswordForm({ messages }: ResetPasswordFormProps) { // Changed prop name
  const params = useParams(); // Get locale via params
  const locale = params.locale as string || 'ar';

  // Create translators from props
  const t = createTranslator({
    locale,
    messages: messages, // Use the full messages object
    namespace: 'Auth.ResetPasswordPage' // Specify the namespace for this translator
  });
  const tValidation = createTranslator({
    locale,
    messages: messages, // Use the full messages object
    namespace: 'Validations' // Specify the namespace for this translator
  });
  const tAria = createTranslator({
    locale,
    messages: messages, // Use the full messages object
    namespace: 'AriaLabels' // Specify the namespace for this translator
  });

  const router = useRouter();
  const { supabase } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordSchema = getResetPasswordSchema(tValidation);

  useEffect(() => {
    // Supabase client automatically handles the #access_token fragment from the URL
    // on page load and fires an auth event. We can listen for PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in the password recovery state, form can be used.
        setTokenError(null);
      } else if (!session) {
        // If there's no session and it's not PASSWORD_RECOVERY, the token might be invalid/expired or not present.
        // However, directly concluding token error here might be too aggressive as other events might fire.
        // A more robust check might be needed if Supabase doesn't automatically restrict form usage.
      }
    });

    // Check if there's an error in the URL fragment from Supabase (e.g., error_description)
    const hash = window.location.hash;
    if (hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const errorDescription = params.get('error_description');
      setTokenError(errorDescription || t('invalidOrExpiredToken'));
    }
    else if (!hash.includes('access_token')){
        // If no access token at all, likely invalid access
        setTokenError(t('invalidOrExpiredTokenLink'));
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (tokenError) return; // Don't submit if there was an initial token error

    setFormError(null);
    setFormSuccess(null);

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: data.password });

      if (error) {
        console.error('Password update error:', error);
        setFormError(error.message || t('genericError'));
      } else {
        setFormSuccess(t('passwordResetSuccess'));
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    });
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (tokenError) {
    return (
      <Alert color="failure" icon={HiInformationCircle}>
        {tokenError}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          {formError}
        </Alert>
      )}
      {formSuccess && (
        <Alert color="success" icon={HiInformationCircle} className="mb-4">
          {formSuccess}
        </Alert>
      )}
      <div>
        <Label htmlFor="password">{t('newPasswordLabel')}</Label>
        <div className="relative mt-1">
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              icon={HiOutlineLockClosed}
              placeholder={t('newPasswordPlaceholder')}
              {...register('password')}
              color={errors.password ? 'failure' : 'gray'}
              disabled={isPending}
              required
              aria-invalid={!!errors.password}
            />
            <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={showPassword ? tAria('hidePassword') : tAria('showPassword')}
                disabled={isPending}
            >
                {showPassword ? <HiEyeOff className="h-5 w-5"/> : <HiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.password?.message && (
          <p className="mt-0.5 text-sm text-red-600 dark:text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">{t('confirmNewPasswordLabel')}</Label>
        <div className="relative mt-1">
            <TextInput
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              icon={HiOutlineLockClosed}
              placeholder={t('confirmNewPasswordPlaceholder')}
              {...register('confirmPassword')}
              color={errors.confirmPassword ? 'failure' : 'gray'}
              disabled={isPending}
              required
              aria-invalid={!!errors.confirmPassword}
            />
            <button 
                type="button" 
                onClick={toggleConfirmPasswordVisibility} 
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={showConfirmPassword ? tAria('hidePassword') : tAria('showPassword')}
                disabled={isPending}
            >
                {showConfirmPassword ? <HiEyeOff className="h-5 w-5"/> : <HiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="mt-0.5 text-sm text-red-600 dark:text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending || !!tokenError} className="w-full mt-2">
        {isPending && (
          <Spinner aria-label={tAria('resettingPassword')} size="sm" className="me-2" />
        )}
        {isPending ? t('resettingButton') : t('submitButton')}
      </Button>
    </form>
  );
} 