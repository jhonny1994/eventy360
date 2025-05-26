-- Replace submission_status_enum with academic submission lifecycle states
-- Since there's no submission data yet, we can simply drop and recreate the enum

-- Drop the existing type and recreate it with the required values
DROP TYPE IF EXISTS public.submission_status_enum CASCADE;
CREATE TYPE public.submission_status_enum AS ENUM (
    'abstract_submitted',      -- Abstract has been submitted and is under review
    'abstract_accepted',       -- Abstract has been accepted, awaiting full paper
    'abstract_rejected',       -- Abstract was rejected
    'full_paper_submitted',    -- Full paper has been submitted and is under review
    'full_paper_accepted',     -- Full paper has been accepted
    'full_paper_rejected',     -- Full paper was rejected
    'revision_requested',      -- Revisions have been requested for the full paper
    'completed'                -- Submission process has been completed (accepted or rejected)
);

-- Add comment to explain the enum values
COMMENT ON TYPE public.submission_status_enum IS 'Lifecycle states for academic submissions: abstract_submitted (under review), abstract_accepted, abstract_rejected, full_paper_submitted (under review), full_paper_accepted, full_paper_rejected, revision_requested, completed';

-- Since this is a clean database setup with no submission data yet, we don't need to migrate data 