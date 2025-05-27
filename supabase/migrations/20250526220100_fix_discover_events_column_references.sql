-- Fix column reference errors in discover_events function
-- Replace non-existent event_description_translations with problem_statement_translations
-- and organizer_id with created_by

DROP FUNCTION IF EXISTS discover_events(TEXT, UUID[], INT, INT, TIMESTAMPTZ, TIMESTAMPTZ, event_status_enum[], event_format_enum[], UUID, INT, INT);

-- Recreate the function with correct column references
CREATE OR REPLACE FUNCTION discover_events(
    search_query TEXT DEFAULT NULL,
    topic_ids UUID[] DEFAULT NULL,
    wilaya_id_param INT DEFAULT NULL,
    daira_id_param INT DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    event_status_filter event_status_enum[] DEFAULT NULL,
    event_format_filter event_format_enum[] DEFAULT NULL,
    p_organizer_id UUID DEFAULT NULL, -- Parameter for organizer-specific filtering
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    event_name TEXT,
    event_subtitle TEXT,
    event_date TIMESTAMPTZ,
    event_end_date TIMESTAMPTZ,
    wilaya_name TEXT,
    daira_name TEXT,
    organizer_name TEXT,
    topics TEXT[],
    status event_status_enum,
    format event_format_enum,
    logo_url TEXT,
    abstract_submission_deadline TIMESTAMPTZ,
    rank REAL,
    total_records BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN    RETURN QUERY
    WITH filtered_events AS (
        SELECT 
            e.id,
            e.event_name_translations ->> 'ar' as event_name,
            e.event_subtitle_translations ->> 'ar' as event_subtitle,
            e.event_date,
            e.event_end_date,
            w.name_ar as wilaya_name,
            d.name_ar as daira_name,
            CASE 
                WHEN p.user_type = 'organizer' THEN op.name_translations ->> 'ar'
                ELSE 'منظم غير معروف'
            END as organizer_name,
            ARRAY(
                SELECT t.name_translations ->> 'ar'
                FROM event_topics et
                JOIN topics t ON t.id = et.topic_id
                WHERE et.event_id = e.id
            ) as topics,
            e.status,
            e.format,
            e.logo_url,
            e.abstract_submission_deadline,
            CASE 
                WHEN search_query IS NOT NULL AND search_query != '' THEN
                    -- Add full-text search ranking when search is provided
                    ts_rank_cd(
                        setweight(to_tsvector('arabic', COALESCE(e.event_name_translations ->> 'ar', '')), 'A') ||
                        setweight(to_tsvector('arabic', COALESCE(e.event_subtitle_translations ->> 'ar', '')), 'B') ||
                        setweight(to_tsvector('arabic', COALESCE(e.problem_statement_translations ->> 'ar', '')), 'C'),
                        plainto_tsquery('arabic', search_query)
                    )
                ELSE
                    -- Default ranking by date when no search is provided
                    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - e.event_date))::REAL
            END as rank
        FROM events e
        LEFT JOIN wilayas w ON e.wilaya_id = w.id
        LEFT JOIN dairas d ON e.daira_id = d.id
        LEFT JOIN profiles p ON e.created_by = p.id
        LEFT JOIN organizer_profiles op ON p.id = op.profile_id
        WHERE 
            -- Always filter published events for general discovery
            e.status = 'published'
            
            -- Organizer filtering: if p_organizer_id is provided, show only that organizer's events
            AND (p_organizer_id IS NULL OR e.created_by = p_organizer_id)
            
            -- Text search across event name, subtitle and problem statement
            AND (
                search_query IS NULL 
                OR search_query = '' 
                OR (
                    to_tsvector('arabic', COALESCE(e.event_name_translations ->> 'ar', '')) ||
                    to_tsvector('arabic', COALESCE(e.event_subtitle_translations ->> 'ar', '')) ||
                    to_tsvector('arabic', COALESCE(e.problem_statement_translations ->> 'ar', ''))
                ) @@ plainto_tsquery('arabic', search_query)
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
            
            -- Location filtering
            AND (wilaya_id_param IS NULL OR e.wilaya_id = wilaya_id_param)
            AND (daira_id_param IS NULL OR e.daira_id = daira_id_param)
            
            -- Date range filtering
            AND (start_date IS NULL OR e.event_date >= start_date)
            AND (end_date IS NULL OR e.event_date <= end_date)
            
            -- Status filtering
            AND (
                event_status_filter IS NULL 
                OR event_status_filter = ARRAY[]::event_status_enum[]
                OR e.status = ANY(event_status_filter)
            )
            
            -- Format filtering  
            AND (
                event_format_filter IS NULL 
                OR event_format_filter = ARRAY[]::event_format_enum[]
                OR e.format = ANY(event_format_filter)
            )
    )
    SELECT 
        fe.*,
        COUNT(*) OVER() as total_records
    FROM filtered_events fe
    ORDER BY 
        -- Order by search relevance when search is provided, otherwise by date
        CASE 
            WHEN search_query IS NOT NULL AND search_query != '' THEN fe.rank
            ELSE EXTRACT(EPOCH FROM fe.event_date)
        END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
