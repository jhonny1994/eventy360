-- supabase/migrations/20250527000000_create_event_stats_functions.sql

CREATE OR REPLACE FUNCTION public.calculate_event_statistics(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSONB;
    total_abstract_submissions BIGINT;
    accepted_abstracts BIGINT;
    rejected_abstracts BIGINT;
    pending_abstract_reviews BIGINT;
    abstract_revisions_requested BIGINT;
    abstract_acceptance_rate FLOAT;

    total_full_paper_submissions BIGINT;
    accepted_full_papers BIGINT;
    rejected_full_papers BIGINT;
    pending_full_paper_reviews BIGINT;
    full_paper_revisions_requested BIGINT;
    full_paper_acceptance_rate FLOAT;
BEGIN
    -- Calculate abstract stats
    SELECT COUNT(*) INTO total_abstract_submissions
    FROM public.submissions
    WHERE event_id = p_event_id AND abstract_status IS NOT NULL;

    SELECT COUNT(*) INTO accepted_abstracts
    FROM public.submissions
    WHERE event_id = p_event_id AND abstract_status = 'abstract_accepted';

    SELECT COUNT(*) INTO rejected_abstracts
    FROM public.submissions
    WHERE event_id = p_event_id AND abstract_status = 'abstract_rejected';

    SELECT COUNT(*) INTO pending_abstract_reviews
    FROM public.submissions
    WHERE event_id = p_event_id AND abstract_status = 'abstract_submitted';

    SELECT COUNT(*) INTO abstract_revisions_requested
    FROM public.submissions
    WHERE event_id = p_event_id AND abstract_status = 'revision_requested';

    IF (accepted_abstracts + rejected_abstracts) > 0 THEN
        abstract_acceptance_rate := (accepted_abstracts::FLOAT / (accepted_abstracts + rejected_abstracts)::FLOAT) * 100.0;
    ELSE
        abstract_acceptance_rate := 0.0;
    END IF;

    -- Calculate full paper stats
    SELECT COUNT(*) INTO total_full_paper_submissions
    FROM public.submissions
    WHERE event_id = p_event_id AND full_paper_status IS NOT NULL;

    SELECT COUNT(*) INTO accepted_full_papers
    FROM public.submissions
    WHERE event_id = p_event_id AND full_paper_status = 'full_paper_accepted';

    SELECT COUNT(*) INTO rejected_full_papers
    FROM public.submissions
    WHERE event_id = p_event_id AND full_paper_status = 'full_paper_rejected';

    SELECT COUNT(*) INTO pending_full_paper_reviews
    FROM public.submissions
    WHERE event_id = p_event_id AND full_paper_status = 'full_paper_submitted';

    SELECT COUNT(*) INTO full_paper_revisions_requested
    FROM public.submissions
    WHERE event_id = p_event_id AND full_paper_status = 'revision_requested';

    IF (accepted_full_papers + rejected_full_papers) > 0 THEN
        full_paper_acceptance_rate := (accepted_full_papers::FLOAT / (accepted_full_papers + rejected_full_papers)::FLOAT) * 100.0;
    ELSE
        full_paper_acceptance_rate := 0.0;
    END IF;

    stats := jsonb_build_object(
        'event_id', p_event_id,
        'total_abstract_submissions', total_abstract_submissions,
        'accepted_abstracts', accepted_abstracts,
        'rejected_abstracts', rejected_abstracts,
        'pending_abstract_reviews', pending_abstract_reviews,
        'abstract_revisions_requested', abstract_revisions_requested,
        'abstract_acceptance_rate', round(abstract_acceptance_rate::numeric, 2),

        'total_full_paper_submissions', total_full_paper_submissions,
        'accepted_full_papers', accepted_full_papers,
        'rejected_full_papers', rejected_full_papers,
        'pending_full_paper_reviews', pending_full_paper_reviews,
        'full_paper_revisions_requested', full_paper_revisions_requested,
        'full_paper_acceptance_rate', round(full_paper_acceptance_rate::numeric, 2)
    );

    RETURN stats;
END;
$$;

-- Grant execute permission to the authenticated role
-- This allows authenticated users to call this function.
-- RLS on the underlying tables is bypassed due to SECURITY DEFINER,
-- but the function is scoped by p_event_id.
-- Access to the function itself can be further restricted if needed
-- by granting to more specific roles.
GRANT EXECUTE ON FUNCTION public.calculate_event_statistics(UUID) TO authenticated;
