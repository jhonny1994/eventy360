-- Add status column to submissions table to fix the error: "record 'new' has no field 'status'"
-- This column will be kept in sync with abstract_status and full_paper_status using triggers

-- First, add the status column
ALTER TABLE public.submissions 
ADD COLUMN status public.submission_status_enum;

-- Create a function to keep the status column in sync with the appropriate specific status column
CREATE OR REPLACE FUNCTION public.sync_submission_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Always set a consistent status based on the workflow stage
    -- For new rows or updates
    
    -- First handle full paper status if it exists (higher priority)
    IF NEW.full_paper_status IS NOT NULL THEN
        NEW.status = NEW.full_paper_status;
    -- Then fall back to abstract status
    ELSIF NEW.abstract_status IS NOT NULL THEN
        NEW.status = NEW.abstract_status;
    END IF;
    
    -- If somehow both are NULL, status will be NULL too
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically keep the status field in sync
CREATE TRIGGER sync_submission_status_trigger
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.sync_submission_status();

-- Add a comment explaining the purpose of the status column
COMMENT ON COLUMN public.submissions.status IS 'Combined status that reflects either abstract_status or full_paper_status based on the current state of the submission.';