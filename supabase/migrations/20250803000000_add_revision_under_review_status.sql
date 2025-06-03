-- Add 'revision_under_review' to submission_status_enum
-- This migration adds a new status to handle when a revision has been submitted and is under review

-- Alter the enum to add the new value
ALTER TYPE public.submission_status_enum ADD VALUE 'revision_under_review' AFTER 'revision_requested';

-- Update the comment to include the new status
COMMENT ON TYPE public.submission_status_enum IS 'Lifecycle states for academic submissions: abstract_submitted (under review), abstract_accepted, abstract_rejected, full_paper_submitted (under review), full_paper_accepted, full_paper_rejected, revision_requested, revision_under_review, completed'; 