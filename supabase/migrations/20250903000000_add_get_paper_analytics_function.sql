-- Add get_paper_analytics function for the Research Repository feature
-- This function returns view and download counts for a specific paper

-- Create the get_paper_analytics function
CREATE OR REPLACE FUNCTION "public"."get_paper_analytics"(
    "p_submission_id" "uuid"
) RETURNS TABLE(
    "view_count" bigint,
    "download_count" bigint,
    "last_viewed_at" timestamp with time zone,
    "last_downloaded_at" timestamp with time zone
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
BEGIN
    -- Ensure the user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check if the user has permission to view this data
    -- Allow if: 1) User is the paper author, 2) User is an admin
    IF NOT EXISTS (
        SELECT 1 
        FROM submissions s 
        WHERE s.id = p_submission_id 
        AND s.submitted_by = auth.uid()
    ) AND NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Permission denied: You do not have access to this paper''s analytics';
    END IF;

    RETURN QUERY
    SELECT
        -- View count
        (SELECT COUNT(*) FROM paper_analytics 
         WHERE submission_id = p_submission_id AND action_type = 'view') AS view_count,
        
        -- Download count
        (SELECT COUNT(*) FROM paper_analytics 
         WHERE submission_id = p_submission_id AND action_type = 'download') AS download_count,
        
        -- Last viewed timestamp
        (SELECT MAX(created_at) FROM paper_analytics 
         WHERE submission_id = p_submission_id AND action_type = 'view') AS last_viewed_at,
        
        -- Last downloaded timestamp
        (SELECT MAX(created_at) FROM paper_analytics 
         WHERE submission_id = p_submission_id AND action_type = 'download') AS last_downloaded_at;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_paper_analytics"("p_submission_id" "uuid") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_paper_analytics" IS 'Returns analytics data (view and download counts) for a specific paper';

-- Create a function to get analytics for multiple papers
CREATE OR REPLACE FUNCTION "public"."get_papers_analytics"(
    "p_submission_ids" "uuid"[]
) RETURNS TABLE(
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
        COALESCE((SELECT COUNT(*) FROM paper_analytics 
                 WHERE submission_id = s.id AND action_type = 'view'), 0) AS view_count,
        COALESCE((SELECT COUNT(*) FROM paper_analytics 
                 WHERE submission_id = s.id AND action_type = 'download'), 0) AS download_count
    FROM unnest(p_submission_ids) AS s(id)
    WHERE s.id IS NOT NULL;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_papers_analytics"("p_submission_ids" "uuid"[]) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_papers_analytics" IS 'Returns analytics data (view and download counts) for multiple papers';

-- Create a function to get analytics data over time for charts
CREATE OR REPLACE FUNCTION "public"."get_paper_analytics_over_time"(
    "p_submission_id" "uuid",
    "p_start_date" timestamp with time zone DEFAULT (now() - interval '30 days'),
    "p_end_date" timestamp with time zone DEFAULT now(),
    "p_interval" text DEFAULT 'day'
) RETURNS TABLE(
    "date" timestamp with time zone,
    "views" bigint,
    "downloads" bigint
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
DECLARE
    v_interval text;
BEGIN
    -- Ensure the user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Check if the user has permission to view this data
    -- Allow if: 1) User is the paper author, 2) User is an admin
    IF NOT EXISTS (
        SELECT 1 
        FROM submissions s 
        WHERE s.id = p_submission_id 
        AND s.submitted_by = auth.uid()
    ) AND NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Permission denied: You do not have access to this paper''s analytics';
    END IF;

    -- Validate and set the interval
    IF p_interval NOT IN ('hour', 'day', 'week', 'month') THEN
        v_interval := 'day'; -- Default to day if invalid
    ELSE
        v_interval := p_interval;
    END IF;

    RETURN QUERY
    WITH date_series AS (
        SELECT 
            date_trunc(v_interval, d) AS date_point
        FROM 
            generate_series(
                date_trunc(v_interval, p_start_date),
                date_trunc(v_interval, p_end_date),
                (CASE 
                    WHEN v_interval = 'hour' THEN '1 hour'::interval
                    WHEN v_interval = 'day' THEN '1 day'::interval
                    WHEN v_interval = 'week' THEN '1 week'::interval
                    WHEN v_interval = 'month' THEN '1 month'::interval
                    ELSE '1 day'::interval
                END)
            ) d
    ),
    views AS (
        SELECT 
            date_trunc(v_interval, created_at) AS date_point,
            COUNT(*) AS count
        FROM 
            paper_analytics
        WHERE 
            submission_id = p_submission_id
            AND action_type = 'view'
            AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 
            date_trunc(v_interval, created_at)
    ),
    downloads AS (
        SELECT 
            date_trunc(v_interval, created_at) AS date_point,
            COUNT(*) AS count
        FROM 
            paper_analytics
        WHERE 
            submission_id = p_submission_id
            AND action_type = 'download'
            AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 
            date_trunc(v_interval, created_at)
    )
    SELECT 
        ds.date_point AS date,
        COALESCE(v.count, 0) AS views,
        COALESCE(d.count, 0) AS downloads
    FROM 
        date_series ds
    LEFT JOIN 
        views v ON ds.date_point = v.date_point
    LEFT JOIN 
        downloads d ON ds.date_point = d.date_point
    ORDER BY 
        ds.date_point;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_paper_analytics_over_time"("p_submission_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" text) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_paper_analytics_over_time" IS 'Returns time-series analytics data for a specific paper for charting'; 

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_paper_analytics_submission_action 
ON public.paper_analytics(submission_id, action_type);

CREATE INDEX IF NOT EXISTS idx_paper_analytics_submission_action_time 
ON public.paper_analytics(submission_id, action_type, created_at);

COMMENT ON INDEX public.idx_paper_analytics_submission_action IS 'Improves performance for queries filtering by submission_id and action_type';
COMMENT ON INDEX public.idx_paper_analytics_submission_action_time IS 'Improves performance for time-series queries filtering by submission_id, action_type, and created_at'; 