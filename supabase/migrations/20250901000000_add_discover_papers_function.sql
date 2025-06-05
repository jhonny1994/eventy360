-- Add discover_papers function for the Research Repository feature
-- This function returns papers from completed events with filtering options

-- Create the discover_papers function
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
    "paper_title" "text",
    "paper_abstract" "text",
    "event_id" "uuid",
    "event_name" "text",
    "event_date" timestamp with time zone,
    "author_id" "uuid",
    "author_name" "text",
    "author_institution" "text",
    "full_paper_file_url" "text",
    "full_paper_file_metadata" "jsonb",
    "submission_date" timestamp with time zone,
    "wilaya_name" "text",
    "daira_name" "text",
    "topics" "text"[],
    "rank" real,
    "total_records" bigint
) LANGUAGE "plpgsql" SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH filtered_papers AS (
        SELECT 
            s.id,
            s.title_translations ->> 'ar' as paper_title,
            s.abstract_translations ->> 'ar' as paper_abstract,
            s.event_id,
            e.event_name_translations ->> 'ar' as event_name,
            e.event_date,
            s.submitted_by as author_id,
            rp.name as author_name,
            rp.institution as author_institution,
            s.full_paper_file_url,
            s.full_paper_file_metadata,
            s.submission_date,
            w.name_ar as wilaya_name,
            d.name_ar as daira_name,
            ARRAY(
                SELECT t.name_translations ->> 'ar'
                FROM event_topics et
                JOIN topics t ON t.id = et.topic_id
                WHERE et.event_id = e.id
            ) as topics,
            CASE 
                WHEN search_query IS NOT NULL AND search_query != '' THEN
                    -- Add full-text search ranking when search is provided
                    ts_rank_cd(
                        setweight(to_tsvector('arabic', COALESCE(s.title_translations ->> 'ar', '')), 'A') ||
                        setweight(to_tsvector('arabic', COALESCE(s.abstract_translations ->> 'ar', '')), 'B') ||
                        setweight(to_tsvector('arabic', COALESCE(e.event_name_translations ->> 'ar', '')), 'C'),
                        plainto_tsquery('arabic', search_query)
                    ) +
                    ts_rank_cd(
                        setweight(to_tsvector('english', COALESCE(s.title_translations ->> 'en', '')), 'A') ||
                        setweight(to_tsvector('english', COALESCE(s.abstract_translations ->> 'en', '')), 'B') ||
                        setweight(to_tsvector('english', COALESCE(e.event_name_translations ->> 'en', '')), 'C'),
                        plainto_tsquery('english', search_query)
                    )
                ELSE
                    -- Default ranking by date when no search is provided
                    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - s.submission_date))::REAL
            END as rank
        FROM submissions s
        JOIN events e ON s.event_id = e.id
        JOIN profiles p ON s.submitted_by = p.id
        JOIN researcher_profiles rp ON p.id = rp.profile_id
        JOIN wilayas w ON rp.wilaya_id = w.id
        JOIN dairas d ON rp.daira_id = d.id
        WHERE 
            -- Only consider completed events
            e.status = 'completed'
            
            -- Only show papers that are completed or accepted
            AND (s.status = 'completed' OR s.full_paper_status = 'full_paper_accepted')
            
            -- Exclude deleted items
            AND s.deleted_at IS NULL
            AND e.deleted_at IS NULL
            
            -- Author/researcher filtering
            AND (researcher_id IS NULL OR s.submitted_by = researcher_id)
            
            -- Text search across paper title, abstract and event name
            AND (
                search_query IS NULL 
                OR search_query = '' 
                OR (
                    -- Arabic search
                    to_tsvector('arabic', COALESCE(s.title_translations ->> 'ar', '')) ||
                    to_tsvector('arabic', COALESCE(s.abstract_translations ->> 'ar', '')) ||
                    to_tsvector('arabic', COALESCE(e.event_name_translations ->> 'ar', ''))
                ) @@ plainto_tsquery('arabic', search_query)
                OR (
                    -- English search
                    to_tsvector('english', COALESCE(s.title_translations ->> 'en', '')) ||
                    to_tsvector('english', COALESCE(s.abstract_translations ->> 'en', '')) ||
                    to_tsvector('english', COALESCE(e.event_name_translations ->> 'en', ''))
                ) @@ plainto_tsquery('english', search_query)
            )
            
            -- Topic filtering: event must have at least one matching topic
            AND (
                topic_ids IS NULL 
                OR topic_ids = ARRAY[]::UUID[]
                OR EXISTS (
                    SELECT 1 FROM event_topics et 
                    WHERE et.event_id = e.id 
                    AND et.topic_id = ANY(topic_ids)
                )
            )
            
            -- Location filtering (based on researcher's location)
            AND (wilaya_id_param IS NULL OR rp.wilaya_id = wilaya_id_param)
            AND (daira_id_param IS NULL OR rp.daira_id = daira_id_param)
            
            -- Date range filtering
            AND (start_date IS NULL OR s.submission_date >= start_date)
            AND (end_date IS NULL OR s.submission_date <= end_date)
    )
    SELECT 
        fp.*,
        COUNT(*) OVER() as total_records
    FROM filtered_papers fp
    ORDER BY 
        -- Order by search relevance when search is provided, otherwise by submission date
        CASE 
            WHEN search_query IS NOT NULL AND search_query != '' THEN fp.rank
            ELSE EXTRACT(EPOCH FROM fp.submission_date)
        END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."discover_papers"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "researcher_id" "uuid", "limit_count" integer, "offset_count" integer) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."discover_papers"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "researcher_id" "uuid", "limit_count" integer, "offset_count" integer) IS 'Search across the research repository for published papers from completed events with various filtering options';

-- Create paper analytics table and tracking function
CREATE TABLE IF NOT EXISTS "public"."paper_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "paper_analytics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "paper_analytics_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE,
    CONSTRAINT "paper_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "paper_analytics_action_type_check" CHECK (("action_type" = ANY (ARRAY['view'::text, 'download'::text])))
);

ALTER TABLE "public"."paper_analytics" OWNER TO "postgres";
COMMENT ON TABLE "public"."paper_analytics" IS 'Tracks paper view and download statistics for the research repository';

-- Create function to record paper analytics
CREATE OR REPLACE FUNCTION "public"."track_paper_activity"("p_submission_id" "uuid", "p_user_id" "uuid", "p_action_type" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.paper_analytics(submission_id, user_id, action_type)
  VALUES (p_submission_id, p_user_id, p_action_type)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

ALTER FUNCTION "public"."track_paper_activity"("p_submission_id" "uuid", "p_user_id" "uuid", "p_action_type" "text") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."track_paper_activity" IS 'Records paper view or download activity in the analytics table';

-- Create RLS policies for paper_analytics
ALTER TABLE "public"."paper_analytics" ENABLE ROW LEVEL SECURITY;

-- Allow users to add records only for themselves
CREATE POLICY "Users can track their own paper activity" ON "public"."paper_analytics"
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.uid() = user_id));

-- Allow researchers to see analytics for their own papers
CREATE POLICY "Researchers can see analytics for their papers" ON "public"."paper_analytics"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM submissions s 
            WHERE s.id = paper_analytics.submission_id 
            AND s.submitted_by = auth.uid()
        )
    );

-- Allow admins to see all analytics
CREATE POLICY "Admins can see all analytics" ON "public"."paper_analytics"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    ); 