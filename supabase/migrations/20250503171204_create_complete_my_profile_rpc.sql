-- RPC function for users to complete their role-specific extended profile.
CREATE OR REPLACE FUNCTION public.complete_my_profile(profile_data JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- To allow updating tables in public schema owned by postgres/admin
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_type public.user_type_enum;
BEGIN
  -- 1. Get the user's type from their main profile
  SELECT user_type INTO v_user_type
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_type IS NULL THEN
    RAISE EXCEPTION 'User profile not found for id: %', v_user_id;
  END IF;

  -- 2. Based on user_type, UPSERT into the corresponding extended profile table
  IF v_user_type = 'researcher' THEN
    INSERT INTO public.researcher_profiles (
      profile_id,
      name,
      institution,
      academic_position,
      bio_translations,
      profile_picture_url,
      wilaya_id,
      daira_id
    )
    VALUES (
      v_user_id,
      profile_data->>'name', -- Assuming direct mapping from JSONB keys
      profile_data->>'institution',
      profile_data->>'academic_position',
      profile_data->'bio_translations', -- Keep as JSONB
      profile_data->>'profile_picture_url',
      (profile_data->>'wilaya_id')::INT,
      (profile_data->>'daira_id')::INT
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      name = EXCLUDED.name,
      institution = EXCLUDED.institution,
      academic_position = EXCLUDED.academic_position,
      bio_translations = EXCLUDED.bio_translations,
      profile_picture_url = EXCLUDED.profile_picture_url,
      wilaya_id = EXCLUDED.wilaya_id,
      daira_id = EXCLUDED.daira_id,
      updated_at = timezone('utc', now());

  ELSIF v_user_type = 'organizer' THEN
    INSERT INTO public.organizer_profiles (
      profile_id,
      name_translations,
      institution_type,
      bio_translations,
      profile_picture_url,
      wilaya_id,
      daira_id
      -- Note: contact_email, website_url, logo_url from previous draft not in summary for organizer_profiles table structure
      -- If these are needed, the table and this RPC must be updated.
    )
    VALUES (
      v_user_id,
      profile_data->'name_translations', -- Keep as JSONB
      (profile_data->>'institution_type')::public.institution_type_enum,
      profile_data->'bio_translations', -- Keep as JSONB
      profile_data->>'profile_picture_url',
      (profile_data->>'wilaya_id')::INT,
      (profile_data->>'daira_id')::INT
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      name_translations = EXCLUDED.name_translations,
      institution_type = EXCLUDED.institution_type,
      bio_translations = EXCLUDED.bio_translations,
      profile_picture_url = EXCLUDED.profile_picture_url,
      wilaya_id = EXCLUDED.wilaya_id,
      daira_id = EXCLUDED.daira_id,
      updated_at = timezone('utc', now());
  
  -- ELSIF v_user_type = 'admin' THEN
    -- Admins might not have an extended profile in the same way, or it's managed differently.
    -- For now, no action for admin type unless admin_profiles needs population here.
    -- The summary defines admin_profiles with only name, which might be set elsewhere.

  ELSE
    RAISE WARNING 'User type % does not have a specific extended profile to complete via this function.', v_user_type;
    -- Optionally, still mark as complete if no extended profile is expected for this type
    -- UPDATE public.profiles
    -- SET is_extended_profile_complete = true, updated_at = timezone('utc', now())
    -- WHERE id = v_user_id;
    -- RETURN;
  END IF;

  -- 3. Update the main profile to mark extended profile as complete
  UPDATE public.profiles
  SET is_extended_profile_complete = true, updated_at = timezone('utc', now())
  WHERE id = v_user_id;

END;
$$;

COMMENT ON FUNCTION public.complete_my_profile(JSONB) 
IS 'Allows a user to submit their role-specific extended profile data (researcher or organizer), 
which is upserted into the relevant table, and marks their main profile as complete.';

-- Grant execute permission to the authenticated role
-- Supabase by default allows authenticated users to call RPCs in the public schema unless restricted.
-- However, explicitly granting can be clearer or necessary in some setups.
GRANT EXECUTE ON FUNCTION public.complete_my_profile(JSONB) TO authenticated; 