CREATE OR REPLACE FUNCTION discover_events(
    search_query TEXT DEFAULT NULL,
    topic_ids UUID[] DEFAULT NULL,
    wilaya_id_param INT DEFAULT NULL,
    daira_id_param INT DEFAULT NULL,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    event_status_filter event_status_enum[] DEFAULT NULL,
    event_format_filter event_format_enum[] DEFAULT NULL,
    p_organizer_id UUID DEFAULT NULL, -- Added for organizer-specific filtering
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
        -- Organizer filter: If p_organizer_id is provided, filter by created_by
        AND (p_organizer_id IS NULL OR e.created_by = p_organizer_id)
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
