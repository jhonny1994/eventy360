import { useAuth as useAuthProvider } from '@/components/providers/AuthProvider';

/**
 * Hook for accessing authentication state and Supabase client
 * 
 * This is a standardized wrapper around the AuthProvider's useAuth hook,
 * providing a consistent API for authentication functionality throughout the application.
 * 
 * @returns The authentication context containing user, supabase client, loading state, and auth methods
 */
export function useAuth() {
  return useAuthProvider();
} 