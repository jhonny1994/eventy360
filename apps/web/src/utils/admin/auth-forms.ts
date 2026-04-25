import { toast } from 'react-hot-toast';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';

/**
 * Admin authentication utilities
 * 
 * Note: Schema definitions have been centralized in @/lib/schemas/auth.ts
 * This file now only contains admin-specific authentication helper functions
 */

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