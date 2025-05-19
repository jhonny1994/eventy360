'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface AuthContextProps {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Auth');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          // If there's an error with the session, clear it
          if (error instanceof Error && 
              (error.message.includes('Refresh Token') || 
               error.message.includes('refresh token'))) {
            // Clear session state but don't try to sign out again
            setSession(null);
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    // Initial session check with error handling
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        // Handle refresh token errors specifically
        if (error instanceof Error && 
            (error.message.includes('Refresh Token') || 
             error.message.includes('refresh token'))) {
          // Clear local session state
          setSession(null);
          setUser(null);
          // Attempt a clean sign out without throwing more errors
          supabase.auth.signOut().catch(e => console.error('Error signing out after token error:', e));
        }
        setLoading(false);
      });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);


  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success(t('logoutSuccess'));
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(t('logoutError'));
      // Even if there's an error, clear the local session state
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    supabase,
    session,
    user,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 