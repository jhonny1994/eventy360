CREATE TABLE public.submission_feedback (
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

COMMENT ON COLUMN public.submission_feedback.role_at_submission IS 'The role of the user when providing feedback (organizer, researcher)';

COMMENT ON COLUMN public.submission_feedback.feedback_content IS 'The actual feedback text content';

CREATE INDEX idx_submission_feedback_submission_version_id ON public.submission_feedback(submission_version_id);

CREATE INDEX idx_submission_feedback_providing_user_id ON public.submission_feedback(providing_user_id);

CREATE
OR REPLACE FUNCTION public.set_submission_feedback_updated_at() RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE TRIGGER set_submission_feedback_updated_at_trigger BEFORE
UPDATE
    ON public.submission_feedback FOR EACH ROW EXECUTE FUNCTION public.set_submission_feedback_updated_at();

ALTER TABLE
    public.submission_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY submission_feedback_select_for_authors ON public.submission_feedback FOR
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

CREATE POLICY submission_feedback_select_for_organizers ON public.submission_feedback FOR
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

CREATE POLICY submission_feedback_insert_for_organizers ON public.submission_feedback FOR
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
        )
    );

CREATE POLICY submission_feedback_insert_for_authors ON public.submission_feedback FOR
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
    );

CREATE POLICY submission_feedback_select_for_admins ON public.submission_feedback FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.admin_profiles ap
            WHERE
                ap.profile_id = auth.uid()
        )
    );

CREATE
OR REPLACE FUNCTION public.review_abstract(
    p_submission_id UUID,
    p_status public.submission_status_enum,
    p_feedback TEXT
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
        review_date = NOW()
    WHERE id = p_submission_id;
    
    -- Insert into the new submission_feedback table
    INSERT INTO public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    ) VALUES (
        v_version_id,
        auth.uid(),
        'organizer',
        p_feedback
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE
OR REPLACE FUNCTION public.review_full_paper(
    p_submission_id UUID,
    p_status public.submission_status_enum,
    p_feedback TEXT
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
        review_date = NOW()
    WHERE id = p_submission_id;
    
    -- Insert into the new submission_feedback table
    INSERT INTO public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    ) VALUES (
        v_version_id,
        auth.uid(),
        'organizer',
        p_feedback
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE
OR REPLACE FUNCTION public.get_feedback_for_version(p_version_id UUID) RETURNS TABLE (
    id UUID,
    providing_user_id UUID,
    role_at_submission public.user_type_enum,
    feedback_content TEXT,
    created_at TIMESTAMPTZ,
    provider_name TEXT
) AS $$
DECLARE
    -- No local variables needed
BEGIN 
    RETURN QUERY
    SELECT
        sf.id,
        sf.providing_user_id,
        sf.role_at_submission,
        sf.feedback_content,
        sf.created_at,
        CASE
            WHEN sf.role_at_submission = 'researcher' THEN COALESCE(rp.name, 'Unknown Researcher')
            WHEN sf.role_at_submission = 'organizer' THEN 
                -- First try to use the user's preferred language
                COALESCE(
                    op.name_translations ->> op.language,
                    -- Then try to find any non-null translation
                    (SELECT value FROM jsonb_each_text(op.name_translations) WHERE value IS NOT NULL LIMIT 1),
                    'Unknown Organizer'
                )
            ELSE 'Unknown'
        END AS provider_name
    FROM
        public.submission_feedback sf
        LEFT JOIN public.researcher_profiles rp ON sf.providing_user_id = rp.profile_id
        AND sf.role_at_submission = 'researcher'
        LEFT JOIN public.organizer_profiles op ON sf.providing_user_id = op.profile_id
        AND sf.role_at_submission = 'organizer'
    WHERE
        sf.submission_version_id = p_version_id
    ORDER BY
        sf.created_at DESC;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

CREATE
OR REPLACE FUNCTION public.add_author_revision_notes(
    p_submission_id UUID,
    p_version_id UUID,
    p_notes TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_submission_author UUID;
BEGIN
    -- Check if the submission exists and the user is the author
    SELECT submitted_by INTO v_submission_author
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    IF auth.uid() != v_submission_author THEN
        RAISE EXCEPTION 'Only the submission author can add revision notes';
    END IF;
    
    -- Insert the notes into the submission_feedback table
    INSERT INTO public.submission_feedback (
        submission_version_id,
        providing_user_id,
        role_at_submission,
        feedback_content
    ) VALUES (
        p_version_id,
        auth.uid(),
        'researcher',
        p_notes
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_submission_feedback(p_submission_id UUID, p_feedback_content TEXT) RETURNS VOID AS $$
BEGIN 
    -- Queue an email task to notify the author about the feedback
    PERFORM public.queue_email_task(
        'submission_feedback',
        jsonb_build_object(
            'submission_id', p_submission_id,
            'feedback', jsonb_build_object('content', p_feedback_content)
        )
    );
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;