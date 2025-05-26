-- Migration to create functions for submission status transitions
-- These functions handle the academic submission workflow transitions
-- with proper validation and authorization

-- Function to submit an abstract
CREATE OR REPLACE FUNCTION public.submit_abstract(
    p_event_id UUID,
    p_title_translations JSONB,
    p_abstract_translations JSONB,
    p_abstract_file_url TEXT,
    p_abstract_file_metadata JSONB
) RETURNS UUID AS $$
DECLARE
    v_event_status public.event_status_enum;
    v_submission_id UUID;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the event exists and get its status
    SELECT status, abstract_submission_deadline INTO v_event_status, v_event_deadline
    FROM public.events
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Check if the event is accepting abstract submissions
    IF v_event_status != 'published' THEN
        RAISE EXCEPTION 'Event is not accepting abstract submissions';
    END IF;
    
    -- Check if the deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Abstract submission deadline has passed';
    END IF;
    
    -- Create a new submission
    INSERT INTO public.submissions (
        event_id,
        submitted_by,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        status,
        abstract_status
    ) VALUES (
        p_event_id,
        auth.uid(),
        p_title_translations,
        p_abstract_translations,
        p_abstract_file_url,
        p_abstract_file_metadata,
        'abstract_submitted',
        'abstract_submitted'
    ) RETURNING id INTO v_submission_id;
    
    -- Create the first version record
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata
    ) VALUES (
        v_submission_id,
        1,
        p_title_translations,
        p_abstract_translations,
        p_abstract_file_url,
        p_abstract_file_metadata
    ) RETURNING id INTO v_version_id;
    
    -- Update the submission with the current version ID
    UPDATE public.submissions
    SET current_abstract_version_id = v_version_id
    WHERE id = v_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'abstract_submitted',
        'action', 'submit_abstract',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = v_submission_id;
    
    RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to review an abstract (accept or reject)
