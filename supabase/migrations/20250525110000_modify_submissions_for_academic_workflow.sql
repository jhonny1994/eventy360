-- Migration to modify the submissions table for academic workflow

-- Add new columns to the submissions table
ALTER TABLE public.submissions
ADD COLUMN current_abstract_version_id UUID NULL,
ADD COLUMN current_full_paper_version_id UUID NULL,
ADD COLUMN abstract_status public.submission_status_enum NULL,
ADD COLUMN full_paper_status public.submission_status_enum NULL,
ADD COLUMN feedback_history JSONB NULL;

-- Add comments to the new columns
COMMENT ON COLUMN public.submissions.current_abstract_version_id IS 'References the current active version of the abstract in submission_versions.';
COMMENT ON COLUMN public.submissions.current_full_paper_version_id IS 'References the current active version of the full paper in submission_versions.';
COMMENT ON COLUMN public.submissions.abstract_status IS 'Current status of the abstract submission phase.';
COMMENT ON COLUMN public.submissions.full_paper_status IS 'Current status of the full paper submission phase.';
COMMENT ON COLUMN public.submissions.feedback_history IS 'A JSONB array storing the history of feedback and status changes for the submission.';

-- Add foreign key constraints
ALTER TABLE public.submissions
ADD CONSTRAINT fk_current_abstract_version
  FOREIGN KEY (current_abstract_version_id)
  REFERENCES public.submission_versions(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT fk_current_full_paper_version
  FOREIGN KEY (current_full_paper_version_id)
  REFERENCES public.submission_versions(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_current_abstract_version_id ON public.submissions(current_abstract_version_id);
CREATE INDEX IF NOT EXISTS idx_submissions_current_full_paper_version_id ON public.submissions(current_full_paper_version_id);
CREATE INDEX IF NOT EXISTS idx_submissions_abstract_status ON public.submissions(abstract_status);
CREATE INDEX IF NOT EXISTS idx_submissions_full_paper_status ON public.submissions(full_paper_status);

-- Note: Consider if existing fields like 'review_feedback_translations' or file URLs on the submissions table
-- need to be altered or deprecated in a future step, as version-specific data is now in submission_versions.
-- For this migration, we are focusing on adding the new required fields.
