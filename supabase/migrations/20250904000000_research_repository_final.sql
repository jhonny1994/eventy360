-- Migration: Implement Consolidated Feedback System, Research Repository, and Analytics (vFinal)
-- Description: This script establishes the new submission_feedback system, refactors related functions,
--              drops old feedback columns, and implements the research repository with paper analytics.
-- Assumes a new database or that old feedback data does not need to be migrated.
-- ============================================================================
-- SECTION 0: PRELIMINARY - Helper function for FTS (used later by discover_papers)
-- ============================================================================
CREATE
OR REPLACE FUNCTION public.jsonb_values_to_text(data jsonb) RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $$
SELECT
    string_agg(value, ' ')
FROM
    jsonb_each_text(data);
$$;

COMMENT ON FUNCTION public.jsonb_values_to_text(jsonb) IS 'Extracts all text values from a JSONB object and concatenates them with spaces for FTS.';

-- ============================================================================
-- SECTION 1: Submission Feedback System - Table and Core Helpers
-- ============================================================================
-- 1.1. Create the submission_feedback table
CREATE TABLE IF NOT EXISTS public.submission_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_version_id UUID NOT NULL REFERENCES public.submission_versions(id) ON DELETE CASCADE,
    providing_user_id UUID REFERENCES public.profiles(id) ON DELETE
    SET
        NULL,
        role_at_submission public.user_type_enum NOT NULL,
        feedback_content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc' :: text, now()) NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT timezone('utc' :: text, now()) NOT NULL
);

COMMENT ON TABLE public.submission_feedback IS 'Stores feedback for submission versions from reviewers or authors';

COMMENT ON COLUMN public.submission_feedback.submission_version_id IS 'The submission version this feedback is associated with';

COMMENT ON COLUMN public.submission_feedback.providing_user_id IS 'The user who provided the feedback';

COMMENT ON COLUMN public.submission_feedback.role_at_submission IS 'The role of the user when providing feedback (organizer, researcher, admin)';

COMMENT ON COLUMN public.submission_feedback.feedback_content IS 'The actual feedback text content';

-- 1.2. Create indexes for submission_feedback
CREATE INDEX IF NOT EXISTS idx_submission_feedback_submission_version_id ON public.submission_feedback(submission_version_id);

CREATE INDEX IF NOT EXISTS idx_submission_feedback_providing_user_id ON public.submission_feedback(providing_user_id);

-- 1.3. Create trigger for updated_at on submission_feedback
-- Assuming a generic update_timestamp_column() or creating a specific one
CREATE
OR REPLACE FUNCTION public.set_submission_feedback_updated_at() RETURNS TRIGGER AS $$
BEGIN 
NEW.updated_at = timezone('utc' :: text, now());
RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_submission_feedback_updated_at_trigger ON public.submission_feedback;
CREATE TRIGGER set_submission_feedback_updated_at_trigger BEFORE
UPDATE
    ON public.submission_feedback FOR EACH ROW EXECUTE FUNCTION public.set_submission_feedback_updated_at();

-- 1.4. Set up RLS policies for submission_feedback
ALTER TABLE
    public.submission_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submission_feedback_select_for_authors" ON public.submission_feedback;
CREATE POLICY "submission_feedback_select_for_authors" ON public.submission_feedback FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.submission_versions sv
                JOIN public.submissions s ON sv.submission_id = s.id
            WHERE
                sv.id = submission_feedback.submission_version_id
                AND s.submitted_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "submission_feedback_select_for_organizers" ON public.submission_feedback;
CREATE POLICY "submission_feedback_select_for_organizers" ON public.submission_feedback FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.submission_versions sv
                JOIN public.submissions s ON sv.submission_id = s.id
                JOIN public.events e ON s.event_id = e.id
            WHERE
                sv.id = submission_feedback.submission_version_id
                AND e.created_by = auth.uid()
        )
    );

DROP POLICY IF EXISTS "submission_feedback_insert_for_organizers" ON public.submission_feedback;
CREATE POLICY "submission_feedback_insert_for_organizers" ON public.submission_feedback FOR
INSERT
    WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                public.submission_versions sv
                JOIN public.submissions s ON sv.submission_id = s.id
                JOIN public.events e ON s.event_id = e.id
            WHERE
                sv.id = submission_feedback.submission_version_id
                AND e.created_by = auth.uid()
                AND submission_feedback.providing_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "submission_feedback_insert_for_authors" ON public.submission_feedback;