CREATE OR REPLACE FUNCTION public.review_abstract(
    p_submission_id UUID,
    p_status public.submission_status_enum,
    p_feedback_translations JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
    v_version_id UUID;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.abstract_status, s.current_abstract_version_id
    INTO v_event_id, v_event_organizer, v_current_status, v_version_id
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can review abstracts';
    END IF;
    
    -- Check if the current status allows for review
    IF v_current_status != 'abstract_submitted' THEN
        RAISE EXCEPTION 'Abstract is not in a reviewable state';
    END IF;
    
    -- Check if the new status is valid for abstract review
    IF p_status NOT IN ('abstract_accepted', 'abstract_rejected') THEN
        RAISE EXCEPTION 'Invalid status for abstract review';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET 
        abstract_status = p_status,
        status = p_status,
        review_feedback_translations = p_feedback_translations
    WHERE id = p_submission_id;
    
    -- Update the version record with feedback
    UPDATE public.submission_versions
    SET feedback_translations = p_feedback_translations
    WHERE id = v_version_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', p_status,
        'action', 'review_abstract',
        'actor', auth.uid(),
        'feedback', p_feedback_translations,
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a full paper
CREATE OR REPLACE FUNCTION public.submit_full_paper(
    p_submission_id UUID,
    p_full_paper_file_url TEXT,
    p_full_paper_file_metadata JSONB
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_event_status public.event_status_enum;
    v_submission_status public.submission_status_enum;
    v_abstract_version_id UUID;
    v_version_number INT;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT 
        s.event_id, 
        e.status, 
        s.abstract_status,
        s.current_abstract_version_id,
        e.full_paper_submission_deadline
    INTO 
        v_event_id, 
        v_event_status, 
        v_submission_status,
        v_abstract_version_id,
        v_event_deadline
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id AND s.submitted_by = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or you are not the author';
    END IF;
    
    -- Check if the event is accepting full papers
    IF v_event_status != 'full_paper_submission_open' THEN
        RAISE EXCEPTION 'Event is not accepting full papers';
    END IF;
    
    -- Check if the abstract was accepted
    IF v_submission_status != 'abstract_accepted' THEN
        RAISE EXCEPTION 'Cannot submit full paper: abstract was not accepted';
    END IF;
    
    -- Check if the deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Full paper submission deadline has passed';
    END IF;
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.submission_versions
    WHERE submission_id = p_submission_id;
    
    -- Get the abstract details from the current abstract version
    WITH abstract_version AS (
        SELECT 
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata
        FROM public.submission_versions
        WHERE id = v_abstract_version_id
    )
    
    -- Create a new version record with both abstract and full paper
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        full_paper_file_url,
        full_paper_file_metadata
    )
    SELECT
        p_submission_id,
        v_version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        p_full_paper_file_url,
        p_full_paper_file_metadata
    FROM abstract_version
    RETURNING id INTO v_version_id;
    
    -- Update the submission with the full paper and current version
    UPDATE public.submissions
    SET 
        full_paper_file_url = p_full_paper_file_url,
        full_paper_file_metadata = p_full_paper_file_metadata,
        current_full_paper_version_id = v_version_id,
        status = 'full_paper_submitted',
        full_paper_status = 'full_paper_submitted'
    WHERE id = p_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'full_paper_submitted',
        'action', 'submit_full_paper',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to review a full paper (accept, reject, or request revision)
CREATE OR REPLACE FUNCTION public.review_full_paper(
    p_submission_id UUID,
    p_status public.submission_status_enum,
    p_feedback_translations JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
    v_version_id UUID;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.full_paper_status, s.current_full_paper_version_id
    INTO v_event_id, v_event_organizer, v_current_status, v_version_id
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can review papers';
    END IF;
    
    -- Check if the current status allows for review
    IF v_current_status NOT IN ('full_paper_submitted', 'revision_requested') THEN
        RAISE EXCEPTION 'Paper is not in a reviewable state';
    END IF;
    
    -- Check if the new status is valid for full paper review
    IF p_status NOT IN ('full_paper_accepted', 'full_paper_rejected', 'revision_requested') THEN
        RAISE EXCEPTION 'Invalid status for full paper review';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET 
        full_paper_status = p_status,
        status = p_status,
        review_feedback_translations = p_feedback_translations
    WHERE id = p_submission_id;
    
    -- Update the version record with feedback
    UPDATE public.submission_versions
    SET feedback_translations = p_feedback_translations
    WHERE id = v_version_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', p_status,
        'action', 'review_full_paper',
        'actor', auth.uid(),
        'feedback', p_feedback_translations,
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a revised paper
CREATE OR REPLACE FUNCTION public.submit_revision(
    p_submission_id UUID,
    p_full_paper_file_url TEXT,
    p_full_paper_file_metadata JSONB
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_submission_status public.submission_status_enum;
    v_abstract_version_id UUID;
    v_version_number INT;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT 
        s.event_id, 
        s.full_paper_status,
        s.current_abstract_version_id,
        e.revision_deadline
    INTO 
        v_event_id, 
        v_submission_status,
        v_abstract_version_id,
        v_event_deadline
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id AND s.submitted_by = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or you are not the author';
    END IF;
    
    -- Check if revision was requested
    IF v_submission_status != 'revision_requested' THEN
        RAISE EXCEPTION 'Cannot submit revision: revision was not requested';
    END IF;
    
    -- Check if the revision deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Revision deadline has passed';
    END IF;
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.submission_versions
    WHERE submission_id = p_submission_id;
    
    -- Get the abstract details from the current abstract version
    WITH abstract_version AS (
        SELECT 
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata
        FROM public.submission_versions
        WHERE id = v_abstract_version_id
    )
    
    -- Create a new version record with both abstract and revised full paper
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        full_paper_file_url,
        full_paper_file_metadata
    )
    SELECT
        p_submission_id,
        v_version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        p_full_paper_file_url,
        p_full_paper_file_metadata
    FROM abstract_version
    RETURNING id INTO v_version_id;
    
    -- Update the submission with the revised paper and current version
    UPDATE public.submissions
    SET 
        full_paper_file_url = p_full_paper_file_url,
        full_paper_file_metadata = p_full_paper_file_metadata,
        current_full_paper_version_id = v_version_id,
        status = 'revision_under_review',
        full_paper_status = 'revision_under_review'
    WHERE id = p_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'revision_under_review',
        'action', 'submit_revision',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a submission as completed
CREATE OR REPLACE FUNCTION public.complete_submission(
    p_submission_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.status
    INTO v_event_id, v_event_organizer, v_current_status
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can complete submissions';
    END IF;
    
    -- Check if the current status allows for completion
    IF v_current_status NOT IN ('full_paper_accepted', 'full_paper_rejected', 'abstract_rejected') THEN
        RAISE EXCEPTION 'Submission cannot be completed from its current state';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET status = 'completed'
    WHERE id = p_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'completed',
        'action', 'complete_submission',
        'actor', auth.uid()
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for the functions

-- Policy for submit_abstract
GRANT EXECUTE ON FUNCTION public.submit_abstract TO authenticated;

-- Policy for review_abstract
GRANT EXECUTE ON FUNCTION public.review_abstract TO authenticated;

-- Policy for submit_full_paper
GRANT EXECUTE ON FUNCTION public.submit_full_paper TO authenticated;

-- Policy for review_full_paper
GRANT EXECUTE ON FUNCTION public.review_full_paper TO authenticated;

-- Policy for submit_revision
GRANT EXECUTE ON FUNCTION public.submit_revision TO authenticated;

-- Policy for complete_submission
GRANT EXECUTE ON FUNCTION public.complete_submission TO authenticated;

-- Add comments to explain the functions
COMMENT ON FUNCTION public.submit_abstract IS 'Function for researchers to submit an abstract to an event. Creates a new submission and version record.';  
COMMENT ON FUNCTION public.review_abstract IS 'Function for event organizers to review an abstract (accept or reject) with feedback.';  
COMMENT ON FUNCTION public.submit_full_paper IS 'Function for researchers to submit a full paper for an accepted abstract. Creates a new version record.';  
COMMENT ON FUNCTION public.review_full_paper IS 'Function for event organizers to review a full paper (accept, reject, or request revision) with feedback.';  
COMMENT ON FUNCTION public.submit_revision IS 'Function for researchers to submit a revised paper after revision was requested. Creates a new version record.';  
COMMENT ON FUNCTION public.complete_submission IS 'Function for event organizers to mark a submission as completed after final acceptance or rejection.';