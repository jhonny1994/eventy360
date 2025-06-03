-- Migration: Update submission functions to remove feedback translations
-- This migration updates functions to use the new submission_feedback table
-- 1. Update track_submission_versions to not copy feedback_translations
CREATE
OR REPLACE FUNCTION public.track_submission_versions() RETURNS TRIGGER AS $ $ BEGIN -- Only save a version if relevant fields change
IF TG_OP = 'UPDATE'
AND (
    OLD.title_translations IS DISTINCT
    FROM
        NEW.title_translations
        OR OLD.abstract_translations IS DISTINCT
    FROM
        NEW.abstract_translations
        OR OLD.abstract_file_url IS DISTINCT
    FROM
        NEW.abstract_file_url
        OR OLD.abstract_file_metadata IS DISTINCT
    FROM
        NEW.abstract_file_metadata
        OR OLD.full_paper_file_url IS DISTINCT
    FROM
        NEW.full_paper_file_url
        OR OLD.full_paper_file_metadata IS DISTINCT
    FROM
        NEW.full_paper_file_metadata
        OR OLD.status IS DISTINCT
    FROM
        NEW.status
) THEN -- Insert a new version record - removed feedback_translations
INSERT INTO
    public.submission_versions (
        submission_id,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        full_paper_file_url,
        full_paper_file_metadata
    )
VALUES
    (
        OLD.id,
        OLD.title_translations,
        OLD.abstract_translations,
        OLD.abstract_file_url,
        OLD.abstract_file_metadata,
        OLD.full_paper_file_url,
        OLD.full_paper_file_metadata
    );

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update submit_revision to use add_author_revision_notes
-- First drop the existing function to avoid ambiguity
DROP FUNCTION IF EXISTS public.submit_revision(UUID, TEXT, JSONB);

CREATE
OR REPLACE FUNCTION public.submit_revision(
    p_submission_id UUID,
    p_full_paper_file_url TEXT,
    p_full_paper_file_metadata JSONB,
    p_revision_notes TEXT DEFAULT NULL
) RETURNS UUID AS $ $ DECLARE v_event_id UUID;

v_submission_status public.submission_status_enum;

v_abstract_version_id UUID;

v_version_number INT;

v_version_id UUID;

v_event_deadline TIMESTAMP WITH TIME ZONE;

BEGIN -- Check if the submission exists and get its current status
SELECT
    s.event_id,
    s.full_paper_status,
    s.current_abstract_version_id,
    e.revision_deadline INTO v_event_id,
    v_submission_status,
    v_abstract_version_id,
    v_event_deadline
FROM
    public.submissions s
    JOIN public.events e ON s.event_id = e.id
WHERE
    s.id = p_submission_id
    AND s.submitted_by = auth.uid();

IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found or you are not the author';

END IF;

-- Check if revision was requested
IF v_submission_status != 'revision_requested' THEN RAISE EXCEPTION 'Cannot submit revision: revision was not requested';

END IF;

-- Check if the revision deadline has passed
IF v_event_deadline IS NOT NULL
AND v_event_deadline < NOW() THEN RAISE EXCEPTION 'Revision deadline has passed';

END IF;

-- Get the next version number
SELECT
    COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
FROM
    public.submission_versions
WHERE
    submission_id = p_submission_id;

-- Get the abstract details from the current abstract version
WITH abstract_version AS (
    SELECT
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata
    FROM
        public.submission_versions
    WHERE
        id = v_abstract_version_id
) -- Create a new version record with both abstract and revised full paper
INSERT INTO
    public.submission_versions (
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
FROM
    abstract_version RETURNING id INTO v_version_id;

-- Update the submission with the revised paper and current version
UPDATE
    public.submissions
SET
    full_paper_file_url = p_full_paper_file_url,
    full_paper_file_metadata = p_full_paper_file_metadata,
    current_full_paper_version_id = v_version_id,
    status = 'revision_under_review',
    full_paper_status = 'revision_under_review'
WHERE
    id = p_submission_id;

-- Add revision notes if provided using the new add_author_revision_notes function
IF p_revision_notes IS NOT NULL
AND p_revision_notes != '' THEN PERFORM add_author_revision_notes(
    p_submission_id,
    v_version_id,
    p_revision_notes
);

END IF;

RETURN v_version_id;

END;

$ $ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update notify_submission_status_change to use get_feedback_for_version
CREATE
OR REPLACE FUNCTION public.notify_submission_status_change() RETURNS TRIGGER AS $ $ DECLARE v_current_version_id UUID;

v_feedback TEXT;

BEGIN -- Only notify if the status actually changed
IF OLD.status IS DISTINCT
FROM
    NEW.status THEN -- Get the appropriate current version ID
    v_current_version_id := CASE
        WHEN NEW.status IN (
            'abstract_accepted',
            'abstract_rejected',
            'abstract_submitted'
        ) THEN NEW.current_abstract_version_id
        ELSE NEW.current_full_paper_version_id
    END;

-- Get the latest feedback if there is any
SELECT
    feedback_content INTO v_feedback
FROM
    public.submission_feedback
WHERE
    submission_version_id = v_current_version_id
    AND role_at_submission = 'organizer'
ORDER BY
    created_at DESC
LIMIT
    1;

-- Create a notification based on the new status
INSERT INTO
    public.notification_queue (
        recipient_profile_id,
        template_key,
        payload_data,
        status,
        process_after
    )
SELECT
    NEW.submitted_by,
    CASE
        NEW.status
        WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
        WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
        WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
        WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
        WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
        WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
        WHEN 'revision_requested' THEN 'revision_requested_notification'
        WHEN 'completed' THEN CASE
            WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
            WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
            ELSE NULL
        END
        ELSE NULL
    END,
    jsonb_build_object(
        'submission_id',
        NEW.id,
        'event_id',
        NEW.event_id,
        'event_name',
        (
            SELECT
                event_name_translations
            FROM
                public.events
            WHERE
                id = NEW.event_id
        ),
        'submission_title',
        NEW.title_translations,
        'feedback',
        jsonb_build_object('content', v_feedback)
    ),
    'pending',
    NOW()
WHERE
    -- Only proceed if we have a valid template for this status
    CASE
        NEW.status
        WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
        WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
        WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
        WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
        WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
        WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
        WHEN 'revision_requested' THEN 'revision_requested_notification'
        WHEN 'completed' THEN CASE
            WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
            WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
            ELSE NULL
        END
        ELSE NULL
    END IS NOT NULL;

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql SECURITY DEFINER;

-- Update grants to reflect parameter changes
GRANT EXECUTE ON FUNCTION public.submit_revision TO authenticated;

-- Add comments to explain the functions
COMMENT ON FUNCTION public.submit_revision IS 'Function for researchers to submit a revised paper after revision was requested. Creates a new version record and optionally adds revision notes.';