-- Create functions to automate event status transitions based on deadlines

-- Function to automatically update event status based on current date and deadlines
CREATE OR REPLACE FUNCTION public.update_event_status_based_on_date()
RETURNS VOID AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Check for events that should transition to abstract_review status
    -- (current time has passed the submission_deadline)
    UPDATE public.events
    SET 
        status = 'abstract_review',
        updated_at = NOW()
    WHERE 
        status = 'published' AND
        submission_deadline < NOW();
    
    -- Check for events that should transition to full_paper_submission_open status
    -- (current time has passed the submission_verdict_deadline)
    UPDATE public.events
    SET 
        status = 'full_paper_submission_open',
        updated_at = NOW()
    WHERE 
        status = 'abstract_review' AND
        submission_verdict_deadline < NOW();
    
    -- Check for events that should transition to full_paper_review status
    -- (current time has passed the full_paper_deadline)
    UPDATE public.events
    SET 
        status = 'full_paper_review',
        updated_at = NOW()
    WHERE 
        status = 'full_paper_submission_open' AND
        full_paper_deadline < NOW();
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run the function every hour
SELECT cron.schedule(
    'update_event_status_hourly',
    '0 * * * *', -- Run at minute 0 of every hour
    'SELECT public.update_event_status_based_on_date();'
);

-- Function to update event status when deadlines are changed
CREATE OR REPLACE FUNCTION public.handle_event_deadline_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if relevant deadline fields were updated
    IF OLD.submission_deadline != NEW.submission_deadline OR 
       OLD.submission_verdict_deadline != NEW.submission_verdict_deadline OR
       OLD.full_paper_deadline != NEW.full_paper_deadline OR
       OLD.event_end_date != NEW.event_end_date THEN
        
        -- Call the function to update status based on the new dates
        PERFORM public.update_event_status_based_on_date();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run when event deadlines are updated
CREATE TRIGGER event_deadline_changes_trigger
AFTER UPDATE ON public.events
FOR EACH ROW
WHEN (
    OLD.submission_deadline IS DISTINCT FROM NEW.submission_deadline OR
    OLD.submission_verdict_deadline IS DISTINCT FROM NEW.submission_verdict_deadline OR
    OLD.full_paper_deadline IS DISTINCT FROM NEW.full_paper_deadline OR
    OLD.event_end_date IS DISTINCT FROM NEW.event_end_date
)
EXECUTE FUNCTION public.handle_event_deadline_changes();

-- Function to create notifications for deadline approaching events
CREATE OR REPLACE FUNCTION public.create_deadline_notifications()
RETURNS VOID AS $$
DECLARE
    event_record RECORD;
    researcher_record RECORD;
    submission_record RECORD;
BEGIN
    -- Find events with submission deadline approaching (3 days away)
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.submission_deadline
        FROM public.events e
        WHERE 
            e.status = 'published' AND
            e.submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
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
                    'deadline', event_record.submission_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;

    -- Find events with full paper deadline approaching (3 days away) and notify researchers with accepted abstracts
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.full_paper_deadline
        FROM public.events e
        WHERE 
            e.status = 'full_paper_submission_open' AND
            e.full_paper_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
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
                    'deadline', event_record.full_paper_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run the notification function once a day
SELECT cron.schedule(
    'create_deadline_notifications_daily',
    '0 9 * * *', -- Run at 9:00 AM every day
    'SELECT public.create_deadline_notifications();'
); 