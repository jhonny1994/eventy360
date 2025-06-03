import { z } from 'zod';
import { toast } from 'react-hot-toast';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';

/**
 * Form validation schemas for admin authentication
 */

/**
 * Creates a login form schema with translations
 * @param t - Translation function from useTranslations('Validations')
 * @returns Zod schema for login form
 */
export const getLoginSchema = (t: (key: string, values?: Record<string, unknown>) => string) => {
  return z.object({
    email: z.string().email(t('email')),
    password: z.string().min(1, t('passwordRequired')),
  });
};

/**
 * Creates an admin account creation form schema with translations
 * @param t - Translation function from useTranslations('Validations')
 * @returns Zod schema for admin account creation form
 */
export const getAdminCreateAccountSchema = (t: (key: string, values?: Record<string, unknown>) => string) => {
  return z
    .object({
      password: z.string().min(8, t('passwordMinLength')),
      confirmPassword: z.string().min(8, t('passwordMinLength')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });
};

/**
 * Helper function for handling admin login
 * @param email Email address to login with
 * @param password Password to login with
 * @param t Translation function from useTranslations for error messages
 * @param supabase Supabase client from useAuth hook
 * @returns Result object with success flag, user data (if successful), and error (if failed)
 */
export async function handleAdminLogin(
  email: string,
  password: string,
  t: (key: string) => string,
  supabase: SupabaseClient<Database>
) {
  const toastId = toast.loading(t('submitting'));
  
  try {
    // Sign in with credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      toast.error(`${t('loginFailed')}: ${signInError.message}`, { id: toastId });
      return { success: false, error: signInError.message };
    }

    if (!signInData.user) {
      toast.error(`${t('loginFailed')}: ${t('userRetrievalFailed')}`, { id: toastId });
      return { success: false, error: t('userRetrievalFailed') };
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      toast.error(`${t('loginFailed')}: ${t('profileRetrievalFailed')}`, { id: toastId });
      await supabase.auth.signOut(); // Sign out if profile check fails
      return { success: false, error: t('profileRetrievalFailed') };
    }

    if (profile?.user_type !== 'admin') {
      toast.error(`${t('loginFailed')}: ${t('notAdminError')}`, { id: toastId });
      await supabase.auth.signOut(); // Sign out non-admin users
      return { success: false, error: t('notAdminError') };
    }

    toast.success(t('loginSuccessToast'), { id: toastId });
    
    return { 
      success: true, 
      user: signInData.user 
    };
    
  } catch (err) {
    const message = err instanceof Error ? err.message : t('unexpectedError');
    toast.error(`${t('loginFailed')}: ${message}`, { id: toastId });
    return { success: false, error: message };
  }
} 