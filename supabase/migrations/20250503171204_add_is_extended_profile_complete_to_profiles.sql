-- Add is_extended_profile_complete column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_extended_profile_complete BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_extended_profile_complete
IS 'Tracks if the user has completed the role-specific extended profile information after email confirmation. Controls access to full app features.'; 