-- Migration: Simplify event date fields to keep only the 6 required fields
-- Keep: event_date, event_end_date, abstract_submission_deadline, abstract_review_result_date, full_paper_submission_deadline, submission_verdict_deadline
-- Remove: submission_deadline, full_paper_deadline, revision_deadline

-- Step 1: Drop constraints that reference columns to be removed
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS check_submission_deadline;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS check_revision_deadline_sequence;

-- Step 2: Drop the trigger that references columns to be removed
DROP TRIGGER IF EXISTS event_deadline_changes_trigger ON public.events;

-- Step 3: Drop the columns that are no longer needed
ALTER TABLE public.events DROP COLUMN IF EXISTS submission_deadline;
ALTER TABLE public.events DROP COLUMN IF EXISTS full_paper_deadline;
ALTER TABLE public.events DROP COLUMN IF EXISTS revision_deadline;

-- Step 4: Update function create_deadline_notifications to use the new standardized column names
CREATE OR REPLACE FUNCTION "public"."create_deadline_notifications"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    event_record RECORD;
    researcher_record RECORD;
    submission_record RECORD;
BEGIN
    -- Find events with abstract submission deadline approaching (3 days away)
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.abstract_submission_deadline
        FROM public.events e
        WHERE 
            e.status = 'published' AND
            e.abstract_submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    LOOP
        -- Create notifications for researchers with matching topics
        FOR researcher_record IN
            SELECT DISTINCT p.id
            FROM public.profiles p
            JOIN public.researcher_profiles rp ON p.id = rp.profile_id
            JOIN public.researcher_topic_subscriptions rts ON p.id = rts.profile_id
            JOIN public.event_topics et ON rts.topic_id = et.topic_id
            WHERE et.event_id = event_record.id
        LOOP
            -- Insert notification for abstract submission deadline
            INSERT INTO public.notification_queue (
                recipient_profile_id,
                template_key,
                payload_data,
                status,
                process_after
            ) VALUES (
                researcher_record.id,
                'abstract_deadline_approaching',
                jsonb_build_object(
                    'event_id', event_record.id,
                    'event_name', event_record.event_name_translations,
                    'deadline', event_record.abstract_submission_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;

    -- Find events with full paper deadline approaching (3 days away) and notify researchers with accepted abstracts
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.full_paper_submission_deadline
        FROM public.events e
        WHERE 
            e.status = 'full_paper_submission_open' AND
            e.full_paper_submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    LOOP
        -- Find researchers with accepted abstracts
        FOR submission_record IN
            SELECT s.id, s.submitted_by
            FROM public.submissions s
            WHERE 
                s.event_id = event_record.id AND
                s.status = 'abstract_accepted'
        LOOP
            -- Insert notification for full paper submission deadline
            INSERT INTO public.notification_queue (
                recipient_profile_id,
                template_key,
                payload_data,
                status,
                process_after
            ) VALUES (
                submission_record.submitted_by,
                'full_paper_deadline_approaching',
                jsonb_build_object(
                    'event_id', event_record.id,
                    'event_name', event_record.event_name_translations,
                    'submission_id', submission_record.id,
                    'deadline', event_record.full_paper_submission_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;
END;
$$;

-- Step 5: Update function update_event_status_based_on_date to use the new standardized column names
CREATE OR REPLACE FUNCTION "public"."update_event_status_based_on_date"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Check for events that should transition to abstract_review status
    -- (current time has passed the abstract_submission_deadline)
    UPDATE public.events
    SET 
        status = 'abstract_review',
        updated_at = NOW()
    WHERE 
        status = 'published' AND
        abstract_submission_deadline < NOW();

    -- Check for events that should transition to full_paper_submission_open status
    -- (current time has passed the abstract_review_result_date)
    UPDATE public.events
    SET 
        status = 'full_paper_submission_open',
        updated_at = NOW()
    WHERE 
        status = 'abstract_review' AND
        abstract_review_result_date < NOW();

    -- Check for events that should transition to full_paper_review status
    -- (current time has passed the full_paper_submission_deadline)
    UPDATE public.events
    SET 
        status = 'full_paper_review',
        updated_at = NOW()
    WHERE 
        status = 'full_paper_submission_open' AND
        full_paper_submission_deadline < NOW();

    -- Check for events that should transition to completed status
    -- (current time has passed the event_end_date)
    UPDATE public.events
    SET 
        status = 'completed',
        updated_at = NOW()
    WHERE 
        status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review') AND
        event_end_date < NOW();
END;
$$;

-- Step 6: Update the handle_event_deadline_changes function to check the remaining date fields
CREATE OR REPLACE FUNCTION "public"."handle_event_deadline_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only proceed if relevant deadline fields were updated
    IF OLD.abstract_submission_deadline IS DISTINCT FROM NEW.abstract_submission_deadline OR 
       OLD.abstract_review_result_date IS DISTINCT FROM NEW.abstract_review_result_date OR
       OLD.full_paper_submission_deadline IS DISTINCT FROM NEW.full_paper_submission_deadline OR
       OLD.submission_verdict_deadline IS DISTINCT FROM NEW.submission_verdict_deadline OR
       OLD.event_date IS DISTINCT FROM NEW.event_date OR
       OLD.event_end_date IS DISTINCT FROM NEW.event_end_date THEN
        -- Call the function to update status based on the new dates
        PERFORM public.update_event_status_based_on_date();
    END IF;
    RETURN NEW;
END;
$$;

-- Step 7: Recreate the trigger with updated conditions for the remaining date fields
CREATE OR REPLACE TRIGGER "event_deadline_changes_trigger" 
    AFTER UPDATE ON "public"."events" 
    FOR EACH ROW 
    WHEN (
        (OLD.abstract_submission_deadline IS DISTINCT FROM NEW.abstract_submission_deadline) OR 
        (OLD.abstract_review_result_date IS DISTINCT FROM NEW.abstract_review_result_date) OR
        (OLD.full_paper_submission_deadline IS DISTINCT FROM NEW.full_paper_submission_deadline) OR
        (OLD.submission_verdict_deadline IS DISTINCT FROM NEW.submission_verdict_deadline) OR
        (OLD.event_date IS DISTINCT FROM NEW.event_date) OR
        (OLD.event_end_date IS DISTINCT FROM NEW.event_end_date)
    ) 
    EXECUTE FUNCTION "public"."handle_event_deadline_changes"();

-- Step 8: Update any functions that had conflicting versions
-- The submit_full_paper function should consistently use full_paper_submission_deadline
CREATE OR REPLACE FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;
