-- Migration to fix column references in discover_papers function

-- Drop and recreate the discover_papers function
DROP FUNCTION IF EXISTS "public"."discover_papers"(
    "text",
    "uuid"[],
    integer,
    integer,
    timestamp with time zone,
    timestamp with time zone,
    "uuid",
    integer,
    integer
);

-- Re-create the discover_papers function with the fixed column references
CREATE OR REPLACE FUNCTION "public"."discover_papers"(
    "search_query" "text" DEFAULT NULL::"text",
    "topic_ids" "uuid"[] DEFAULT NULL::"uuid"[],
    "wilaya_id_param" integer DEFAULT NULL::integer,
    "daira_id_param" integer DEFAULT NULL::integer,
    "start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone,
    "end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone,
    "researcher_id" "uuid" DEFAULT NULL::"uuid", 
    "limit_count" integer DEFAULT 20,
    "offset_count" integer DEFAULT 0
) RETURNS TABLE(
    "id" "uuid", 
    "paper_title_translations" jsonb,
    "paper_abstract_translations" jsonb,
    "event_id" "uuid",
    "event_name_translations" jsonb,
    "event_date" timestamp with time zone,
    "author_id" "uuid",
    "author_name" "text",
    "author_institution" "text",
    "full_paper_file_url" "text",
    "full_paper_file_metadata" jsonb,
    "submission_date" timestamp with time zone,
    "author_wilaya_id" integer,
    "author_daira_id" integer,
    "event_topic_ids" uuid[],
    "rank" real,
    "total_records" bigint
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH filtered_papers AS (
        SELECT 
            s.id,
            s.title_translations as paper_title_translations,
            s.abstract_translations as paper_abstract_translations,
            s.event_id,
            e.event_name_translations,
            e.event_date,
            s.submitted_by as author_id,
            rp.name as author_name,
            rp.institution as author_institution,
            s.full_paper_file_url,
            s.full_paper_file_metadata,
            s.submission_date,
            rp.wilaya_id as author_wilaya_id,
            rp.daira_id as author_daira_id,
            ARRAY(
                SELECT
                    et.topic_id
                FROM
                    event_topics et
                WHERE
                    et.event_id = e.id
            ) as event_topic_ids,
            CASE 
                WHEN search_query IS NOT NULL AND search_query != '' THEN
                    ts_rank_cd(
                        to_tsvector(
                            'simple',
                            COALESCE(
                                public.jsonb_values_to_text(s.title_translations),
                                ''
                            ) || ' ' || COALESCE(
                                public.jsonb_values_to_text(s.abstract_translations),
                                ''
                            ) || ' ' || COALESCE(
                                public.jsonb_values_to_text(e.event_name_translations),
                                ''
                            )
                        ),
                        plainto_tsquery('simple', search_query)
                    )
                ELSE
                    0
            END as rank
        FROM submissions s
        JOIN events e ON s.event_id = e.id
        JOIN profiles p ON s.submitted_by = p.id
        JOIN researcher_profiles rp ON p.id = rp.profile_id
        LEFT JOIN wilayas w ON rp.wilaya_id = w.id
        LEFT JOIN dairas d ON rp.daira_id = d.id
        WHERE
            e.status = 'completed'
            AND (
                s.status = 'completed'
                OR s.full_paper_status = 'full_paper_accepted'
            )
            AND s.deleted_at IS NULL
            AND e.deleted_at IS NULL
            AND (
                researcher_id IS NULL
                OR s.submitted_by = researcher_id
            )
            AND (
                search_query IS NULL
                OR search_query = ''
                OR (
                    to_tsvector(
                        'simple',
                        COALESCE(
                            public.jsonb_values_to_text(s.title_translations),
                            ''
                        ) || ' ' || COALESCE(
                            public.jsonb_values_to_text(s.abstract_translations),
                            ''
                        ) || ' ' || COALESCE(
                            public.jsonb_values_to_text(e.event_name_translations),
                            ''
                        )
                    ) @@ plainto_tsquery('simple', search_query)
                )
            )
            AND (
                topic_ids IS NULL
                OR topic_ids = ARRAY [] :: UUID []
                OR EXISTS (
                    SELECT
                        1
                    FROM
                        event_topics et
                    WHERE
                        et.event_id = e.id
                        AND et.topic_id = ANY(topic_ids)
                )
            )
            AND (
                wilaya_id_param IS NULL
                OR rp.wilaya_id = wilaya_id_param
            )
            AND (
                daira_id_param IS NULL
                OR rp.daira_id = daira_id_param
            )
            AND (
                start_date IS NULL
                OR s.submission_date >= start_date
            )
            AND (
                end_date IS NULL
                OR s.submission_date <= end_date
            )
    )
    SELECT 
        fp.*,
        COUNT(*) OVER() as total_records
    FROM filtered_papers fp
    ORDER BY 
        CASE 
            WHEN search_query IS NOT NULL AND search_query != '' THEN fp.rank
            ELSE 0
        END DESC,
        fp.submission_date DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."discover_papers"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "researcher_id" "uuid", "limit_count" integer, "offset_count" integer) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."discover_papers"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "researcher_id" "uuid", "limit_count" integer, "offset_count" integer) IS 'Search across the research repository for published papers from completed events with various filtering options'; 