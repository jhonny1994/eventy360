'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { Spinner, Alert, Card, Button } from 'flowbite-react';
import { HiInformationCircle, HiLogout } from 'react-icons/hi';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const { user, supabase, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  interface ExtendedProfile {
    id: string;
    user_type: string;
    is_extended_profile_complete: boolean;
    researcher_profiles?: {
      name: string;
      institution: string;
      academic_position: string;
    } | null;
    organizer_profiles?: {
      organization_name_ar: string;
      institution_type: string;
    } | null;
  }

  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/redirect');
      return;
    }

    // Fetch profile data
    async function fetchProfileData() {
      if (!user) return;

      try {
        // Get base profile and extended profile based on user type
        const { data, error } = await supabase
          .from('profiles')
          .select('*, researcher_profiles(*), organizer_profiles(*)')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && !data.is_extended_profile_complete) {
          // If profile is not complete, redirect to complete-profile
          router.push('/complete-profile');
          return;
        }

        setProfile(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchProfileData();
    }
  }, [user, authLoading, supabase, router]);

  // Add logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {t('title')}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t('welcome')}
            </p>
          </div>

          {/* Add logout button */}
          <Button
            color="failure"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rtl:flex-row-reverse"
          >
            <HiLogout className="h-5 w-5" />
            {t('logoutButton')}
          </Button>
        </div>

        {profile && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t('profileInfo')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">User Type</p>
                <p className="font-medium">{profile.user_type}</p>
              </div>

              {/* Display extended profile information based on user type */}
              {profile.user_type === 'researcher' && profile.researcher_profiles && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.researcher_profiles.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">{profile.researcher_profiles.institution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Position</p>
                    <p className="font-medium">{profile.researcher_profiles.academic_position}</p>
                  </div>
                </>
              )}

              {profile.user_type === 'organizer' && profile.organizer_profiles && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization Name</p>
                    <p className="font-medium">{profile.organizer_profiles.organization_name_ar}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Institution Type</p>
                    <p className="font-medium">{profile.organizer_profiles.institution_type}</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 