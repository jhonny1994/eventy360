-- Create event discovery and filtering functions
-- These functions power the event discovery features for researchers
-- They respect the Arabic-first approach with JSONB queries on translatable fields using the 'ar' key

-- Function 1: Get featured events for homepage
-- Returns the most recent published events that are accepting submissions
CREATE OR REPLACE FUNCTION get_featured_events(
    limit_count INT DEFAULT 6
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
    abstract_submission_deadline TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        e.abstract_submission_deadline
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status IN ('published', 'abstract_review', 'full_paper_submission_open')
        AND e.event_date > NOW()
    ORDER BY 
        -- Prioritize events that are currently accepting submissions
        CASE 
            WHEN e.status = 'published' THEN 1
            WHEN e.status = 'full_paper_submission_open' THEN 2
            ELSE 3
        END,
        e.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Function 2: Search events with full-text search (Arabic support)
CREATE OR REPLACE FUNCTION search_events(
    search_query TEXT,
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
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        -- Simple text similarity ranking
        GREATEST(
            similarity(e.event_name_translations ->> 'ar', search_query),
            similarity(e.event_subtitle_translations ->> 'ar', search_query),
            similarity(e.problem_statement_translations ->> 'ar', search_query)
        ) as rank
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review')
        AND (
            e.event_name_translations ->> 'ar' ILIKE '%' || search_query || '%'
            OR e.event_subtitle_translations ->> 'ar' ILIKE '%' || search_query || '%'
            OR e.problem_statement_translations ->> 'ar' ILIKE '%' || search_query || '%'
            OR e.event_objectives_translations ->> 'ar' ILIKE '%' || search_query || '%'
            OR w.name_ar ILIKE '%' || search_query || '%'
            OR d.name_ar ILIKE '%' || search_query || '%'
            OR EXISTS (
                SELECT 1 FROM event_topics et
                JOIN topics t ON t.id = et.topic_id
                WHERE et.event_id = e.id
                AND t.name_translations ->> 'ar' ILIKE '%' || search_query || '%'
            )
        )
    ORDER BY 
        rank DESC,
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function 3: Filter events by topic
CREATE OR REPLACE FUNCTION filter_events_by_topic(
    topic_ids UUID[],
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
    abstract_submission_deadline TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        e.abstract_submission_deadline
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review')
        AND EXISTS (
            SELECT 1 FROM event_topics et
            WHERE et.event_id = e.id
            AND et.topic_id = ANY(topic_ids)
        )
    ORDER BY 
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function 4: Filter events by location (wilaya and optionally daira)
CREATE OR REPLACE FUNCTION filter_events_by_location(
    wilaya_id_param INT,
    daira_id_param INT DEFAULT NULL,
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
    abstract_submission_deadline TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        e.abstract_submission_deadline
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review')
        AND e.wilaya_id = wilaya_id_param
        AND (daira_id_param IS NULL OR e.daira_id = daira_id_param)
    ORDER BY 
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function 5: Filter events by date range
CREATE OR REPLACE FUNCTION filter_events_by_date_range(
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
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
    abstract_submission_deadline TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        e.abstract_submission_deadline
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review')
        AND (start_date IS NULL OR e.event_date >= start_date)
        AND (end_date IS NULL OR e.event_date <= end_date)
    ORDER BY 
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function 6: Comprehensive event discovery with combined filters
CREATE OR REPLACE FUNCTION discover_events(
    search_query TEXT DEFAULT NULL,
    topic_ids UUID[] DEFAULT NULL,
    wilaya_id_param INT DEFAULT NULL,
    daira_id_param INT DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    event_status_filter event_status_enum[] DEFAULT NULL,
    event_format_filter event_format_enum[] DEFAULT NULL,
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
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        -- Ranking based on search relevance if search query provided
        CASE 
            WHEN search_query IS NOT NULL THEN
                GREATEST(
                    similarity(e.event_name_translations ->> 'ar', search_query),
                    similarity(e.event_subtitle_translations ->> 'ar', search_query),
                    similarity(e.problem_statement_translations ->> 'ar', search_query)
                )
            ELSE 0.0
        END as rank
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        -- Status filter
        AND (
            event_status_filter IS NULL 
            OR e.status = ANY(event_status_filter)
        )
        -- Format filter
        AND (
            event_format_filter IS NULL 
            OR e.format = ANY(event_format_filter)
        )
        -- Location filter
        AND (wilaya_id_param IS NULL OR e.wilaya_id = wilaya_id_param)
        AND (daira_id_param IS NULL OR e.daira_id = daira_id_param)
        -- Date range filter
        AND (start_date IS NULL OR e.event_date >= start_date)
        AND (end_date IS NULL OR e.event_date <= end_date)
        -- Topic filter
        AND (
            topic_ids IS NULL 
            OR EXISTS (
                SELECT 1 FROM event_topics et
                WHERE et.event_id = e.id
                AND et.topic_id = ANY(topic_ids)
            )
        )
        -- Search filter
        AND (
            search_query IS NULL
            OR (
                e.event_name_translations ->> 'ar' ILIKE '%' || search_query || '%'
                OR e.event_subtitle_translations ->> 'ar' ILIKE '%' || search_query || '%'
                OR e.problem_statement_translations ->> 'ar' ILIKE '%' || search_query || '%'
                OR e.event_objectives_translations ->> 'ar' ILIKE '%' || search_query || '%'
                OR w.name_ar ILIKE '%' || search_query || '%'
                OR d.name_ar ILIKE '%' || search_query || '%'
                OR EXISTS (
                    SELECT 1 FROM event_topics et
                    JOIN topics t ON t.id = et.topic_id
                    WHERE et.event_id = e.id
                    AND t.name_translations ->> 'ar' ILIKE '%' || search_query || '%'
                )
            )
        )
    ORDER BY 
        -- If search query provided, order by relevance, otherwise by date
        CASE 
            WHEN search_query IS NOT NULL THEN rank
            ELSE 0.0
        END DESC,
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function 7: Get events by status (for different browsing categories)
CREATE OR REPLACE FUNCTION get_events_by_status(
    status_filter event_status_enum,
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
    abstract_submission_deadline TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        e.abstract_submission_deadline
    FROM events e
    JOIN wilayas w ON w.id = e.wilaya_id
    JOIN dairas d ON d.id = e.daira_id
    JOIN profiles p ON p.id = e.created_by
    LEFT JOIN organizer_profiles op ON op.profile_id = p.id
    WHERE 
        e.deleted_at IS NULL
        AND e.status = status_filter
    ORDER BY 
        e.event_date ASC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Create performance indexes for event discovery
-- Add pg_trgm extension for better text similarity if not exists
-- This extension is commonly available in Supabase
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index on JSONB fields for Arabic text search
CREATE INDEX IF NOT EXISTS idx_events_arabic_search 
ON events USING gin((
    (event_name_translations ->> 'ar') || ' ' ||
    COALESCE(event_subtitle_translations ->> 'ar', '') || ' ' ||
    (problem_statement_translations ->> 'ar') || ' ' ||
    (event_objectives_translations ->> 'ar')
) gin_trgm_ops);

-- Index on event dates for date range filtering
CREATE INDEX IF NOT EXISTS idx_events_date_range 
ON events(event_date, event_end_date) 
WHERE deleted_at IS NULL;

-- Index on location for geographic filtering
CREATE INDEX IF NOT EXISTS idx_events_location 
ON events(wilaya_id, daira_id) 
WHERE deleted_at IS NULL;

-- Index on status and format for filtering
CREATE INDEX IF NOT EXISTS idx_events_status_format 
ON events(status, format) 
WHERE deleted_at IS NULL;

-- Compound index for featured events
CREATE INDEX IF NOT EXISTS idx_events_featured 
ON events(status, event_date, created_at) 
WHERE deleted_at IS NULL;

-- Index on event_topics junction table
CREATE INDEX IF NOT EXISTS idx_event_topics_event_topic 
ON event_topics(event_id, topic_id);

-- Add pg_trgm extension for better text similarity if not exists
-- This extension is commonly available in Supabase
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Comments describing the functions
COMMENT ON FUNCTION get_featured_events(INT) IS 'Returns featured events for the homepage, prioritizing events accepting submissions';
COMMENT ON FUNCTION search_events(TEXT, INT, INT) IS 'Full-text search for events in Arabic with relevance ranking';
COMMENT ON FUNCTION filter_events_by_topic(UUID[], INT, INT) IS 'Filter events by associated topics';
COMMENT ON FUNCTION filter_events_by_location(INT, INT, INT, INT) IS 'Filter events by wilaya and optionally daira';
COMMENT ON FUNCTION filter_events_by_date_range(TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) IS 'Filter events by date range';
COMMENT ON FUNCTION discover_events(TEXT, UUID[], INT, INT, TIMESTAMPTZ, TIMESTAMPTZ, event_status_enum[], event_format_enum[], INT, INT) IS 'Comprehensive event discovery with multiple combined filters';
COMMENT ON FUNCTION get_events_by_status(event_status_enum, INT, INT) IS 'Get events filtered by specific status';
