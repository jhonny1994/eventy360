-- Add composite indexes to improve query performance for verification requests
-- These indexes optimize the common query patterns used in the admin interface

-- Make sure the gin extension is available for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite index for common filtering patterns with status
CREATE INDEX IF NOT EXISTS idx_verification_requests_status_submitted_at 
ON public.verification_requests(status, submitted_at DESC);

-- Composite index for pagination queries with ordering
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at_status
ON public.verification_requests(submitted_at DESC, status);

-- Add index on user_id since it's frequently used for joins
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id
ON public.verification_requests(user_id);

-- Add text search index on researcher_profiles.name for name searching
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_name_trgm
ON public.researcher_profiles USING gin(name gin_trgm_ops);

-- Add text search index on organizer_profiles.name_translations for searches
-- Using Arabic 'ar' as the primary language for searching
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_name_trgm
ON public.organizer_profiles USING gin((name_translations->>'ar') gin_trgm_ops); 