CREATE POLICY "submission_feedback_insert_for_authors" ON public.submission_feedback FOR
INSERT
    WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                public.submission_versions sv
                JOIN public.submissions s ON sv.submission_id = s.id
            WHERE
                sv.id = submission_feedback.submission_version_id
                AND s.submitted_by = auth.uid()
        )
        AND role_at_submission = 'researcher'
        AND submission_feedback.providing_user_id = auth.uid()
    );

DROP POLICY IF EXISTS "submission_feedback_select_for_admins" ON public.submission_feedback;
CREATE POLICY "submission_feedback_select_for_admins" ON public.submission_feedback FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.profiles
            WHERE
                id = auth.uid()
                AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "submission_feedback_all_for_admins" ON public.submission_feedback;
CREATE POLICY "submission_feedback_all_for_admins" ON public.submission_feedback FOR ALL USING (
    EXISTS (
        SELECT
            1
        FROM
            public.profiles
        WHERE
            id = auth.uid()
            AND user_type = 'admin'
    )
) WITH CHECK (
    EXISTS (
        SELECT
            1
        FROM
            public.profiles
        WHERE
            id = auth.uid()
            AND user_type = 'admin'
    )
);

-- ============================================================================
-- Section 1.5: Create helper function to get feedback for a submission version (Updated Name Logic)
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_feedback_for_version(UUID);

CREATE
OR REPLACE FUNCTION public.get_feedback_for_version(p_version_id UUID) RETURNS TABLE (
    id UUID,
    submission_version_id UUID,
    providing_user_id UUID,
    role_at_submission public.user_type_enum,
    feedback_content text,
    created_at timestamptz,
    updated_at timestamptz,
    provider_name text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN 
RETURN QUERY
SELECT
    sf.id,
    sf.submission_version_id,
    sf.providing_user_id,
    sf.role_at_submission,
    sf.feedback_content,
    sf.created_at,
    sf.updated_at,
    CASE
        WHEN sf.role_at_submission = 'researcher' THEN COALESCE(rp.name, 'Unknown Researcher')
        WHEN sf.role_at_submission = 'organizer' THEN COALESCE(
            op.name_translations ->> op.language,
            -- 1. Try organizer's preferred language
            op.name_translations ->> 'ar',
            -- 2. Fallback to Arabic
            'Unknown Organizer'
        )
        WHEN sf.role_at_submission = 'admin' THEN COALESCE(ap.name, 'Unknown Admin')
        ELSE 'Unknown User'
    END AS provider_name
FROM
    public.submission_feedback sf
    LEFT JOIN public.researcher_profiles rp ON sf.providing_user_id = rp.profile_id
    AND sf.role_at_submission = 'researcher'
    LEFT JOIN public.organizer_profiles op ON sf.providing_user_id = op.profile_id
    AND sf.role_at_submission = 'organizer'
    LEFT JOIN public.admin_profiles ap ON sf.providing_user_id = ap.profile_id
    AND sf.role_at_submission = 'admin'
WHERE
    sf.submission_version_id = p_version_id
ORDER BY
    sf.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_feedback_for_version(UUID) IS 'Fetches all feedback for a specific submission version, including a formatted provider name with specific language fallback for organizers.';

-- 1.6. Create a function to handle author notes when submitting revisions
CREATE
OR REPLACE FUNCTION public.add_author_revision_notes(
    p_submission_id UUID,
    p_version_id UUID,
    p_notes TEXT
) RETURNS BOOLEAN AS $$
DECLARE 
v_submission_author UUID;

BEGIN
SELECT
    submitted_by INTO v_submission_author
FROM
    public.submissions
WHERE
    id = p_submission_id;

IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found';
END IF;

IF auth.uid() != v_submission_author THEN RAISE EXCEPTION 'Only the submission author can add revision notes';
END IF;

INSERT INTO
    public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    )
VALUES
    (
        p_version_id,
        auth.uid(),
        'researcher',
        p_notes
    );

RETURN TRUE;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.add_author_revision_notes(UUID, UUID, TEXT) IS 'Allows authors to add their revision notes to the submission_feedback table.';

