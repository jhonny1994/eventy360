-- Create storage bucket for submission files (abstracts and full papers)

-- Insert the bucket for submission files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'submission_files',
    'submission_files',
    false,
    5242880,  -- 5MB size limit (updated from 2MB)
    '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}'
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create policy to allow users to upload their own submission files
-- Path structure: {event_id}/{submission_id}/{file_type}/v{N}/{filename}
CREATE POLICY upload_submission_file_user ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 5 AND -- Ensures correct path depth
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND -- submission_id from path
                  s.submitted_by = auth.uid()
        )
    );

-- Allow users to update their own submission files
CREATE POLICY update_submission_file_user ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 5 AND
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND
                  s.submitted_by = auth.uid()
        )
    );

-- Allow users to read their own submission files
CREATE POLICY read_submission_file_user ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 5 AND
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND
                  s.submitted_by = auth.uid()
        )
    );

-- Allow event organizers to read submission files for their events
CREATE POLICY read_submission_file_organizer ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) >= 1 AND -- event_id is the first part
        EXISTS (
            SELECT 1
            FROM public.events e
            WHERE e.id = (storage.foldername(name))[1]::uuid AND -- event_id from path
                  e.created_by = auth.uid()
        )
    );

-- Allow admins to read all submission files (Unchanged from original, no path dependency for logic)
CREATE POLICY read_submission_file_admin ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        EXISTS (
            SELECT 1 FROM public.admin_profiles ap
            WHERE ap.profile_id = auth.uid()
        )
    );

-- Create an Edge Function for secure submission file uploads and business logic validation
CREATE OR REPLACE FUNCTION storage.handle_submission_file_upload()
RETURNS trigger AS $$
DECLARE
    path_parts text[];
    event_id_from_path_text text;
    submission_id_from_path_text text;
    event_id_from_path uuid;
    submission_id_from_path uuid;
    file_type_from_path text;
    version_str text;
    version_num int;
    
    submission_owner_id uuid;
    db_event_id uuid; -- To store event_id fetched from submission record
    event_details record; -- To store event deadlines and status
    submission_details record; -- To store submission statuses

BEGIN
    -- Path is relative to the bucket, e.g., {event_id}/{submission_id}/{file_type}/v{N}/{filename}
    path_parts := string_to_array(NEW.name, '/');

    -- 1. Validate path structure
    IF array_length(path_parts, 1) != 5 THEN
        RAISE EXCEPTION 'Invalid path format. Expected: {event_id}/{submission_id}/{file_type}/v{N}/{filename}. Received: %', NEW.name;
    END IF;

    -- 2. Parse and validate path components
    event_id_from_path_text := path_parts[1];
    submission_id_from_path_text := path_parts[2];

    BEGIN
        event_id_from_path := event_id_from_path_text::uuid;
        submission_id_from_path := submission_id_from_path_text::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid UUID format for event_id or submission_id in path: %', NEW.name;
    END;

    file_type_from_path := path_parts[3];
    IF file_type_from_path NOT IN ('abstract', 'full_paper') THEN
        RAISE EXCEPTION 'Invalid file_type in path. Must be "abstract" or "full_paper". Path: %', NEW.name;
    END IF;

    version_str := path_parts[4];
    IF NOT version_str LIKE 'v%' THEN
        RAISE EXCEPTION 'Invalid version format. Must start with "v" (e.g., "v1"). Path: %', NEW.name;
    END IF;
    BEGIN
        version_num := substring(version_str from 2)::int;
        IF version_num <= 0 THEN
            RAISE EXCEPTION 'Version number must be a positive integer. Path: %', NEW.name;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid version number format. Path: %', NEW.name;
    END;
    
    -- filename is path_parts[5], no specific validation needed for it here beyond path structure.

    -- 3. Verify submission ownership and get submission/event details
    SELECT 
        s.submitted_by, 
        s.event_id, 
        s.abstract_status, 
        s.full_paper_status,
        e.abstract_submission_deadline, 
        e.full_paper_submission_deadline, 
        e.status AS event_status
    INTO 
        submission_owner_id, 
        db_event_id, 
        submission_details.abstract_status, 
        submission_details.full_paper_status,
        event_details.abstract_submission_deadline, 
        event_details.full_paper_submission_deadline, 
        event_details.event_status
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = submission_id_from_path;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found: %', submission_id_from_path;
    END IF;

    IF submission_owner_id != auth.uid() THEN
        RAISE EXCEPTION 'User % does not own submission %', auth.uid(), submission_id_from_path;
    END IF;
    
    -- Check if event_id from path matches submission's event_id (consistency check)
    IF event_id_from_path != db_event_id THEN
         RAISE EXCEPTION 'Event ID in path (%) does not match submission''s event ID (%).', event_id_from_path_text, db_event_id;
    END IF;

    -- 4. Check event status and deadlines (example logic, adjust statuses as per your system)
    -- This section might need refinement based on the exact values and meaning of 'events.status' 
    -- and 'submissions.abstract_status'/'submissions.full_paper_status' in your application.

    IF file_type_from_path = 'abstract' THEN
        -- Example: Allow abstract upload if event is open for abstracts and deadline not passed
        -- IF event_details.event_status NOT IN ('ABSTRACT_SUBMISSION_OPEN', 'RE_SUBMISSION_OPEN') THEN 
        --     RAISE EXCEPTION 'Event % is not currently open for abstract submissions.', event_id_from_path;
        -- END IF;
        IF now() AT TIME ZONE 'UTC' > event_details.abstract_submission_deadline THEN
            RAISE EXCEPTION 'Abstract submission deadline has passed for event %.', event_id_from_path;
        END IF;
        -- Add checks for submission_details.abstract_status if needed (e.g., allow only if 'PENDING_SUBMISSION', 'REVISIONS_REQUESTED')
        
    ELSIF file_type_from_path = 'full_paper' THEN
        -- Example: Allow full paper upload if abstract was accepted, event open for full papers, and deadline not passed
        IF submission_details.abstract_status != 'ACCEPTED' THEN -- Ensure 'ACCEPTED' is the correct status string
            RAISE EXCEPTION 'Full paper submission is only allowed for accepted abstracts. Submission ID: % has abstract status: %', submission_id_from_path, submission_details.abstract_status;
        END IF;
        -- IF event_details.event_status NOT IN ('FULL_PAPER_SUBMISSION_OPEN', 'RE_SUBMISSION_OPEN') THEN
        --     RAISE EXCEPTION 'Event % is not currently open for full paper submissions.', event_id_from_path;
        -- END IF;
        IF now() AT TIME ZONE 'UTC' > event_details.full_paper_submission_deadline THEN
            RAISE EXCEPTION 'Full paper submission deadline has passed for event %.', event_id_from_path;
        END IF;
        -- Add checks for submission_details.full_paper_status if needed
    END IF;

    -- All checks passed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the objects table (Unchanged)
CREATE TRIGGER check_submission_file_upload_trigger
BEFORE INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'submission_files')
EXECUTE FUNCTION storage.handle_submission_file_upload();