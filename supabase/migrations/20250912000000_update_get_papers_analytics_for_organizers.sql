-- Migration: Update get_papers_analytics function to allow organizers to view analytics
-- Description: This script modifies the get_papers_analytics function to allow organizers
-- to view analytics for papers from events they've created, in addition to their own papers.

-- Drop the existing function
DROP FUNCTION IF EXISTS "public"."get_papers_analytics"("uuid"[]);

-- Re-create the get_papers_analytics function with organizer access
CREATE OR REPLACE FUNCTION "public"."get_papers_analytics"("p_submission_ids" "uuid"[]) 
RETURNS TABLE(
    "submission_id" "uuid",
    "view_count" bigint,
    "download_count" bigint
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid;
    v_user_type text;
BEGIN
    -- Ensure the user is authenticated
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Get the user's type
    SELECT user_type INTO v_user_type FROM profiles WHERE id = v_user_id;

    -- Check if the user is an admin, the author of these papers, or an organizer who created the events
    IF v_user_type = 'admin' THEN
        -- Admins can see all papers
        NULL;
    ELSIF v_user_type = 'organizer' THEN
        -- For organizers, filter to include papers from events they created
        p_submission_ids := ARRAY(
            SELECT s.id 
            FROM submissions s
            JOIN events e ON s.event_id = e.id
            WHERE s.id = ANY(p_submission_ids) 
            AND (s.submitted_by = v_user_id OR e.created_by = v_user_id)
        );
    ELSE
        -- For researchers, filter to only include their own papers
        p_submission_ids := ARRAY(
            SELECT id FROM submissions 
            WHERE id = ANY(p_submission_ids) 
            AND submitted_by = v_user_id
        );
    END IF;

    -- Handle case where p_submission_ids is empty after filtering
    IF p_submission_ids IS NULL OR array_length(p_submission_ids, 1) IS NULL THEN
        -- Return empty result set with correct structure
        RETURN QUERY SELECT NULL::uuid, 0::bigint, 0::bigint WHERE false;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        s.id AS submission_id,
        COALESCE((SELECT COUNT(*) FROM paper_analytics pa 
                 WHERE pa.submission_id = s.id AND pa.action_type = 'view'), 0) AS view_count,
        COALESCE((SELECT COUNT(*) FROM paper_analytics pa 
                 WHERE pa.submission_id = s.id AND pa.action_type = 'download'), 0) AS download_count
    FROM unnest(p_submission_ids) AS s(id)
    WHERE s.id IS NOT NULL;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_papers_analytics"("p_submission_ids" "uuid"[]) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."get_papers_analytics"("p_submission_ids" "uuid"[]) IS 'Returns analytics data (view and download counts) for multiple papers, allowing organizers to view analytics for papers from events they created'; 