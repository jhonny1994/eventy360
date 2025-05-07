'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLoginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, Link } from '@/i18n/navigation';
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiInformationCircle, HiEye, HiEyeOff, HiOutlineMail } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const t = useTranslations('Auth.LoginForm');
  const tValidation = useTranslations('Validations');
  const tAria = useTranslations('AriaLabels');

  const { supabase } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = getLoginSchema(tValidation);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ 
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFormError(null);
    const toastId = toast.loading(t('submitting'));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setFormError(error.message);
        toast.error(`${t('loginFailed')}: ${error.message}`, { id: toastId });
      } else {
        toast.success(t('loginSuccessToast'), { id: toastId });
        
        // Use the redirect route for middleware handling
        router.push('/redirect');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      const message = err instanceof Error ? err.message : t('unexpectedError');
      setFormError(message);
      toast.error(`${t('loginFailed')}: ${message}`, { id: toastId });
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        />
        {errors.email?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
         <div className="flex items-center justify-between">
           <Label htmlFor="password">{t('passwordLabel')}</Label>
           <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                {t('forgotPasswordLink')}
            </Link>
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
              disabled={isLoading}
            />
            <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                disabled={isLoading}
            >
                {showPassword ? <HiEyeOff className="h-5 w-5"/> : <HiEye className="h-5 w-5"/>}
            </button>
        </div>
        {errors.password?.message && (
          <p className="mt-0.5 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className="mt-2 w-full">
        {isLoading && (
          <Spinner aria-label={tAria('loggingIn')} size="sm" className="me-2" />
        )}
        {isLoading ? t('loading') : t('submitButton')}
      </Button>
    </form>
  );
} 