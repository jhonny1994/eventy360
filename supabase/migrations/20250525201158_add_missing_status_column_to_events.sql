-- Add missing status column to events table
-- This column was defined in the original schema but appears to be missing from the actual database

-- Add the status column with a default value
ALTER TABLE public.events 
ADD COLUMN status public.event_status_enum NOT NULL DEFAULT 'published';

-- Update any existing events to have a proper status based on their dates
-- Events that have already ended should be marked as completed
UPDATE public.events 
SET status = 'completed' 
WHERE event_end_date < NOW() AND status = 'published';

-- Events with submission deadlines that have passed but event hasn't started should be in review
UPDATE public.events 
SET status = 'abstract_review' 
WHERE submission_deadline < NOW() 
  AND event_date > NOW() 
  AND status = 'published';

-- Add index for better query performance on status filtering
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- Add comment explaining the column
COMMENT ON COLUMN public.events.status IS 'Current lifecycle status of the event (published, abstract_review, full_paper_submission_open, full_paper_review, completed, canceled)';