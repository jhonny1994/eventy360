-- Replace event_status_enum with academic event lifecycle states
-- Since there's no event data yet, we can simply drop and recreate the enum

-- Drop the existing type and recreate it with the required values
DROP TYPE IF EXISTS public.event_status_enum CASCADE;
CREATE TYPE public.event_status_enum AS ENUM (
    'published',                -- Visible to researchers and accepting abstract submissions
    'abstract_review',          -- Abstracts under review, no new submissions accepted
    'full_paper_submission_open', -- Accepting full papers for accepted abstracts
    'full_paper_review',        -- Full papers under review, no new submissions accepted
    'completed',                -- Event is finished, all submissions processed
    'canceled'                  -- Event has been canceled
);

-- Add comment to explain the enum values
COMMENT ON TYPE public.event_status_enum IS 'Lifecycle states for events: published (visible and accepting abstract submissions), abstract_review (abstracts under review), full_paper_submission_open (accepting full papers), full_paper_review (full papers under review), completed (event finished), canceled (event canceled)';

-- Since this is a clean database setup with no events yet, we don't need to migrate data
