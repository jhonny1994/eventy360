-- Add new academic event deadline fields to the events table
ALTER TABLE public.events
ADD COLUMN abstract_submission_deadline TIMESTAMPTZ,
ADD COLUMN abstract_review_result_date TIMESTAMPTZ,
ADD COLUMN full_paper_submission_deadline TIMESTAMPTZ,
ADD COLUMN revision_deadline TIMESTAMPTZ;

-- Add/Update constraints to ensure logical date sequence for academic events
-- Remove existing constraint if it conflicts or needs to be more comprehensive
-- It's safer to drop and recreate if the logic is significantly changing.
-- Assuming a generic constraint name like 'events_date_sequence_check', replace if different.
-- You might need to inspect existing constraints first. For now, we'll assume we are adding new ones
-- or that existing ones are not comprehensive enough.

ALTER TABLE public.events
ADD CONSTRAINT check_event_date_after_submission_verdict
CHECK (event_date >= submission_verdict_deadline),

ADD CONSTRAINT check_submission_verdict_after_full_paper
CHECK (submission_verdict_deadline >= full_paper_submission_deadline),

ADD CONSTRAINT check_full_paper_after_abstract_review
CHECK (full_paper_submission_deadline >= abstract_review_result_date),

ADD CONSTRAINT check_abstract_review_after_abstract_submission
CHECK (abstract_review_result_date >= abstract_submission_deadline);

-- Constraint for optional revision_deadline
-- Revision deadline, if set, must be between full paper submission and submission verdict.
ALTER TABLE public.events
ADD CONSTRAINT check_revision_deadline_sequence
CHECK (
    (revision_deadline IS NULL) OR
    (
        revision_deadline IS NOT NULL AND
        revision_deadline >= full_paper_submission_deadline AND
        revision_deadline <= submission_verdict_deadline
    )
);

COMMENT ON COLUMN public.events.abstract_submission_deadline IS 'Deadline for researchers to submit abstracts.';
COMMENT ON COLUMN public.events.abstract_review_result_date IS 'Date when abstract review results are announced.';
COMMENT ON COLUMN public.events.full_paper_submission_deadline IS 'Deadline for researchers with accepted abstracts to submit full papers.';
COMMENT ON COLUMN public.events.revision_deadline IS 'Optional deadline for submitting revised papers if requested.';
