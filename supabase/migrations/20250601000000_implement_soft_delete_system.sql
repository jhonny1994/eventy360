-- Implement soft delete system for events and submissions
-- This system allows recovery of accidentally deleted items within a 7-day grace period

-- Add deleted_at timestamp to events table
ALTER TABLE public.events
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at timestamp to submissions table
ALTER TABLE public.submissions
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes for better query performance on soft-deleted items
CREATE INDEX idx_events_deleted_at ON public.events(deleted_at);
CREATE INDEX idx_submissions_deleted_at ON public.submissions(deleted_at);

-- Update all existing RLS policies for events to exclude soft-deleted items
-- First, identify and save existing policies to re-create them with soft delete filters

-- Create soft delete helper functions
CREATE OR REPLACE FUNCTION public.soft_delete_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_event_exists BOOLEAN;
    v_is_owner BOOLEAN;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if the event exists and not already soft-deleted
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = p_event_id AND deleted_at IS NULL
    ) INTO v_event_exists;
    
    IF NOT v_event_exists THEN
        RAISE EXCEPTION 'Event not found or already deleted';
    END IF;
    
    -- Check if the user is the owner or an admin
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = p_event_id AND created_by = auth.uid()
    ) INTO v_is_owner;
    
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to delete this event';
    END IF;
    
    -- Perform soft delete
    UPDATE public.events 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = p_event_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_event_exists BOOLEAN;
    v_is_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_grace_period_expired BOOLEAN;
BEGIN
    -- Check if the event exists and is soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND deleted_at IS NOT NULL),
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND created_by = auth.uid()),
        EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'),
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND deleted_at < NOW() - INTERVAL '7 days')
    INTO 
        v_event_exists, v_is_owner, v_is_admin, v_grace_period_expired;
    
    IF NOT v_event_exists THEN
        RAISE EXCEPTION 'Event not found or not deleted';
    END IF;
    
    IF NOT (v_is_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to restore this event';
    END IF;
    
    IF v_grace_period_expired AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Grace period expired, only admin can restore';
    END IF;
    
    -- Perform restore
    UPDATE public.events 
    SET 
        deleted_at = NULL,
        updated_at = NOW()
    WHERE 
        id = p_event_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.soft_delete_submission(p_submission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_submission_exists BOOLEAN;
    v_is_author BOOLEAN;
    v_is_event_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_event_id UUID;
BEGIN
    -- Check if the submission exists and not already soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at IS NULL),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND submitted_by = auth.uid()),
        event_id
    INTO 
        v_submission_exists, v_is_author, v_event_id
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF NOT v_submission_exists THEN
        RAISE EXCEPTION 'Submission not found or already deleted';
    END IF;
    
    -- Check if the user is the event owner
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = v_event_id AND created_by = auth.uid()
    ) INTO v_is_event_owner;
    
    -- Check if the user is an admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_author OR v_is_event_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to delete this submission';
    END IF;
    
    -- Perform soft delete
    UPDATE public.submissions 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = p_submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_submission(p_submission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_submission_exists BOOLEAN;
    v_is_author BOOLEAN;
    v_is_event_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_grace_period_expired BOOLEAN;
    v_event_id UUID;
BEGIN
    -- Check if the submission exists and is soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at IS NOT NULL),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND submitted_by = auth.uid()),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at < NOW() - INTERVAL '7 days'),
        event_id
    INTO 
        v_submission_exists, v_is_author, v_grace_period_expired, v_event_id
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF NOT v_submission_exists THEN
        RAISE EXCEPTION 'Submission not found or not deleted';
    END IF;
    
    -- Check if the user is the event owner
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = v_event_id AND created_by = auth.uid()
    ) INTO v_is_event_owner;
    
    -- Check if the user is an admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_author OR v_is_event_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to restore this submission';
    END IF;
    
    IF v_grace_period_expired AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Grace period expired, only admin can restore';
    END IF;
    
    -- Perform restore
    UPDATE public.submissions 
    SET 
        deleted_at = NULL,
        updated_at = NOW()
    WHERE 
        id = p_submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to permanently delete items after grace period
CREATE OR REPLACE FUNCTION public.purge_expired_deletions()
RETURNS VOID AS $$
BEGIN
    -- Permanently delete events older than 7 days
    DELETE FROM public.events
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    
    -- Permanently delete submissions older than 7 days
    DELETE FROM public.submissions
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies for events and submissions to exclude soft-deleted items

-- First, update the basic select policies for events
DROP POLICY IF EXISTS events_select_for_authenticated ON public.events;
CREATE POLICY events_select_for_authenticated ON public.events
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- Policy for owner/admin access to deleted events (for restoration purposes)
CREATE POLICY events_select_deleted_for_owner_admin ON public.events
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND 
        (
            created_by = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    );

-- Update basic select policies for submissions
DROP POLICY IF EXISTS submissions_select_for_owner ON public.submissions;
CREATE POLICY submissions_select_for_owner ON public.submissions
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL AND
        (
            submitted_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.events
                WHERE id = submissions.event_id AND created_by = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    );

-- Policy for owner/admin access to deleted submissions
CREATE POLICY submissions_select_deleted_for_owner_admin ON public.submissions
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND 
        (
            submitted_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.events
                WHERE id = submissions.event_id AND created_by = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    );

-- Update functions that query events or submissions to exclude soft-deleted items
-- First, update event listing functions (if they exist)

-- The function to get public events should exclude soft-deleted events
CREATE OR REPLACE FUNCTION public.get_public_events(
    p_limit integer DEFAULT 10,
    p_offset integer DEFAULT 0
)
RETURNS SETOF public.events AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.events
    WHERE 
        status = 'published' AND
        deleted_at IS NULL
    ORDER BY event_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Similarly, update submission-related functions to exclude soft-deleted submissions

-- The function to get event submission stats should exclude soft-deleted submissions
CREATE OR REPLACE FUNCTION public.get_event_submission_stats(event_id UUID)
RETURNS TABLE (
    total_submissions INTEGER,
    abstract_submitted INTEGER,
    abstract_accepted INTEGER,
    abstract_rejected INTEGER,
    full_paper_submitted INTEGER,
    full_paper_accepted INTEGER,
    full_paper_rejected INTEGER,
    revision_requested INTEGER,
    completed INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'abstract_submitted')::INTEGER AS abstract_submitted,
        COUNT(*) FILTER (WHERE status = 'abstract_accepted')::INTEGER AS abstract_accepted,
        COUNT(*) FILTER (WHERE status = 'abstract_rejected')::INTEGER AS abstract_rejected,
        COUNT(*) FILTER (WHERE status = 'full_paper_submitted')::INTEGER AS full_paper_submitted,
        COUNT(*) FILTER (WHERE status = 'full_paper_accepted')::INTEGER AS full_paper_accepted,
        COUNT(*) FILTER (WHERE status = 'full_paper_rejected')::INTEGER AS full_paper_rejected,
        COUNT(*) FILTER (WHERE status = 'revision_requested')::INTEGER AS revision_requested,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed
    FROM
        public.submissions
    WHERE
        submissions.event_id = $1 AND
        deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 