-- ============================================================================
-- SECTION 2: Update Core Submission and Review SQL Functions
-- ============================================================================
-- 2.1. Drop old versions of review functions that took JSONB feedback
DROP FUNCTION IF EXISTS public.review_abstract(uuid, public.submission_status_enum, jsonb);

DROP FUNCTION IF EXISTS public.review_full_paper(uuid, public.submission_status_enum, jsonb);

-- 2.2. Update review_abstract function
CREATE
OR REPLACE FUNCTION "public"."review_abstract"(
    "p_submission_id" "uuid",
    "p_status" "public"."submission_status_enum",
    "p_feedback" "text"
) RETURNS boolean LANGUAGE "plpgsql" SECURITY DEFINER AS $$
DECLARE 
v_event_organizer UUID;
v_current_status public.submission_status_enum;
v_version_id UUID;

BEGIN
SELECT
    e.created_by,
    s.abstract_status,
    s.current_abstract_version_id INTO v_event_organizer,
    v_current_status,
    v_version_id
FROM
    public.submissions s
    JOIN public.events e ON s.event_id = e.id
WHERE
    s.id = p_submission_id;

IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found';
END IF;

IF auth.uid() != v_event_organizer THEN RAISE EXCEPTION 'Only the event organizer can review abstracts';
END IF;

IF v_current_status != 'abstract_submitted' THEN RAISE EXCEPTION 'Abstract is not in a reviewable state';
END IF;

IF p_status NOT IN ('abstract_accepted', 'abstract_rejected') THEN RAISE EXCEPTION 'Invalid status for abstract review';
END IF;

UPDATE
    public.submissions
SET
    abstract_status = p_status,
    status = p_status,
    review_date = NOW()
WHERE
    id = p_submission_id;

IF p_feedback IS NOT NULL
AND p_feedback != '' THEN
INSERT INTO
    public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    )
VALUES
    (
        v_version_id,
        auth.uid(),
        COALESCE(
            (
                SELECT
                    user_type
                FROM
                    public.profiles
                WHERE
                    id = auth.uid()
            ),
            'organizer'
        ),
        p_feedback
    );
END IF;

-- Notification is handled by the notify_submission_status_change trigger
RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.review_abstract(UUID, public.submission_status_enum, TEXT) IS 'Organizer reviews an abstract, updates status, and stores TEXT feedback in submission_feedback. Notification handled by trigger.';

-- 2.3. Update review_full_paper function
CREATE
OR REPLACE FUNCTION "public"."review_full_paper"(
    "p_submission_id" "uuid",
    "p_status" "public"."submission_status_enum",
    "p_feedback" "text"
) RETURNS boolean LANGUAGE "plpgsql" SECURITY DEFINER AS $$
DECLARE 
v_event_organizer UUID;
v_current_status public.submission_status_enum;
v_version_id UUID;

BEGIN
SELECT
    e.created_by,
    s.full_paper_status,
    s.current_full_paper_version_id INTO v_event_organizer,
    v_current_status,
    v_version_id
FROM
    public.submissions s
    JOIN public.events e ON s.event_id = e.id
WHERE
    s.id = p_submission_id;

IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found';
END IF;

IF auth.uid() != v_event_organizer THEN RAISE EXCEPTION 'Only the event organizer can review papers';
END IF;

IF v_current_status NOT IN (
    'full_paper_submitted',
    'revision_requested',
    'revision_under_review'
) THEN RAISE EXCEPTION 'Paper is not in a reviewable state';
END IF;

IF p_status NOT IN (
    'full_paper_accepted',
    'full_paper_rejected',
    'revision_requested'
) THEN RAISE EXCEPTION 'Invalid status for full paper review';
END IF;

UPDATE
    public.submissions
SET
    full_paper_status = p_status,
    status = p_status,
    review_date = NOW()
WHERE
    id = p_submission_id;

IF p_feedback IS NOT NULL
AND p_feedback != '' THEN
INSERT INTO
    public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    )
VALUES
    (
        v_version_id,
        auth.uid(),
        COALESCE(
            (
                SELECT
                    user_type
                FROM
                    public.profiles
                WHERE
                    id = auth.uid()
            ),
            'organizer'
        ),
        p_feedback
    );
END IF;

-- Notification is handled by the notify_submission_status_change trigger
RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.review_full_paper(UUID, public.submission_status_enum, TEXT) IS 'Organizer reviews a full paper, updates status, and stores TEXT feedback in submission_feedback. Notification handled by trigger.';

