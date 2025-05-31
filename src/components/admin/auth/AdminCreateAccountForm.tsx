'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { HiInformationCircle, HiEye, HiEyeOff, HiOutlineUser, HiCheckCircle } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; 
import { getAdminCreateAccountSchema } from '@/utils/admin/auth-forms';
import { AuthError, AuthLoadingState } from '@/components/admin/auth';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Define interface for Supabase user to avoid 'any' type
interface SupabaseUser {
  id: string;
  email: string | undefined;
  user_metadata?: {
    full_name?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

type CreateAccountFormValues = {
  password: string;
  confirmPassword: string;
};

/**
 * Standardized admin account creation form component with validation and error handling
 * Used during the admin invite flow to set up an initial admin account
 */
export default function AdminCreateAccountForm() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'ar';
  const tValidations = useTranslations('Validations');
  const tForm = useTranslations('AdminAuth.CreateAccountForm');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingInvite, setIsCheckingInvite] = useState(true);
  const [isInviteValid, setIsInviteValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [submissionCompletedSuccessfully, setSubmissionCompletedSuccessfully] = useState(false);
  
  const supabase = createClient();

  // Create a translation function with the specific signature expected by getLoginSchema
  const validationTranslator = (key: string, values?: Record<string, unknown>) => {
    return tValidations(key, values as Record<string, string | number | Date>);
  };

  const createAccountSchema = getAdminCreateAccountSchema(validationTranslator);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Check if invite is valid on component mount
  useEffect(() => {
    // Using an object to store the toast ID so we can dismiss it later
    const toastState = {
      id: undefined as string | undefined
    };

    const processAuthState = async (sessionUser: SupabaseUser | null | undefined) => {
      // If submission was successful, we are in a sign-out phase, don't show new invite errors.
      if (submissionCompletedSuccessfully) {
        setIsCheckingInvite(false);
        return;
      }

      if (!sessionUser && !window.location.hash.includes("access_token")) {
        setIsInviteValid(false);
        // Only show this toast if there isn't a more specific form error already displayed
        // and if the submission process hasn't already started showing its own toasts.
        if (!formError) { 
          toastState.id = toast.error(tForm("invalidInviteNoUser"), {
            duration: 6000, // Longer duration for important initial error
            id: "invalid-invite-toast",
          });
        }
      } else if (sessionUser) {
        setIsInviteValid(true);
        setUserEmail(sessionUser.email || null);
        setUserFullName(sessionUser.user_metadata?.full_name || null);
        
        // Check if this admin profile is already set up - this is a security check
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_extended_profile_complete')
          .eq('id', sessionUser.id)
          .single();
          
        if (!profileError && profile && profile.is_extended_profile_complete) {
          setIsInviteValid(false);
          setFormError(tForm("alreadySetupError") || "This admin account is already set up. Please use login instead.");
          toast.error(tForm("alreadySetupError") || "This admin account is already set up. Please use login instead.", {
            duration: 6000,
            id: "already-setup-error",
          });
        }
        
        // If a user session IS established, it means the invite token was likely valid.
        // We can dismiss any lingering generic invite error toast if one was somehow shown.
        toast.dismiss("invalid-invite-toast");
      } else {
        // Still waiting or in an indeterminate state (e.g. token in hash but session not yet fully processed)
        // We don't set isInviteValid yet, wait for onAuthStateChange or fallback.
      }
      setIsCheckingInvite(false);
    };

    // Fetch current user and check invite validity
    const checkInvite = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        processAuthState(user as SupabaseUser | null);
      } catch  {
        setIsInviteValid(false);
        setIsCheckingInvite(false);
      }
    };

    checkInvite();
    
    // Cleanup function to dismiss any lingering toasts
    return () => {
      if (toastState.id) {
        toast.dismiss(toastState.id);
      }
    };
  }, [supabase, tForm, formError, submissionCompletedSuccessfully]);

  const onSubmit = async (data: CreateAccountFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFormError(tForm('sessionExpiredUserNotFound'));
        setIsSubmitting(false);
        return;
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (passwordError) {
        setFormError(`${tForm('passwordUpdateFailed')}: ${passwordError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Create or update admin profile
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .upsert({
          profile_id: user.id,
          name: user.user_metadata?.full_name || 'Admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        setFormError(`${tForm('profileUpdateFailed')}: ${profileError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Update the profile's is_extended_profile_complete flag
      const { error: generalProfileError } = await supabase
        .from('profiles')
        .update({
          is_extended_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (generalProfileError) {
        console.warn(`${tForm('generalProfileUpdateFailedWarning')}: ${generalProfileError.message}`);
      }

      // Mark submission as successful to prevent further error checks during sign-out phase
      setSubmissionCompletedSuccessfully(true);
      
      // Complete setup by signing out and redirecting
      setIsSuccess(true);
      
      // Show success toast
      toast.success(tForm('accountSetupSuccessToast'));
      
      // Redirect after 2 seconds to login page with locale
      setTimeout(() => {
        router.push(`/${locale}/admin/login`);
      }, 2000);
      
    } catch  {
      setFormError(tForm('unexpectedError'));
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Show loading state while checking invite
  if (isCheckingInvite) {
    return <AuthLoadingState message={tForm('verifyingInvite')} />;
  }

  // Show error message if invite is invalid
  if (!isInviteValid) {
    return (
      <AuthError 
        error={formError || tForm('invalidInviteNoUser')} 
        title={tForm('invalidInviteTitle')}
        description={tForm('invalidInviteMessage')} 
        showRetry={false}
      />
    );
  }

  // Show success message after account setup
  if (isSuccess) {
    return (
      <Alert color="success" icon={HiCheckCircle}>
        <h3 className="text-lg font-medium">{tForm('accountSetupSuccessTitle')}</h3>
        <div className="mt-2 text-sm">{tForm('accountSetupSuccessBody')}</div>
      </Alert>
    );
  }

  // Render form
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">{tForm('setupFailedAlertTitle')}</span> {formError}
        </Alert>
      )}
      {/* Pre-filled email field (read-only) */}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email">{tForm('emailLabel')}</Label>
        </div>
        <TextInput
          id="email"
          type="email"
          value={userEmail || ''}
          readOnly
          disabled
        />
      </div>
      {/* Pre-filled full name field (read-only) */}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="fullName">{tForm('fullNameLabel')}</Label>
        </div>
        <TextInput
          id="fullName"
          icon={HiOutlineUser}
          value={userFullName || ''}
          readOnly
          disabled
        />
      </div>
      {/* Password field */}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="password">{tForm('passwordLabel')}</Label>
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={tForm('passwordPlaceholder')}
            {...register('password')}
            color={errors.password ? 'failure' : 'gray'}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute top-0 bottom-0 end-0 flex items-center px-3 text-gray-500"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      {/* Confirm password field */}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="confirmPassword">{tForm('confirmPasswordLabel')}</Label>
        </div>
        <div className="relative">
          <TextInput
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={tForm('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            color={errors.confirmPassword ? 'failure' : 'gray'}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute top-0 bottom-0 end-0 flex items-center px-3 text-gray-500"
            tabIndex={-1}
          >
            {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>
      <p className="text-xs text-gray-500">{tForm('termsHint')}</p>
      <Button 
        type="submit" 
        color="primary" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? tForm('submittingButton') : tForm('submitButton')}
      </Button>
      {/* Login link */}
      <div className="text-center text-sm text-gray-500">
        {tForm('alreadyHaveAccount')}{' '}
        <Link
          href={`/${locale}/admin/login`}
          className="text-primary hover:underline"
          >
          {tForm('loginLink')}
        </Link>
      </div>
    </form>
  );
} 