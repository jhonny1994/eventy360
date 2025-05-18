'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLoginSchema, type LoginFormData } from '@/lib/schemas/auth'; // Keep existing schema for now
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation'; // Link removed from here
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiEye, HiEyeOff, HiOutlineMail } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function AdminLoginForm() {
  const t = useTranslations('AdminAuth.LoginForm'); // Changed namespace
  const tValidation = useTranslations('Validations');
  const tAria = useTranslations('AriaLabels');

  const { supabase } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = getLoginSchema(tValidation);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    const toastId = toast.loading(t('submitting'));

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setFormError(signInError.message);
        toast.error(`${t('loginFailed')}: ${signInError.message}`, { id: toastId });
        return;
      }

      if (!signInData.user) {
        setFormError(t('userRetrievalFailed'));
        toast.error(`${t('loginFailed')}: ${t('userRetrievalFailed')}`, { id: toastId });
        return;
      }

      // Check if user is an admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        setFormError(t('profileRetrievalFailed'));
        toast.error(`${t('loginFailed')}: ${t('profileRetrievalFailed')}`, { id: toastId });
        await supabase.auth.signOut(); // Sign out if profile check fails
        return;
      }

      if (profile?.user_type !== 'admin') {
        setFormError(t('notAdminError'));
        toast.error(`${t('loginFailed')}: ${t('notAdminError')}`, { id: toastId });
        await supabase.auth.signOut(); // Sign out non-admin users
        return;
      }
      
      toast.success(t('loginSuccessToast'), { id: toastId });

      // Use the centralized redirect pattern instead of direct navigation
      router.push('/admin/redirect');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('unexpectedError');
      setFormError(message);
      toast.error(`${t('loginFailed')}: ${message}`, { id: toastId });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">{t('loginFailed')}!</span> {formError}
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
          disabled={isSubmitting}
        />
        {errors.email?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t('passwordLabel')}</Label>
          
        </div>
        <div className="relative mt-1">
          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            color={errors.password ? 'failure' : 'gray'}
            required
            aria-invalid={!!errors.password}
            className=""
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            disabled={isSubmitting}
          >
            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting && (
          <Spinner aria-label={tAria('loggingIn')} size="sm" className="me-2" />
        )}
        {isSubmitting ? t('loading') : t('submitButton')}
      </Button>
    </form>
  );
} 