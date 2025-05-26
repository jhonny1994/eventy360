-- Create the submission_versions table to track version history of submissions

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS public.submission_versions CASCADE;

-- Create the submission_versions table
CREATE TABLE public.submission_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title_translations JSONB NOT NULL,
    abstract_translations JSONB NOT NULL,
    abstract_file_url TEXT,
    abstract_file_metadata JSONB,
    full_paper_file_url TEXT,
    full_paper_file_metadata JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    feedback_translations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_submission_version UNIQUE (submission_id, version_number)
);
COMMENT ON TABLE public.submission_versions IS 'Version history for paper submissions, tracking changes over time.';

-- Add indexes to improve query performance
CREATE INDEX idx_submission_versions_submission_id ON public.submission_versions(submission_id);
CREATE INDEX idx_submission_versions_version_number ON public.submission_versions(version_number);

-- Create RLS policies for the submission_versions table
ALTER TABLE public.submission_versions ENABLE ROW LEVEL SECURITY;

-- The original submission author can read their submission versions
CREATE POLICY submission_versions_select_for_authors ON public.submission_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions s
            WHERE s.id = submission_versions.submission_id
            AND s.submitted_by = auth.uid()
        )
    );

-- The event organizer can read submission versions for their events
CREATE POLICY submission_versions_select_for_organizers ON public.submission_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions s
            JOIN public.events e ON s.event_id = e.id
            WHERE s.id = submission_versions.submission_id
            AND e.created_by = auth.uid()
        )
    );

-- Admins can read all submission versions
CREATE POLICY submission_versions_select_for_admins ON public.submission_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.profile_id = auth.uid()
        )
    );

-- The create policy is handled by trigger functions; no direct creation

-- Add a trigger to automatically increment the version number when a new version is created
CREATE OR REPLACE FUNCTION public.set_submission_version_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the highest version number for this submission and increment it
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.submission_versions
    WHERE submission_id = NEW.submission_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_submission_version_number_trigger
    BEFORE INSERT ON public.submission_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_submission_version_number(); 