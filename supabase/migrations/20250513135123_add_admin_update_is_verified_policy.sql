-- This migration adds an RLS policy to the profiles table
-- allowing admin users to update the is_verified column on any profile.

-- Drop the existing policy that restricts updates to only the user's own profile
-- Note: This assumes the policy name 'Allow user to UPDATE own profile' is consistent.
-- If the policy name differs, you'll need to adjust the DROP POLICY statement.
-- Alternatively, you could modify the existing policy if that's preferred, 
-- but creating a new, more specific policy for admins is generally clearer.
-- Given the previous policy restricted updates to *only* their own, dropping and adding is necessary here.
DROP POLICY "Allow user to UPDATE own profile" ON public.profiles;

-- Recreate a policy for authenticated users to update their *own* profiles,
-- excluding columns admins should manage (like is_verified).
-- This is a more secure version of the previous policy.
CREATE POLICY "Allow authenticated users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Explicitly list columns users are allowed to update themselves.
  -- Add/remove columns based on your schema and what users should control.
  -- This example assumes users can update their updated_at timestamp, 
  -- but you should list all relevant columns like bio, name, etc. if they are in the main profiles table.
  -- For now, we'll just ensure they can't change is_verified.
  NEW.is_verified = OLD.is_verified -- Prevent users from changing their own verified status
);

-- Create the new policy allowing admin users to update the is_verified column on any profile.
CREATE POLICY "Allow admin to update is_verified on any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT profiles.user_type FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
)
WITH CHECK (TRUE); -- Admins can set is_verified to true or false

-- Note: The USING clause filters which rows can be updated. The WITH CHECK clause filters
-- the values that can be set in the updated row. For admins updating is_verified,
-- we want them to be able to update any profile (USING filter based on admin status)
-- and set is_verified to any boolean value (WITH CHECK TRUE).


-- Apply the updated RLS policies
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
