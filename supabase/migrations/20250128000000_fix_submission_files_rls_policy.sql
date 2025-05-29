-- Fix RLS policy for submission file uploads
-- The issue was that the policy was checking for 5 folder levels when there are only 4
-- Path structure: {event_id}/{submission_id}/{file_type}/v{N}/{filename}
-- storage.foldername() returns ['event_id', 'submission_id', 'file_type', 'v{N}'] - length 4

-- Drop the existing policies
DROP POLICY IF EXISTS upload_submission_file_user ON storage.objects;
DROP POLICY IF EXISTS update_submission_file_user ON storage.objects;
DROP POLICY IF EXISTS read_submission_file_user ON storage.objects;

-- Recreate the upload policy with correct path length check
CREATE POLICY upload_submission_file_user ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 4 AND -- Correct path depth: 4 folders + 1 filename = 5 parts total
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND -- submission_id from path
                  s.submitted_by = auth.uid()
        )
    );

-- Recreate the update policy with correct path length check
CREATE POLICY update_submission_file_user ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 4 AND
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND
                  s.submitted_by = auth.uid()
        )
    );

-- Recreate the read policy with correct path length check
CREATE POLICY read_submission_file_user ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'submission_files' AND
        array_length(storage.foldername(name), 1) = 4 AND
        EXISTS (
            SELECT 1
            FROM public.submissions s
            WHERE s.id = (storage.foldername(name))[2]::uuid AND
                  s.submitted_by = auth.uid()
        )
    );