-- 2.4. Update track_submission_versions trigger function
CREATE
OR REPLACE FUNCTION public.track_submission_versions() RETURNS TRIGGER AS $$
BEGIN 
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
) THEN
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
$$
LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.track_submission_versions() IS 'Tracks changes to submissions by creating new version records, excluding feedback fields.';

-- 2.5. Update submit_revision function
-- Drop potentially existing older versions first to ensure correct signature
DROP FUNCTION IF EXISTS public.submit_revision(UUID, TEXT, JSONB);

CREATE
OR REPLACE FUNCTION public.submit_revision(
    p_submission_id UUID,
    p_full_paper_file_url TEXT,
    p_full_paper_file_metadata JSONB,
    p_revision_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE 
v_event_id UUID;
-- Unused, can be removed
v_submission_status public.submission_status_enum;
v_abstract_version_id UUID;
v_version_number INT;
v_version_id UUID;
v_event_deadline TIMESTAMP WITH TIME ZONE;

BEGIN
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

IF v_submission_status != 'revision_requested' THEN RAISE EXCEPTION 'Cannot submit revision: revision was not requested';
END IF;

IF v_event_deadline IS NOT NULL
AND v_event_deadline < NOW() THEN RAISE EXCEPTION 'Revision deadline has passed';
END IF;

SELECT
    COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
FROM
    public.submission_versions
WHERE
    submission_id = p_submission_id;

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
)
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
    av.title_translations,
    av.abstract_translations,
    av.abstract_file_url,
    av.abstract_file_metadata,
    p_full_paper_file_url,
    p_full_paper_file_metadata
FROM
    abstract_version av RETURNING id INTO v_version_id;

UPDATE
    public.submissions
SET
    full_paper_file_url = p_full_paper_file_url,
    full_paper_file_metadata = p_full_paper_file_metadata,
    current_full_paper_version_id = v_version_id,
    status = 'revision_under_review',
    -- Use the new enum value
    full_paper_status = 'revision_under_review' -- Use the new enum value
WHERE
    id = p_submission_id;

IF p_revision_notes IS NOT NULL
AND p_revision_notes != '' THEN PERFORM public.add_author_revision_notes(p_submission_id, v_version_id, p_revision_notes);
END IF;

RETURN v_version_id;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.submit_revision(UUID, TEXT, JSONB, TEXT) TO authenticated;

COMMENT ON FUNCTION public.submit_revision(UUID, TEXT, JSONB, TEXT) IS 'Allows researchers to submit a revised paper. Creates a new version and stores author notes in submission_feedback.';

-- ============================================================================
-- SECTION 3: Notification System Adjustments for Feedback
-- ============================================================================
-- 3.1. Update notify_submission_status_change trigger function
-- This function is triggered AFTER UPDATE ON submissions
-- It will pick up TEXT feedback from submission_feedback and format it for the email
CREATE
OR REPLACE FUNCTION public.notify_submission_status_change() RETURNS TRIGGER AS $$
DECLARE 
v_current_version_id UUID;
v_feedback TEXT;
v_template_key TEXT;
v_event_name_translations JSONB;

BEGIN 
IF OLD.status IS DISTINCT
FROM
    NEW.status THEN v_template_key := CASE
        NEW.status
        WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
        WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
        WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
        WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
        WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
        WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
        WHEN 'revision_requested' THEN 'revision_requested_notification' -- Add handling for revision_under_review if a notification is needed for authors here
        -- WHEN 'revision_under_review' THEN 'revision_received_confirmation_to_author' -- Example
        WHEN 'completed' THEN CASE
            OLD.status
            WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification' -- Or a different "final" template
            WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification' -- Or a different "final" template
            ELSE NULL
        END
        ELSE NULL
    END;

IF v_template_key IS NOT NULL THEN v_current_version_id := CASE
    WHEN NEW.status IN (
        'abstract_accepted',
        'abstract_rejected',
        'abstract_submitted'
    ) THEN NEW.current_abstract_version_id
    WHEN NEW.status IN (
        'full_paper_accepted',
        'full_paper_rejected',
        'full_paper_submitted',
        'revision_requested',
        'revision_under_review'
    ) THEN NEW.current_full_paper_version_id
    ELSE NULL -- Should ideally not happen if template_key is determined
