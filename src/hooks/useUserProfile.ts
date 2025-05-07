import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { PostgrestError } from '@supabase/supabase-js';

// Define types based on the DB schema
export type UserProfile = {
  id: string;
  user_type: 'researcher' | 'organizer' | 'admin';
  is_verified: boolean;
  is_extended_profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type ResearcherProfile = {
  profile_id: string;
  name: string;
  institution: string;
  academic_position?: string;
  bio_translations?: { ar?: string };
  profile_picture_url?: string;
  wilaya_id: number;
  daira_id: number;
  created_at: string;
  updated_at: string;
};

export type OrganizerProfile = {
  profile_id: string;
  name_translations: { ar: string };
  institution_type: string;
  bio_translations?: { ar?: string };
  profile_picture_url?: string;
  wilaya_id: number;
  daira_id: number;
  created_at: string;
  updated_at: string;
};

export type AdminProfile = {
  profile_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ProfileDetails = 
  | { userType: 'researcher'; profile: ResearcherProfile } 
  | { userType: 'organizer'; profile: OrganizerProfile }
  | { userType: 'admin'; profile: AdminProfile };

export interface CompleteUserProfile {
  baseProfile: UserProfile;
  profileDetails?: ProfileDetails;
}

export const useUserProfile = () => {
  const { supabase, user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch base profile
        const { data: baseProfileData, error: baseProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (baseProfileError) {
          setError(baseProfileError);
          setLoading(false);
          return;
        }

        if (!baseProfileData) {
          setLoading(false);
          return;
        }

        const baseProfile = baseProfileData as UserProfile;
        let profileDetails: ProfileDetails | undefined;

        // Fetch role-specific profile based on user_type
        if (baseProfile.user_type === 'researcher') {
          const { data: researcherData, error: researcherError } = await supabase
            .from('researcher_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (researcherError && researcherError.code !== 'PGRST116') {
            // PGRST116 means no rows returned, which is fine if profile is not complete
            setError(researcherError);
          } else if (researcherData) {
            profileDetails = {
              userType: 'researcher',
              profile: researcherData as ResearcherProfile
            };
          }
        } else if (baseProfile.user_type === 'organizer') {
          const { data: organizerData, error: organizerError } = await supabase
            .from('organizer_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (organizerError && organizerError.code !== 'PGRST116') {
            setError(organizerError);
          } else if (organizerData) {
            profileDetails = {
              userType: 'organizer',
              profile: organizerData as OrganizerProfile
            };
          }
        } else if (baseProfile.user_type === 'admin') {
          const { data: adminData, error: adminError } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('profile_id', user.id)
            .single();

          if (adminError && adminError.code !== 'PGRST116') {
            setError(adminError);
          } else if (adminData) {
            profileDetails = {
              userType: 'admin',
              profile: adminData as AdminProfile
            };
          }
        }

        setProfile({
          baseProfile,
          profileDetails
        });
      } catch (e) {
        console.error('Error fetching user profile:', e);
        setError(e as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [supabase, user, authLoading]);

  return { profile, loading: authLoading || loading, error };
}; 