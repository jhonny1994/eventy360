-- Migration to fix the handle_submission_file_upload function
-- The issue is that the record variable "submission_details" is not properly initialized before its fields are used

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS check_submission_file_upload_trigger ON storage.objects;

-- Then recreate the function with fixes
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
    abstract_status text; -- Store abstract status directly
    full_paper_status text; -- Store full paper status directly
    abstract_deadline timestamptz; -- Store deadlines directly
    full_paper_deadline timestamptz;
    event_status text;
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
    -- Changed to store values in individual variables instead of record fields
    SELECT 
        s.submitted_by, 
        s.event_id, 
        s.abstract_status, 
        s.full_paper_status,
        e.abstract_submission_deadline, 
        e.full_paper_submission_deadline, 
        e.status
    INTO 
        submission_owner_id, 
        db_event_id, 
        abstract_status, 
        full_paper_status,
        abstract_deadline, 
        full_paper_deadline, 
        event_status
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

    -- 4. Check event status and deadlines
    IF file_type_from_path = 'abstract' THEN
        IF now() AT TIME ZONE 'UTC' > abstract_deadline THEN
            RAISE EXCEPTION 'Abstract submission deadline has passed for event %.', event_id_from_path;
        END IF;
        
    ELSIF file_type_from_path = 'full_paper' THEN
        IF abstract_status != 'abstract_accepted' THEN
            RAISE EXCEPTION 'Full paper submission is only allowed for accepted abstracts. Submission ID: % has abstract status: %', submission_id_from_path, abstract_status;
        END IF;
        
        IF now() AT TIME ZONE 'UTC' > full_paper_deadline THEN
            RAISE EXCEPTION 'Full paper submission deadline has passed for event %.', event_id_from_path;
        END IF;
    END IF;

    -- All checks passed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach the trigger to the objects table
CREATE TRIGGER check_submission_file_upload_trigger
BEFORE INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'submission_files')
EXECUTE FUNCTION storage.handle_submission_file_upload();