END;

IF v_current_version_id IS NOT NULL THEN
SELECT
    feedback_content INTO v_feedback
FROM
    public.submission_feedback
WHERE
    submission_version_id = v_current_version_id
    AND role_at_submission = 'organizer' -- Only include organizer's feedback in these status change notifications
ORDER BY
    created_at DESC
LIMIT
    1;
END IF;

SELECT
    event_name_translations INTO v_event_name_translations
FROM
    public.events
WHERE
    id = NEW.event_id;

INSERT INTO
    public.notification_queue (
        recipient_profile_id,
        template_key,
        payload_data,
        status,
        process_after,
        notification_type
    )
VALUES
    (
        NEW.submitted_by,
        v_template_key,
        jsonb_build_object(
            'submission_id',
            NEW.id,
            'event_id',
            NEW.event_id,
            'event_name',
            v_event_name_translations,
            'submission_title',
            NEW.title_translations,
            'feedback',
            CASE
                WHEN v_feedback IS NOT NULL THEN jsonb_build_object('content', v_feedback)
                ELSE NULL
            END
        ),
        'pending',
        NOW(),
        'immediate' -- Most submission status changes are immediate
    );
END IF;
END IF;

RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.notify_submission_status_change() IS 'Trigger function to send notifications on submission status changes, fetching feedback from submission_feedback table.';

-- 3.2. Define handle_submission_feedback (if used for other programmatic notifications)
-- This version takes TEXT feedback, assumes it's for the author, and calls a generic dispatcher.
-- Its use by review_abstract/review_full_paper is removed as notify_submission_status_change handles it.
DROP FUNCTION IF EXISTS public.handle_submission_feedback(uuid, jsonb, text);

-- Drop old signature
DROP FUNCTION IF EXISTS public.handle_submission_feedback(uuid, text);

-- Drop other old signature
CREATE
OR REPLACE FUNCTION public.handle_submission_feedback(
    p_submission_id UUID,
    p_feedback_content TEXT,
    p_decision_status VARCHAR -- e.g., 'abstract_accepted', 'revision_requested'
) RETURNS VOID AS $$
-- This function is now for scenarios where a notification needs to be sent programmatically,
-- outside the standard review status update triggers.
-- It assumes manage_submission_notification can derive template_key and other details
-- from submission_id and decision_status.
BEGIN 
PERFORM manage_submission_notification(
    -- This function needs to be defined or be an existing dispatcher
    p_submission_id,
    p_decision_status,
    CASE
        WHEN p_feedback_content IS NOT NULL
        AND p_feedback_content != '' THEN jsonb_build_object('content', p_feedback_content)
        ELSE NULL -- No feedback key if content is null/empty
    END
);
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_submission_feedback(UUID, TEXT, VARCHAR) IS 'Helper to queue submission-related notifications programmatically, preparing feedback payload.';

-- ============================================================================
-- SECTION 4: Research Repository Discovery and Analytics (from previous script)
-- ============================================================================
-- (Content of your "Research Repository and Paper Analytics (vFinal)" script from Section 1 to 4,
--  starting from CREATE OR REPLACE FUNCTION "public"."discover_papers"...)
--  ... includes discover_papers, paper_analytics table, track_paper_activity,
--  analytics getter functions, and indexes for paper_analytics.
--  NO NEED TO PASTE IT AGAIN HERE, assume it's part of this consolidated file.
--  For brevity, I'm omitting the re-paste.
-- ============================================================================
-- SECTION 5: Drop Old Feedback Columns (This should be the VERY LAST STEP)
-- ============================================================================
-- Ensure this runs only after all application code and SQL functions are updated
-- to use submission_feedback and no longer reference these columns.
ALTER TABLE
    public.submission_versions DROP COLUMN IF EXISTS feedback_translations;

COMMENT ON TEXT 'Dropped submission_versions.feedback_translations column.';

ALTER TABLE
    public.submissions DROP COLUMN IF EXISTS review_feedback_translations;

COMMENT ON TEXT 'Dropped submissions.review_feedback_translations column.';

ALTER TABLE
    public.submissions DROP COLUMN IF EXISTS feedback_history;

COMMENT ON TEXT 'Dropped submissions.feedback_history column.';

-- End of Migration