-- Function to handle new user creation: creates a profile and a trial subscription.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important for accessing auth.users and inserting into public schema tables
AS $$
DECLARE
  v_user_type public.user_type_enum;
  v_raw_user_meta_data jsonb;
BEGIN
  -- Get user_type from raw_user_meta_data if available
  v_raw_user_meta_data := NEW.raw_user_meta_data;
  IF v_raw_user_meta_data IS NOT NULL AND v_raw_user_meta_data ? 'user_type' THEN
    CASE (v_raw_user_meta_data->>'user_type')
      WHEN 'researcher' THEN
        v_user_type := 'researcher';
      WHEN 'organizer' THEN
        v_user_type := 'organizer';
      ELSE
        -- Default to researcher if an unexpected value is provided
        RAISE WARNING 'Unexpected user_type value % provided in raw_user_meta_data. Defaulting to researcher.', v_raw_user_meta_data->>'user_type';
        v_user_type := 'researcher';
    END CASE;
  ELSE
    -- Default to researcher if raw_user_meta_data or user_type is missing
    RAISE WARNING 'raw_user_meta_data or user_type field is missing. Defaulting to researcher.';
    v_user_type := 'researcher';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, user_type, is_verified)
  VALUES (NEW.id, v_user_type, false); -- is_verified defaults to false

  -- Insert into public.subscriptions with a 1-month trial
  INSERT INTO public.subscriptions (user_id, tier, status, trial_ends_at)
  VALUES (NEW.id, 'trial', 'trial', timezone('utc', now()) + interval '1 month');

  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created_create_profile_and_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on schema and tables to service_role for the trigger function
-- This might be necessary if the function SECURITY DEFINER is not sufficient or if other roles need to execute it.
-- However, with SECURITY DEFINER, the function executes with the permissions of the user who defined it (usually superuser during migrations).
-- For auth triggers, Supabase typically handles necessary permissions.
-- GRANT USAGE ON SCHEMA public TO service_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO service_role;
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role; -- Not usually needed for triggers directly

-- Add comments for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user signup: creates a profile with user_type from metadata and a 1-month trial subscription.';
COMMENT ON TRIGGER on_auth_user_created_create_profile_and_subscription ON auth.users IS 'After a new user is created in auth.users, triggers public.handle_new_user() to create a corresponding profile and trial subscription.'; 