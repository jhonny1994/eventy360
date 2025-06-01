-- supabase/migrations/20250610000000_add_bookmarks_rls_policies.sql

-- Enable RLS for the bookmarks table
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Add comments for clarity
COMMENT ON TABLE public.bookmarks IS 'User bookmarks for events.';
COMMENT ON COLUMN public.bookmarks.profile_id IS 'The profile ID of the user who bookmarked the event.';
COMMENT ON COLUMN public.bookmarks.event_id IS 'The ID of the event that was bookmarked.';

-- RLS Policies for bookmarks

-- Allow users to view their own bookmarks
CREATE POLICY "Allow users to view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = profile_id);

-- Allow all researchers (free, trial, or paid) to insert their own bookmarks
CREATE POLICY "Allow researchers to create bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.user_type = 'researcher'
    )
);

-- Allow all researchers (free, trial, or paid) to update their own bookmarks
CREATE POLICY "Allow researchers to update bookmarks"
ON public.bookmarks
FOR UPDATE
USING (auth.uid() = profile_id)
WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.user_type = 'researcher'
    )
);

-- Allow users to delete their own bookmarks
CREATE POLICY "Allow users to delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (auth.uid() = profile_id);

-- Grant usage on the table to authenticated users (they can only interact based on RLS)
GRANT SELECT, INSERT, DELETE, UPDATE ON public.bookmarks TO authenticated; 