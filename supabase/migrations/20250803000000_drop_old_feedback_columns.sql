-- Migration: Drop old feedback columns
-- This migration removes the old JSONB columns now that we've migrated to the submission_feedback table

-- Drop the feedback_translations column from submission_versions
ALTER TABLE public.submission_versions DROP COLUMN IF EXISTS feedback_translations;

-- Drop the review_feedback_translations column from submissions
ALTER TABLE public.submissions DROP COLUMN IF EXISTS review_feedback_translations;

-- Drop the feedback_history column from submissions as well
ALTER TABLE public.submissions DROP COLUMN IF EXISTS feedback_history; 