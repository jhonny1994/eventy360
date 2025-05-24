-- Migration to implement Row Level Security (RLS) policies for the topics table
-- This will ensure that admins have full CRUD access, while regular users have read-only access

-- First, enable RLS on the topics table
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enforced
ALTER TABLE public.topics FORCE ROW LEVEL SECURITY;

-- Create policy for admins to have full CRUD access to all topics
CREATE POLICY "Allow admins to manage all topics"
ON public.topics
FOR ALL
TO authenticated
USING (
  (SELECT profiles.user_type FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
);

-- Create policy for authenticated users to have read-only access to topics
CREATE POLICY "Allow authenticated users to read topics"
ON public.topics
FOR SELECT
TO authenticated
USING (TRUE);

-- Note: By not creating INSERT, UPDATE, or DELETE policies for regular users,
-- they will only be able to read topics, but not modify them.

-- Public users (unauthenticated) will not have any access, as no policies are defined for them 