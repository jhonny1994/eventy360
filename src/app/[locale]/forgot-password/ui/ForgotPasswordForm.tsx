'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiInformationCircle } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider'; // Use AuthProvider
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation'; // Correct import for useParams
import { getForgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/auth'; // Import schema and type
import { createTranslator } from 'next-intl'; // Import createTranslator

// Define Props type including messages
interface ForgotPasswordFormProps {
  messages: any; // Changed from formMessages to messages, type can be more specific if desired
}

export default function ForgotPasswordForm({ messages }: ForgotPasswordFormProps) { // Changed prop name
  const params = useParams(); // Get URL parameters FIRST
  const locale = params.locale as string || 'ar'; // Extract locale FIRST

  // Add createTranslator calls back here
  const t = createTranslator({
    locale,
    messages: messages, // Use the full messages object
    namespace: 'Auth.ForgotPasswordPage' // Specify the namespace for this translator
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
  const { supabase } = useAuth(); // Get Supabase client from AuthProvider
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const forgotPasswordSchema = getForgotPasswordSchema(tValidation); // Pass validation translations

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormError(null);
    setFormSuccess(null);

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        // Supabase appends the redirect path to its own site URL for email resets.
        // The actual redirect to your app happens when the user clicks the link.
        // Configure the Site URL in your Supabase project settings (Authentication -> URL Configuration).
        // The redirectTo here specifies the path *on your site* where the user should land.
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        // Per Supabase recommendation for password reset, it's often better to show a generic success message 
        // to prevent user enumeration (attackers trying to find out which emails are registered).
        // However, if specific user-facing error messages are desired and deemed safe:
        // if (error.message.includes('User not found') || error.status === 404) {
        // setFormError(tAuth('emailNotFound'));
        // } else {
        // setFormError(tAuth('genericError'));
        // }
        // For this implementation, we will follow the safer approach:
        setFormSuccess(t('resetLinkSent'));
      } else {
        setFormSuccess(t('resetLinkSent'));
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    });
  };

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
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <TextInput
          id="email"
          type="email"
          icon={HiMail}
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          color={errors.email ? 'failure' : 'gray'}
          disabled={isPending}
          required
          aria-invalid={!!errors.email}
          className="mt-1"
        />
        {errors.email?.message && (
          <p className="mt-0.5 text-sm text-red-600 dark:text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending && (
          <Spinner aria-label={tAria('submittingResetRequest')} size="sm" className="me-2" />
        )}
        {isPending ? t('sendingLink') : t('submitButton')}
      </Button>
    </form>
  );
} 