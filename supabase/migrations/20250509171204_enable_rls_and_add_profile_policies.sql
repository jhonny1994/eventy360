-- Enable RLS on researcher_profiles table
ALTER TABLE public.researcher_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT their own researcher profile
-- (You might already have a broader SELECT policy or allow all authenticated reads, adjust if needed)
CREATE POLICY "Allow user to SELECT own researcher profile"
ON public.researcher_profiles FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Policy: Allow users to UPDATE their own researcher profile
CREATE POLICY "Allow user to UPDATE own researcher profile"
ON public.researcher_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Enable RLS on organizer_profiles table
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT their own organizer profile
-- (Adjust if you have broader SELECT policies)
CREATE POLICY "Allow user to SELECT own organizer profile"
ON public.organizer_profiles FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Policy: Allow users to UPDATE their own organizer profile
CREATE POLICY "Allow user to UPDATE own organizer profile"
ON public.organizer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Note on other operations (INSERT, DELETE for profiles):
-- INSERTs into these tables are likely handled by a function or trigger after initial profile creation
-- (e.g., during the complete_profile step). If users can directly insert, you'd need an INSERT policy.
-- DELETEs for profiles might be restricted or handled by specific backend logic.
-- The policies above focus on SELECT and UPDATE which are most relevant for editing an existing profile.

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT their own profile
CREATE POLICY "Allow user to SELECT own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id); -- Assuming 'id' is the primary key linking to auth.users.id

-- Policy: Allow users to UPDATE their own profile
-- Be specific about which columns they can update if necessary
CREATE POLICY "Allow user to UPDATE own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
-- For WITH CHECK, you might want to restrict which columns can be updated.
-- e.g., users shouldn't be able to change their `id`, `created_at`, or perhaps even `is_verified` directly.
-- Example for more restrictive UPDATE:
-- WITH CHECK (
--   auth.uid() = id AND
--   -- Only allow updating specific, safe columns
--   (NEW.first_name IS NOT NULL OR OLD.first_name IS NOT NULL) -- Example, adjust to your schema
-- );
-- However, since profile_picture_url is in the extended profiles, the main profile update
-- might just be for 'updated_at' and geo fields if they are editable here.
-- The `complete_my_profile_details` RPC likely handles the initial INSERT and some updates.
-- For direct updates via the edit form, ensure the policy is safe.
