'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiInformationCircle } from 'react-icons/hi';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { getForgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/schemas/auth';
import { useTranslations, useLocale } from 'next-intl';

export default function ForgotPasswordForm() {
  const locale = useLocale();
  const t = useTranslations('Auth.ForgotPasswordPage');
  const tValidation = useTranslations('Validations');
  const tAria = useTranslations('AriaLabels');

  const router = useRouter();
  const { supabase } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const forgotPasswordSchema = getForgotPasswordSchema(tValidation);

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




        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (error) {

        setFormSuccess(t('resetLinkSent'));
      } else {
        setFormSuccess(t('resetLinkSent'));
        setTimeout(() => {
          router.push('/redirect');
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