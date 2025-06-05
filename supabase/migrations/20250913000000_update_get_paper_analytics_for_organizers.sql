-- Migration: Update get_paper_analytics function to allow organizers to view analytics
-- Description: This script modifies the get_paper_analytics function to allow organizers
-- to view analytics for papers from events they've created, in addition to paper authors
-- and admins. This aligns with the permissions in get_papers_analytics.

-- Drop the existing function
DROP FUNCTION IF EXISTS "public"."get_paper_analytics"("uuid");

-- Re-create the get_paper_analytics function with organizer access
CREATE OR REPLACE FUNCTION "public"."get_paper_analytics"(
    "p_submission_id" "uuid"
) RETURNS TABLE(
    "view_count" bigint,
    "download_count" bigint,
    "last_viewed_at" timestamp with time zone,
    "last_downloaded_at" timestamp with time zone
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid;
    v_user_type text;
    v_has_permission boolean;
BEGIN
    -- Ensure the user is authenticated
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Get the user's type
    SELECT user_type INTO v_user_type FROM profiles WHERE id = v_user_id;
    
    -- Check if the user has permission to view this data
    -- Allow if: 1) User is the paper author, 2) User is an admin, 3) User is an organizer who created the event
    IF v_user_type = 'admin' THEN
        v_has_permission := TRUE;
    ELSIF v_user_type = 'organizer' THEN
        -- Check if the organizer created the event that this paper belongs to
        SELECT EXISTS (
            SELECT 1 
            FROM submissions s
            JOIN events e ON s.event_id = e.id
            WHERE s.id = p_submission_id 
            AND e.created_by = v_user_id
        ) INTO v_has_permission;
    ELSE
        -- Check if the user is the author of the paper
        SELECT EXISTS (
            SELECT 1 
            FROM submissions s 
            WHERE s.id = p_submission_id 
            AND s.submitted_by = v_user_id
        ) INTO v_has_permission;
    END IF;

    -- Raise an exception if the user doesn't have permission
    IF NOT v_has_permission THEN
        RAISE EXCEPTION 'Permission denied: You do not have access to this paper''s analytics';
    END IF;

    -- Return the analytics data
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
GRANT ALL ON FUNCTION "public"."get_paper_analytics"("p_submission_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_paper_analytics"("p_submission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_paper_analytics"("p_submission_id" "uuid") TO "service_role";

COMMENT ON FUNCTION "public"."get_paper_analytics" IS 'Returns analytics data (view and download counts) for a specific paper, allowing organizers to view analytics for papers from events they created';

-- Now also update get_paper_analytics_over_time function with the same permissions

-- Drop the existing function
DROP FUNCTION IF EXISTS "public"."get_paper_analytics_over_time"("uuid", "timestamp with time zone", "timestamp with time zone", "text");

-- Re-create the get_paper_analytics_over_time function with organizer access
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
    v_user_id uuid;
    v_user_type text;
    v_has_permission boolean;
BEGIN
    -- Ensure the user is authenticated
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Get the user's type
    SELECT user_type INTO v_user_type FROM profiles WHERE id = v_user_id;
    
    -- Check if the user has permission to view this data
    -- Allow if: 1) User is the paper author, 2) User is an admin, 3) User is an organizer who created the event
    IF v_user_type = 'admin' THEN
        v_has_permission := TRUE;
    ELSIF v_user_type = 'organizer' THEN
        -- Check if the organizer created the event that this paper belongs to
        SELECT EXISTS (
            SELECT 1 
            FROM submissions s
            JOIN events e ON s.event_id = e.id
            WHERE s.id = p_submission_id 
            AND e.created_by = v_user_id
        ) INTO v_has_permission;
    ELSE
        -- Check if the user is the author of the paper
        SELECT EXISTS (
            SELECT 1 
            FROM submissions s 
            WHERE s.id = p_submission_id 
            AND s.submitted_by = v_user_id
        ) INTO v_has_permission;
    END IF;

    -- Raise an exception if the user doesn't have permission
    IF NOT v_has_permission THEN
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
GRANT ALL ON FUNCTION "public"."get_paper_analytics_over_time"("p_submission_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" text) TO "anon";
GRANT ALL ON FUNCTION "public"."get_paper_analytics_over_time"("p_submission_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_paper_analytics_over_time"("p_submission_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" text) TO "service_role";

COMMENT ON FUNCTION "public"."get_paper_analytics_over_time"("p_submission_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_interval" text) IS 'Returns time-series analytics data for a specific paper for charting, allowing organizers to view analytics for papers from events they created'; 