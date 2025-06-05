-- Migration to fix column references

-- Fix the get_papers_analytics function to qualify ambiguous column references
CREATE OR REPLACE FUNCTION "public"."get_papers_analytics"("p_submission_ids" "uuid"[]) 
RETURNS TABLE(
    "submission_id" "uuid",
    "view_count" bigint,
    "download_count" bigint
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
BEGIN
    -- Ensure the user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check if the user is an admin or the author of these papers
    IF NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    ) THEN
        -- For non-admins, filter to only include their own papers
        p_submission_ids := ARRAY(
            SELECT id FROM submissions 
            WHERE id = ANY(p_submission_ids) 
            AND submitted_by = auth.uid()
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
COMMENT ON FUNCTION "public"."get_papers_analytics" IS 'Returns analytics data (view and download counts) for multiple papers';

-- Create a helper function to get the appropriate wilaya name based on locale
CREATE OR REPLACE FUNCTION "public"."get_wilaya_name"("p_wilaya_id" integer, "p_locale" text DEFAULT 'en') 
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
    IF p_locale = 'ar' THEN
        RETURN (SELECT name_ar FROM wilayas WHERE id = p_wilaya_id);
    ELSE
        RETURN (SELECT name_other FROM wilayas WHERE id = p_wilaya_id);
    END IF;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_wilaya_name"("p_wilaya_id" integer, "p_locale" text) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_wilaya_name" IS 'Returns the appropriate wilaya name based on the provided locale'; 