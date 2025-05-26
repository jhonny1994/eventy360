-- Create functions to manage submission lifecycle and versioning

-- Function to save the current version of a submission when it's updated
CREATE OR REPLACE FUNCTION public.track_submission_versions()
RETURNS TRIGGER AS $$
BEGIN
    -- Only save a version if relevant fields change
    IF TG_OP = 'UPDATE' AND (
        OLD.title_translations IS DISTINCT FROM NEW.title_translations OR
        OLD.abstract_translations IS DISTINCT FROM NEW.abstract_translations OR
        OLD.abstract_file_url IS DISTINCT FROM NEW.abstract_file_url OR
        OLD.abstract_file_metadata IS DISTINCT FROM NEW.abstract_file_metadata OR
        OLD.full_paper_file_url IS DISTINCT FROM NEW.full_paper_file_url OR
        OLD.full_paper_file_metadata IS DISTINCT FROM NEW.full_paper_file_metadata OR
        OLD.status IS DISTINCT FROM NEW.status
    ) THEN
        -- Insert a new version record
        INSERT INTO public.submission_versions (
            submission_id,
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata,
            full_paper_file_url,
            full_paper_file_metadata,
            feedback_translations
        ) VALUES (
            OLD.id,
            OLD.title_translations,
            OLD.abstract_translations,
            OLD.abstract_file_url,
            OLD.abstract_file_metadata,
            OLD.full_paper_file_url,
            OLD.full_paper_file_metadata,
            OLD.review_feedback_translations
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track submission versions
CREATE TRIGGER track_submission_versions_trigger
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.track_submission_versions();

-- Function to check if a submission can be made to an event based on its status
CREATE OR REPLACE FUNCTION public.check_event_submission_allowed()
RETURNS TRIGGER AS $$
DECLARE
    event_status public.event_status_enum;
BEGIN
    -- Get the current status of the event
    SELECT status INTO event_status
    FROM public.events
    WHERE id = NEW.event_id;
    
    -- For new abstract submissions, only allow if event is in 'published' status
    IF TG_OP = 'INSERT' AND NEW.status = 'abstract_submitted' THEN
        IF event_status != 'published' THEN
            RAISE EXCEPTION 'Cannot submit abstract: event is not accepting submissions';
        END IF;
    END IF;
    
    -- For full paper submissions, only allow if event status is 'full_paper_submission_open'
    -- and the abstract was previously accepted
    IF TG_OP = 'UPDATE' AND 
       NEW.status = 'full_paper_submitted' AND 
       OLD.status = 'abstract_accepted' THEN
        IF event_status != 'full_paper_submission_open' THEN
            RAISE EXCEPTION 'Cannot submit full paper: event is not accepting full papers';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to check submission allowance
CREATE TRIGGER check_event_submission_allowed_trigger
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.check_event_submission_allowed();

-- Function to notify researchers when their submission status changes
CREATE OR REPLACE FUNCTION public.notify_submission_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if the status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Create a notification based on the new status
        INSERT INTO public.notification_queue (
            recipient_profile_id,
            template_key,
            payload_data,
            status,
            process_after
        )
        SELECT
            NEW.submitted_by,
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
                WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
                WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
                WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
                WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                WHEN 'revision_requested' THEN 'revision_requested_notification'
                WHEN 'completed' THEN 
                    CASE 
                        WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                        WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                        ELSE NULL
                    END
                ELSE NULL
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'event_id', NEW.event_id,
                'event_name', (SELECT event_name_translations FROM public.events WHERE id = NEW.event_id),
                'submission_title', NEW.title_translations,
                'feedback', NEW.review_feedback_translations
            ),
            'pending',
            NOW()
        WHERE
            -- Only proceed if we have a valid template for this status
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
                WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
                WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
                WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
                WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                WHEN 'revision_requested' THEN 'revision_requested_notification'
                WHEN 'completed' THEN 
                    CASE 
                        WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                        WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                        ELSE NULL
                    END
                ELSE NULL
            END IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to notify on submission status changes
CREATE TRIGGER notify_submission_status_change_trigger
AFTER UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_submission_status_change();

-- Function to notify organizers when new submissions are received
CREATE OR REPLACE FUNCTION public.notify_organizer_new_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if the status is relevant and has changed
    IF (NEW.status IN ('abstract_submitted', 'full_paper_submitted')) AND 
       (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Get the event organizer and notify them of the new submission
        INSERT INTO public.notification_queue (
            recipient_profile_id,
            template_key,
            payload_data,
            status,
            process_after
        )
        SELECT
            e.created_by,
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'new_abstract_submission'
                WHEN 'full_paper_submitted' THEN 'new_full_paper_submission'
                ELSE NULL
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'event_id', NEW.event_id,
                'event_name', e.event_name_translations,
                'submission_title', NEW.title_translations,
                'researcher_name', (
                    SELECT name 
                    FROM public.researcher_profiles 
                    WHERE profile_id = NEW.submitted_by
                )
            ),
            'pending',
            NOW()
        FROM 
            public.events e
        WHERE 
            e.id = NEW.event_id AND
            -- Only proceed if we have a valid template for this status
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'new_abstract_submission'
                WHEN 'full_paper_submitted' THEN 'new_full_paper_submission'
                ELSE NULL
            END IS NOT NULL;
    END IF;
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to notify organizers of new submissions
CREATE TRIGGER notify_organizer_new_submission_trigger
AFTER INSERT OR UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_organizer_new_submission();

-- Function to get submission statistics for an event
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
        event_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 