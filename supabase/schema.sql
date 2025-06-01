

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admin_action_type" AS ENUM (
    'awarded_badge',
    'removed_badge',
    'recorded_payment',
    'updated_payment_status',
    'admin_login',
    'admin_user_edit',
    'admin_event_edit',
    'admin_submission_edit',
    'admin_topic_create',
    'admin_topic_update',
    'admin_topic_delete',
    'admin_email_template_edit',
    'processed_verification_request'
);


ALTER TYPE "public"."admin_action_type" OWNER TO "postgres";


CREATE TYPE "public"."billing_period_enum" AS ENUM (
    'monthly',
    'quarterly',
    'biannual',
    'annual'
);


ALTER TYPE "public"."billing_period_enum" OWNER TO "postgres";


CREATE TYPE "public"."email_log_status_enum" AS ENUM (
    'attempted',
    'sent',
    'failed',
    'retry_attempted'
);


ALTER TYPE "public"."email_log_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."event_format_enum" AS ENUM (
    'physical',
    'virtual',
    'hybrid'
);


ALTER TYPE "public"."event_format_enum" OWNER TO "postgres";


CREATE TYPE "public"."event_status_enum" AS ENUM (
    'published',
    'abstract_review',
    'full_paper_submission_open',
    'full_paper_review',
    'completed',
    'canceled'
);


ALTER TYPE "public"."event_status_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."event_status_enum" IS 'Lifecycle states for events: published (visible and accepting abstract submissions), abstract_review (abstracts under review), full_paper_submission_open (accepting full papers), full_paper_review (full papers under review), completed (event finished), canceled (event canceled)';



CREATE TYPE "public"."event_type_enum" AS ENUM (
    'scientific_event',
    'cultural_event',
    'sports_event',
    'competition'
);


ALTER TYPE "public"."event_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."institution_type_enum" AS ENUM (
    'university',
    'university_center',
    'national_school',
    'research_center',
    'research_laboratory',
    'activities_service',
    'research_team'
);


ALTER TYPE "public"."institution_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'immediate',
    'scheduled'
);


ALTER TYPE "public"."notification_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_enum" AS ENUM (
    'bank',
    'check',
    'cash',
    'online'
);


ALTER TYPE "public"."payment_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."payment_status_enum" AS ENUM (
    'pending_verification',
    'verified',
    'rejected'
);


ALTER TYPE "public"."payment_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."queue_status_enum" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE "public"."queue_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."submission_status_enum" AS ENUM (
    'abstract_submitted',
    'abstract_accepted',
    'abstract_rejected',
    'full_paper_submitted',
    'full_paper_accepted',
    'full_paper_rejected',
    'revision_requested',
    'completed'
);


ALTER TYPE "public"."submission_status_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."submission_status_enum" IS 'Lifecycle states for academic submissions: abstract_submitted (under review), abstract_accepted, abstract_rejected, full_paper_submitted (under review), full_paper_accepted, full_paper_rejected, revision_requested, completed';



CREATE TYPE "public"."submission_type_enum" AS ENUM (
    'abstract',
    'full_paper',
    'supplementary'
);


ALTER TYPE "public"."submission_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status_enum" AS ENUM (
    'active',
    'expired',
    'trial',
    'cancelled'
);


ALTER TYPE "public"."subscription_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_tier_enum" AS ENUM (
    'free',
    'paid_researcher',
    'paid_organizer',
    'trial'
);


ALTER TYPE "public"."subscription_tier_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_type_enum" AS ENUM (
    'researcher',
    'organizer',
    'admin'
);


ALTER TYPE "public"."user_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."verification_request_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."verification_request_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") RETURNS interval
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN CASE period
    WHEN 'monthly' THEN INTERVAL '1 month'
    WHEN 'quarterly' THEN INTERVAL '3 months'
    WHEN 'biannual' THEN INTERVAL '6 months'
    WHEN 'annual' THEN INTERVAL '1 year'
    ELSE INTERVAL '0 days'
  END;
END;
$$;


ALTER FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") IS 'Converts a billing_period_enum value to its corresponding INTERVAL.';



CREATE OR REPLACE FUNCTION "public"."calculate_event_statistics"("p_event_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."calculate_event_statistics"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_event_submission_allowed"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    event_status public.event_status_enum;
BEGIN
    -- Get the current status of the event
    SELECT status INTO event_status
    FROM public.events
    WHERE id = NEW.event_id;
    
    -- For new abstract submissions, only allow if event is in 'published' status
    IF TG_OP = 'INSERT' AND NEW.status = 'abstract_submitted' THEN
        IF event_status != 'published' THEN
            RAISE EXCEPTION 'Cannot submit abstract: event is not accepting submissions';
        END IF;
    END IF;
    
    -- For full paper submissions, only allow if event status is 'full_paper_submission_open'
    -- and the abstract was previously accepted
    IF TG_OP = 'UPDATE' AND 
       NEW.status = 'full_paper_submitted' AND 
       OLD.status = 'abstract_accepted' THEN
        IF event_status != 'full_paper_submission_open' THEN
            RAISE EXCEPTION 'Cannot submit full paper: event is not accepting full papers';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_event_submission_allowed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_pending_verification_requests"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if there are any pending verification requests for this user
  IF EXISTS (
    SELECT 1 FROM verification_requests
    WHERE user_id = NEW.user_id
    AND status = 'pending'::verification_request_status
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'You already have a pending verification request.';
  END IF;
  
  -- Check if user is already verified
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.user_id
    AND is_verified = TRUE
  ) THEN
    RAISE EXCEPTION 'Your profile is already verified.';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_pending_verification_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_subscriptions_expiry"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  expiring_trial RECORD;
  expired_trial RECORD;
BEGIN
  -- Process trials ending in 3 days
  FOR expiring_trial IN
    SELECT 
      s.user_id, 
      p.id AS profile_id, 
      s.trial_ends_at, 
      s.status
    FROM subscriptions s
    JOIN profiles p ON s.user_id = p.id
    WHERE 
      s.status = 'trial' 
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      -- Avoid duplicate notifications by checking if one was sent in the last day
      AND NOT EXISTS (
        SELECT 1 FROM notification_queue nq
        WHERE 
          nq.recipient_profile_id = s.user_id 
          AND nq.template_key = 'trial_ending_soon'
          AND nq.created_at > NOW() - INTERVAL '1 day'
      )
  LOOP
    -- Call the function we created in the previous migration
    PERFORM queue_trial_expiry_notification(
      expiring_trial.profile_id, 
      EXTRACT(DAY FROM expiring_trial.trial_ends_at - NOW())::INTEGER,
      'trial_ending_soon'
    );
  END LOOP;

  -- Process expired trials (ended in the last day)
  FOR expired_trial IN
    SELECT 
      s.user_id, 
      p.id AS profile_id, 
      s.trial_ends_at, 
      s.status
    FROM subscriptions s
    JOIN profiles p ON s.user_id = p.id
    WHERE 
      s.status = 'trial' 
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at < NOW()
      AND s.trial_ends_at > NOW() - INTERVAL '1 day'
      -- Avoid duplicate notifications
      AND NOT EXISTS (
        SELECT 1 FROM notification_queue nq
        WHERE 
          nq.recipient_profile_id = s.user_id 
          AND nq.template_key = 'trial_expired'
          AND nq.created_at > NOW() - INTERVAL '1 day'
      )
  LOOP
    -- Queue expired notification
    PERFORM queue_trial_expiry_notification(
      expired_trial.profile_id, 
      0,
      'trial_expired'
    );
    
    -- Update subscription status to expired
    UPDATE subscriptions
    SET status = 'expired'
    WHERE user_id = expired_trial.user_id;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."check_subscriptions_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_type public.user_type_enum;
BEGIN
  -- 1. Get the user's type from their main profile
  SELECT user_type INTO v_user_type
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_type IS NULL THEN
    RAISE EXCEPTION 'User profile not found for id: %', v_user_id;
  END IF;

  -- 2. Based on user_type, UPSERT into the corresponding extended profile table
  IF v_user_type = 'researcher' THEN
    INSERT INTO public.researcher_profiles (
      profile_id,
      name,
      institution,
      academic_position,
      bio_translations,
      profile_picture_url,
      wilaya_id,
      daira_id
    )
    VALUES (
      v_user_id,
      profile_data->>'name', -- Assuming direct mapping from JSONB keys
      profile_data->>'institution',
      profile_data->>'academic_position',
      profile_data->'bio_translations', -- Keep as JSONB
      profile_data->>'profile_picture_url',
      (profile_data->>'wilaya_id')::INT,
      (profile_data->>'daira_id')::INT
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      name = EXCLUDED.name,
      institution = EXCLUDED.institution,
      academic_position = EXCLUDED.academic_position,
      bio_translations = EXCLUDED.bio_translations,
      profile_picture_url = EXCLUDED.profile_picture_url,
      wilaya_id = EXCLUDED.wilaya_id,
      daira_id = EXCLUDED.daira_id,
      updated_at = timezone('utc', now());

  ELSIF v_user_type = 'organizer' THEN
    INSERT INTO public.organizer_profiles (
      profile_id,
      name_translations,
      institution_type,
      bio_translations,
      profile_picture_url,
      wilaya_id,
      daira_id
      -- Note: contact_email, website_url, logo_url from previous draft not in summary for organizer_profiles table structure
      -- If these are needed, the table and this RPC must be updated.
    )
    VALUES (
      v_user_id,
      profile_data->'name_translations', -- Keep as JSONB
      (profile_data->>'institution_type')::public.institution_type_enum,
      profile_data->'bio_translations', -- Keep as JSONB
      profile_data->>'profile_picture_url',
      (profile_data->>'wilaya_id')::INT,
      (profile_data->>'daira_id')::INT
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      name_translations = EXCLUDED.name_translations,
      institution_type = EXCLUDED.institution_type,
      bio_translations = EXCLUDED.bio_translations,
      profile_picture_url = EXCLUDED.profile_picture_url,
      wilaya_id = EXCLUDED.wilaya_id,
      daira_id = EXCLUDED.daira_id,
      updated_at = timezone('utc', now());
  
  -- ELSIF v_user_type = 'admin' THEN
    -- Admins might not have an extended profile in the same way, or it's managed differently.
    -- For now, no action for admin type unless admin_profiles needs population here.
    -- The summary defines admin_profiles with only name, which might be set elsewhere.

  ELSE
    RAISE WARNING 'User type % does not have a specific extended profile to complete via this function.', v_user_type;
    -- Optionally, still mark as complete if no extended profile is expected for this type
    -- UPDATE public.profiles
    -- SET is_extended_profile_complete = true, updated_at = timezone('utc', now())
    -- WHERE id = v_user_id;
    -- RETURN;
  END IF;

  -- 3. Update the main profile to mark extended profile as complete
  UPDATE public.profiles
  SET is_extended_profile_complete = true, updated_at = timezone('utc', now())
  WHERE id = v_user_id;

END;
$$;


ALTER FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") IS 'Allows a user to submit their role-specific extended profile data (researcher or organizer), 
which is upserted into the relevant table, and marks their main profile as complete.';



CREATE OR REPLACE FUNCTION "public"."complete_submission"("p_submission_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.status
    INTO v_event_id, v_event_organizer, v_current_status
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can complete submissions';
    END IF;
    
    -- Check if the current status allows for completion
    IF v_current_status NOT IN ('full_paper_accepted', 'full_paper_rejected', 'abstract_rejected') THEN
        RAISE EXCEPTION 'Submission cannot be completed from its current state';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET status = 'completed'
    WHERE id = p_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'completed',
        'action', 'complete_submission',
        'actor', auth.uid()
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."complete_submission"("p_submission_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."complete_submission"("p_submission_id" "uuid") IS 'Function for event organizers to mark a submission as completed after final acceptance or rejection.';



CREATE OR REPLACE FUNCTION "public"."create_deadline_notifications"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    event_record RECORD;
    researcher_record RECORD;
    submission_record RECORD;
BEGIN
    -- Find events with abstract submission deadline approaching (3 days away)
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.abstract_submission_deadline
        FROM public.events e
        WHERE 
            e.status = 'published' AND
            e.abstract_submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    LOOP
        -- Create notifications for researchers with matching topics
        FOR researcher_record IN
            SELECT DISTINCT p.id
            FROM public.profiles p
            JOIN public.researcher_profiles rp ON p.id = rp.profile_id
            JOIN public.researcher_topic_subscriptions rts ON p.id = rts.profile_id
            JOIN public.event_topics et ON rts.topic_id = et.topic_id
            WHERE et.event_id = event_record.id
        LOOP
            -- Insert notification for abstract submission deadline
            INSERT INTO public.notification_queue (
                recipient_profile_id,
                template_key,
                payload_data,
                status,
                process_after
            ) VALUES (
                researcher_record.id,
                'abstract_deadline_approaching',
                jsonb_build_object(
                    'event_id', event_record.id,
                    'event_name', event_record.event_name_translations,
                    'deadline', event_record.abstract_submission_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;

    -- Find events with full paper deadline approaching (3 days away) and notify researchers with accepted abstracts
    FOR event_record IN 
        SELECT e.id, e.event_name_translations, e.full_paper_submission_deadline
        FROM public.events e
        WHERE 
            e.status = 'full_paper_submission_open' AND
            e.full_paper_submission_deadline BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    LOOP
        -- Find researchers with accepted abstracts
        FOR submission_record IN
            SELECT s.id, s.submitted_by
            FROM public.submissions s
            WHERE 
                s.event_id = event_record.id AND
                s.status = 'abstract_accepted'
        LOOP
            -- Insert notification for full paper submission deadline
            INSERT INTO public.notification_queue (
                recipient_profile_id,
                template_key,
                payload_data,
                status,
                process_after
            ) VALUES (
                submission_record.submitted_by,
                'full_paper_deadline_approaching',
                jsonb_build_object(
                    'event_id', event_record.id,
                    'event_name', event_record.event_name_translations,
                    'submission_id', submission_record.id,
                    'deadline', event_record.full_paper_submission_deadline
                ),
                'pending',
                NOW()
            );
        END LOOP;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."create_deadline_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."discover_events"("search_query" "text" DEFAULT NULL::"text", "topic_ids" "uuid"[] DEFAULT NULL::"uuid"[], "wilaya_id_param" integer DEFAULT NULL::integer, "daira_id_param" integer DEFAULT NULL::integer, "start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "event_status_filter" "public"."event_status_enum"[] DEFAULT NULL::"public"."event_status_enum"[], "event_format_filter" "public"."event_format_enum"[] DEFAULT NULL::"public"."event_format_enum"[], "p_organizer_id" "uuid" DEFAULT NULL::"uuid", "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone, "rank" real, "total_records" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
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


ALTER FUNCTION "public"."discover_events"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "event_status_filter" "public"."event_status_enum"[], "event_format_filter" "public"."event_format_enum"[], "p_organizer_id" "uuid", "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "offset_count" integer) IS 'Filter events by date range';



CREATE OR REPLACE FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer DEFAULT NULL::integer, "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer, "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer, "limit_count" integer, "offset_count" integer) IS 'Filter events by wilaya and optionally daira';



CREATE OR REPLACE FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer, "offset_count" integer) IS 'Filter events by associated topics';



CREATE OR REPLACE FUNCTION "public"."get_event_submission_stats"("event_id" "uuid") RETURNS TABLE("total_submissions" integer, "abstract_submitted" integer, "abstract_accepted" integer, "abstract_rejected" integer, "full_paper_submitted" integer, "full_paper_accepted" integer, "full_paper_rejected" integer, "revision_requested" integer, "completed" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'abstract_submitted')::INTEGER AS abstract_submitted,
        COUNT(*) FILTER (WHERE status = 'abstract_accepted')::INTEGER AS abstract_accepted,
        COUNT(*) FILTER (WHERE status = 'abstract_rejected')::INTEGER AS abstract_rejected,
        COUNT(*) FILTER (WHERE status = 'full_paper_submitted')::INTEGER AS full_paper_submitted,
        COUNT(*) FILTER (WHERE status = 'full_paper_accepted')::INTEGER AS full_paper_accepted,
        COUNT(*) FILTER (WHERE status = 'full_paper_rejected')::INTEGER AS full_paper_rejected,
        COUNT(*) FILTER (WHERE status = 'revision_requested')::INTEGER AS revision_requested,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed
    FROM
        public.submissions
    WHERE
        submissions.event_id = $1 AND
        deleted_at IS NULL;
END;$_$;


ALTER FUNCTION "public"."get_event_submission_stats"("event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer, "offset_count" integer) IS 'Get events filtered by specific status';



CREATE OR REPLACE FUNCTION "public"."get_featured_events"("limit_count" integer DEFAULT 6) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_featured_events"("limit_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_featured_events"("limit_count" integer) IS 'Returns featured events for the homepage, prioritizing events accepting submissions';



CREATE OR REPLACE FUNCTION "public"."get_payment_details"("payment_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_payment RECORD;
  v_user_profile RECORD;
  v_admin_verifier_profile RECORD;
  v_result JSONB;
  v_has_admin_verifier BOOLEAN := FALSE;
  v_admin_name TEXT;
BEGIN
  -- Get payment record
  SELECT * INTO v_payment FROM payments WHERE id = payment_id;
  
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'Payment not found with ID: %', payment_id;
  END IF;
  
  -- Get user profile
  SELECT 
    p.user_type,
    CASE
      WHEN p.user_type = 'researcher' THEN rp.name
      WHEN p.user_type = 'organizer' THEN op.name_translations->>'ar'
      WHEN p.user_type = 'admin' THEN ap.name
      ELSE 'Unknown User'
    END AS user_name,
    CASE
      WHEN p.user_type = 'researcher' THEN rp.profile_picture_url
      WHEN p.user_type = 'organizer' THEN op.profile_picture_url
      ELSE NULL
    END AS profile_picture_url
  INTO v_user_profile
  FROM profiles p
  LEFT JOIN researcher_profiles rp ON p.id = rp.profile_id
  LEFT JOIN organizer_profiles op ON p.id = op.profile_id
  LEFT JOIN admin_profiles ap ON p.id = ap.profile_id
  WHERE p.id = v_payment.user_id;
  
  -- Get admin verifier name directly if payment was verified
  IF v_payment.admin_verifier_id IS NOT NULL THEN
    SELECT name INTO v_admin_name
    FROM admin_profiles
    WHERE profile_id = v_payment.admin_verifier_id;
    
    -- Set flag if we got a verifier name
    v_has_admin_verifier := FOUND;
  END IF;
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'id', v_payment.id,
    'user_id', v_payment.user_id,
    'user_name', v_user_profile.user_name,
    'user_type', v_user_profile.user_type,
    'profile_picture_url', v_user_profile.profile_picture_url,
    'amount', v_payment.amount,
    'billing_period', v_payment.billing_period,
    'payment_method_reported', v_payment.payment_method_reported,
    'status', v_payment.status,
    'reported_at', v_payment.reported_at,
    'verified_at', v_payment.verified_at,
    'admin_notes', v_payment.admin_notes,
    'admin_verifier_id', v_payment.admin_verifier_id,
    'proof_document_path', v_payment.proof_document_path,
    'reference_number', v_payment.reference_number,
    'payer_notes', v_payment.payer_notes,
    'subscription_id', v_payment.subscription_id,
    'created_at', v_payment.created_at,
    'updated_at', v_payment.updated_at
  );
  
  -- Add admin verifier name if available
  -- Use a separate variable for the name to avoid record access issues
  IF v_has_admin_verifier AND v_admin_name IS NOT NULL THEN
    v_result := v_result || jsonb_build_object('admin_verifier_name', v_admin_name);
  END IF;
  
  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_payment_details"("payment_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_payment_details"("payment_id" "uuid") IS 'Gets detailed payment information including user profile details for admin payment verification. Fixed to properly handle null verifier profiles without causing record is not assigned yet errors.';



CREATE OR REPLACE FUNCTION "public"."get_payments_with_user_details"() RETURNS SETOF "jsonb"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'user_name', CASE
      WHEN profiles.user_type = 'researcher' THEN rp.name
      WHEN profiles.user_type = 'organizer' THEN op.name_translations->>'ar'
      WHEN profiles.user_type = 'admin' THEN ap.name
      ELSE 'Unknown User'
    END,
    'user_email', '', -- Empty string instead of actual email
    'user_type', profiles.user_type,
    'profile_picture_url', CASE
      WHEN profiles.user_type = 'researcher' THEN rp.profile_picture_url
      WHEN profiles.user_type = 'organizer' THEN op.profile_picture_url
      ELSE NULL
    END,
    'amount', p.amount,
    'billing_period', p.billing_period,
    'payment_method_reported', p.payment_method_reported,
    'status', p.status,
    'reported_at', p.reported_at,
    'verified_at', p.verified_at,
    'admin_verifier_id', p.admin_verifier_id,
    'proof_document_path', p.proof_document_path,
    'has_proof_document', (p.proof_document_path IS NOT NULL),
    'reference_number', p.reference_number,
    'created_at', p.created_at
  )
  FROM payments p
  JOIN profiles ON p.user_id = profiles.id
  LEFT JOIN researcher_profiles rp ON profiles.id = rp.profile_id AND profiles.user_type = 'researcher'
  LEFT JOIN organizer_profiles op ON profiles.id = op.profile_id AND profiles.user_type = 'organizer'
  LEFT JOIN admin_profiles ap ON profiles.id = ap.profile_id AND profiles.user_type = 'admin';
END;$$;


ALTER FUNCTION "public"."get_payments_with_user_details"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_payments_with_user_details"() IS 'Returns a view-like result of payments with user information for admin payment listing without accessing auth.users.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "who_organizes_translations" "jsonb" NOT NULL,
    "event_name_translations" "jsonb" NOT NULL,
    "event_subtitle_translations" "jsonb",
    "problem_statement_translations" "jsonb" NOT NULL,
    "submission_guidelines_translations" "jsonb" NOT NULL,
    "event_axes_translations" "jsonb" NOT NULL,
    "event_objectives_translations" "jsonb" NOT NULL,
    "target_audience_translations" "jsonb",
    "scientific_committees_translations" "jsonb",
    "speakers_keynotes_translations" "jsonb",
    "event_type" "public"."event_type_enum" NOT NULL,
    "event_date" timestamp with time zone NOT NULL,
    "event_end_date" timestamp with time zone NOT NULL,
    "submission_verdict_deadline" timestamp with time zone NOT NULL,
    "wilaya_id" integer NOT NULL,
    "daira_id" integer NOT NULL,
    "format" "public"."event_format_enum" NOT NULL,
    "logo_url" "text",
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "website" "text",
    "price" numeric(10,2),
    "qr_code_url" "text",
    "brochure_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "abstract_submission_deadline" timestamp with time zone,
    "abstract_review_result_date" timestamp with time zone,
    "full_paper_submission_deadline" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "status" "public"."event_status_enum" DEFAULT 'published'::"public"."event_status_enum" NOT NULL,
    CONSTRAINT "check_abstract_review_after_abstract_submission" CHECK (("abstract_review_result_date" >= "abstract_submission_deadline")),
    CONSTRAINT "check_event_date_after_submission_verdict" CHECK (("event_date" >= "submission_verdict_deadline")),
    CONSTRAINT "check_event_dates" CHECK (("event_end_date" >= "event_date")),
    CONSTRAINT "check_full_paper_after_abstract_review" CHECK (("full_paper_submission_deadline" >= "abstract_review_result_date")),
    CONSTRAINT "check_submission_verdict_after_full_paper" CHECK (("submission_verdict_deadline" >= "full_paper_submission_deadline"))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON TABLE "public"."events" IS 'Core event information.';



COMMENT ON COLUMN "public"."events"."abstract_submission_deadline" IS 'Deadline for researchers to submit abstracts.';



COMMENT ON COLUMN "public"."events"."abstract_review_result_date" IS 'Date when abstract review results are announced.';



COMMENT ON COLUMN "public"."events"."full_paper_submission_deadline" IS 'Deadline for researchers with accepted abstracts to submit full papers.';



COMMENT ON COLUMN "public"."events"."status" IS 'Current lifecycle status of the event (published, abstract_review, full_paper_submission_open, full_paper_review, completed, canceled)';



CREATE OR REPLACE FUNCTION "public"."get_public_events"("p_limit" integer DEFAULT 10, "p_offset" integer DEFAULT 0) RETURNS SETOF "public"."events"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.events
    WHERE 
        status = 'published' AND
        deleted_at IS NULL
    ORDER BY event_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_public_events"("p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription_details"("target_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id UUID;
  v_subscription RECORD;
  v_profile RECORD;
  v_payments JSON;
  v_pricing JSON;
  v_result JSON;
  v_is_admin BOOLEAN;
BEGIN
  -- Determine target user (current user or specified user for admins)
  v_user_id := COALESCE(target_user_id, auth.uid());
  
  -- If target_user_id is provided, verify the current user is an admin
  IF target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN
    SELECT (user_type = 'admin') INTO v_is_admin FROM profiles WHERE id = auth.uid();
    
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Permission denied: Only admins can view other users'' subscription details';
    END IF;
  END IF;
  
  -- Get profile information
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  
  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Get subscription information
  SELECT * INTO v_subscription FROM subscriptions WHERE user_id = v_user_id;
  
  -- Get recent payments - Fixed query to avoid GROUP BY error
  SELECT json_agg(payment_data)
  INTO v_payments
  FROM (
    SELECT
      json_build_object(
        'id', p.id,
        'status', p.status,
        'amount', p.amount,
        'billing_period', p.billing_period,
        'payment_method', p.payment_method_reported,
        'reported_at', p.reported_at,
        'verified_at', p.verified_at,
        'reference_number', p.reference_number,
        'has_proof_document', (p.proof_document_path IS NOT NULL)
      ) AS payment_data
    FROM payments p
    WHERE p.user_id = v_user_id
    ORDER BY p.reported_at DESC
    LIMIT 5
  ) subquery;
  
  -- Get pricing information for the current subscription tier if available
  IF v_subscription IS NOT NULL AND v_subscription.tier != 'free' AND v_subscription.tier != 'trial' THEN
    -- Use a pricing tier corresponding to the user type
    v_pricing := public.get_subscription_pricing(
      v_profile.user_type,
      -- If no billing period info is directly associated with subscription, use monthly as default
      COALESCE(
        (SELECT billing_period FROM payments 
         WHERE subscription_id = v_subscription.id 
         ORDER BY verified_at DESC LIMIT 1),
        'monthly'::billing_period_enum
      )
    );
  END IF;
  
  -- Build the result JSON
  IF v_subscription IS NULL THEN
    -- User has no subscription record yet
    v_result := json_build_object(
      'has_subscription', false,
      'user_id', v_user_id,
      'user_type', v_profile.user_type,
      'profile', json_build_object(
        'is_verified', v_profile.is_verified,
        'user_type', v_profile.user_type
      ),
      'payments', COALESCE(v_payments, '[]'::json)
    );
  ELSE
    -- User has a subscription record
    v_result := json_build_object(
      'has_subscription', true,
      'user_id', v_user_id,
      'user_type', v_profile.user_type,
      'subscription', json_build_object(
        'id', v_subscription.id,
        'tier', v_subscription.tier,
        'status', v_subscription.status,
        'start_date', v_subscription.start_date,
        'end_date', v_subscription.end_date,
        'trial_ends_at', v_subscription.trial_ends_at,
        'days_remaining', 
          CASE 
            WHEN v_subscription.status = 'active' AND v_subscription.end_date IS NOT NULL 
            THEN GREATEST(0, EXTRACT(DAY FROM (v_subscription.end_date - NOW())))::INTEGER
            WHEN v_subscription.status = 'trial' AND v_subscription.trial_ends_at IS NOT NULL 
            THEN GREATEST(0, EXTRACT(DAY FROM (v_subscription.trial_ends_at - NOW())))::INTEGER
            ELSE 0
          END,
        'is_active', 
          (v_subscription.status = 'active' AND (v_subscription.end_date IS NULL OR v_subscription.end_date > NOW())) OR
          (v_subscription.status = 'trial' AND (v_subscription.trial_ends_at IS NULL OR v_subscription.trial_ends_at > NOW()))
      ),
      'profile', json_build_object(
        'is_verified', v_profile.is_verified,
        'user_type', v_profile.user_type
      ),
      'payments', COALESCE(v_payments, '[]'::json),
      'pricing', v_pricing
    );
  END IF;
  
  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_subscription_details"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_subscription_details"("target_user_id" "uuid") IS 'Gets comprehensive subscription details for a user, including subscription status, recent payments, and pricing information. Admins can retrieve details for any user.';



CREATE OR REPLACE FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_base_price NUMERIC;
  v_discount_percentage NUMERIC := 0;
  v_final_price NUMERIC;
  v_settings RECORD;
BEGIN
  -- Get pricing settings from app_settings
  SELECT * INTO v_settings FROM app_settings LIMIT 1;
  
  IF v_settings IS NULL THEN
    RAISE EXCEPTION 'App settings not configured';
  END IF;
  
  -- Get base price based on user type
  CASE user_type
    WHEN 'researcher' THEN
      v_base_price := COALESCE(v_settings.base_price_researcher_monthly, 2000); -- Default 2000 DZD if not set
    WHEN 'organizer' THEN
      v_base_price := COALESCE(v_settings.base_price_organizer_monthly, 3000); -- Default 3000 DZD if not set
    ELSE
      RAISE EXCEPTION 'Invalid user type for subscription pricing: %', user_type;
  END CASE;
  
  -- Get discount based on billing period
  CASE billing_period
    WHEN 'monthly' THEN
      v_discount_percentage := 0; -- No discount for monthly
    WHEN 'quarterly' THEN
      v_discount_percentage := COALESCE(v_settings.discount_quarterly, 5); -- Default 5% if not set
    WHEN 'biannual' THEN
      v_discount_percentage := COALESCE(v_settings.discount_biannual, 10); -- Default 10% if not set
    WHEN 'annual' THEN
      v_discount_percentage := COALESCE(v_settings.discount_annual, 15); -- Default 15% if not set
    ELSE
      RAISE EXCEPTION 'Invalid billing period: %', billing_period;
  END CASE;
  
  -- Calculate final price
  -- For periods other than monthly, multiply by number of months
  CASE billing_period
    WHEN 'monthly' THEN
      v_final_price := v_base_price;
    WHEN 'quarterly' THEN
      v_final_price := v_base_price * 3 * (1 - (v_discount_percentage / 100));
    WHEN 'biannual' THEN
      v_final_price := v_base_price * 6 * (1 - (v_discount_percentage / 100));
    WHEN 'annual' THEN
      v_final_price := v_base_price * 12 * (1 - (v_discount_percentage / 100));
  END CASE;
  
  -- Round to nearest whole number
  v_final_price := ROUND(v_final_price);
  
  -- Return pricing information
  RETURN json_build_object(
    'base_price_monthly', v_base_price,
    'billing_period', billing_period,
    'discount_percentage', v_discount_percentage,
    'number_of_months', CASE
      WHEN billing_period = 'monthly' THEN 1
      WHEN billing_period = 'quarterly' THEN 3
      WHEN billing_period = 'biannual' THEN 6
      WHEN billing_period = 'annual' THEN 12
    END,
    'price_before_discount', CASE
      WHEN billing_period = 'monthly' THEN v_base_price
      WHEN billing_period = 'quarterly' THEN v_base_price * 3
      WHEN billing_period = 'biannual' THEN v_base_price * 6
      WHEN billing_period = 'annual' THEN v_base_price * 12
    END,
    'discount_amount', CASE
      WHEN billing_period = 'monthly' THEN 0
      WHEN billing_period = 'quarterly' THEN (v_base_price * 3 * v_discount_percentage / 100)
      WHEN billing_period = 'biannual' THEN (v_base_price * 6 * v_discount_percentage / 100)
      WHEN billing_period = 'annual' THEN (v_base_price * 12 * v_discount_percentage / 100)
    END,
    'final_price', v_final_price,
    'currency', 'DZD',
    'user_type', user_type
  );
END;
$$;


ALTER FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") IS 'Calculates subscription pricing based on user type and billing period, applying appropriate discounts from app_settings.';



CREATE OR REPLACE FUNCTION "public"."handle_event_deadline_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only proceed if relevant deadline fields were updated
    IF OLD.abstract_submission_deadline IS DISTINCT FROM NEW.abstract_submission_deadline OR 
       OLD.abstract_review_result_date IS DISTINCT FROM NEW.abstract_review_result_date OR
       OLD.full_paper_submission_deadline IS DISTINCT FROM NEW.full_paper_submission_deadline OR
       OLD.submission_verdict_deadline IS DISTINCT FROM NEW.submission_verdict_deadline OR
       OLD.event_date IS DISTINCT FROM NEW.event_date OR
       OLD.event_end_date IS DISTINCT FROM NEW.event_end_date THEN
        -- Call the function to update status based on the new dates
        PERFORM public.update_event_status_based_on_date();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_event_deadline_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_type public.user_type_enum;
  v_raw_user_meta_data jsonb;
BEGIN
  -- Get user_type from raw_user_meta_data if available
  v_raw_user_meta_data := NEW.raw_user_meta_data;
  IF v_raw_user_meta_data IS NOT NULL AND v_raw_user_meta_data ? 'user_type' THEN
    CASE (v_raw_user_meta_data->>'user_type')
      WHEN 'researcher' THEN
        v_user_type := 'researcher';
      WHEN 'organizer' THEN
        v_user_type := 'organizer';
      ELSE
        -- Default to researcher if an unexpected value is provided
        RAISE WARNING 'Unexpected user_type value % provided in raw_user_meta_data. Defaulting to researcher.', v_raw_user_meta_data->>'user_type';
        v_user_type := 'researcher';
    END CASE;
  ELSE
    -- Default to researcher if raw_user_meta_data or user_type is missing
    RAISE WARNING 'raw_user_meta_data or user_type field is missing. Defaulting to researcher.';
    v_user_type := 'researcher';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (id, user_type, is_verified)
  VALUES (NEW.id, v_user_type, false); -- is_verified defaults to false

  -- Insert into public.subscriptions with a 1-month trial
  INSERT INTO public.subscriptions (user_id, tier, status, trial_ends_at)
  VALUES (NEW.id, 'trial', 'trial', timezone('utc', now()) + interval '1 month');

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Handles new user signup: creates a profile with user_type from metadata and a 1-month trial subscription.';



CREATE OR REPLACE FUNCTION "public"."handle_notification_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Categorize notification type based on template_key
  CASE NEW.template_key
    WHEN 'admin_invitation' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_received_pending_verification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_verified_notification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'payment_rejected_notification' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'subscription_activated' THEN
      NEW.notification_type := 'immediate'::public.notification_type_enum;
    WHEN 'user_verified_badge_awarded' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'user_verified_badge_removed' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'trial_ending_soon' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    WHEN 'trial_expired' THEN
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
    ELSE
      NEW.notification_type := 'scheduled'::public.notification_type_enum;
  END CASE;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_notification_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_payment_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Proceed if status changed
  IF OLD.status != NEW.status THEN
    -- For verified payments - queue notification email
    IF NEW.status = 'verified' THEN
      -- Queue only the payment verified notification (removed subscription_activated notification)
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data,
        notification_type
      ) VALUES (
        'payment_verified_notification',
        NEW.user_id,
        'pending',
        0,
        jsonb_build_object(
          'payment_id', NEW.id,
          'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), -- Fix: Cast UUID to TEXT
          'amount', NEW.amount,
          'payment_method', NEW.payment_method_reported,
          'billing_period', NEW.billing_period,
          'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
          'verified_date', to_char(NEW.verified_at, 'YYYY-MM-DD'),
          -- Will be populated in following trigger
          'subscription_tier', 'pending',
          'start_date', 'pending',
          'end_date', 'pending'
        ),
        'immediate'
      );
    ELSIF NEW.status = 'rejected' THEN
      -- Queue the payment rejected notification
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data,
        notification_type
      ) VALUES (
        'payment_rejected_notification',
        NEW.user_id,
        'pending',
        0,
        jsonb_build_object(
          'payment_id', NEW.id,
          'reference_number', COALESCE(NEW.reference_number, NEW.id::TEXT), -- Fix: Cast UUID to TEXT
          'amount', NEW.amount,
          'reported_date', to_char(NEW.reported_at, 'YYYY-MM-DD'),
          'rejection_reason', COALESCE(NEW.rejection_reason, 'The payment could not be verified.'),
          'support_email', 'support@eventy360.dz'
        ),
        'immediate'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_payment_notification"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_payment_notification"() IS 'Handles payment notification emails. Queues messages for verified and rejected payments.';



CREATE OR REPLACE FUNCTION "public"."handle_payment_reported"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Queue notification email for payment pending verification
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'payment_received_pending_verification',
    NEW.user_id,
    'pending',
    0,
    jsonb_build_object(
      'payment_id', NEW.id,
      'amount', NEW.amount,
      'reported_at', NEW.reported_at,
      'payment_method', NEW.payment_method_reported,
      'billing_period', NEW.billing_period,
      'reference_number', NEW.id  -- Using payment ID as reference number
    ),
    'immediate'  -- Process this immediately
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_payment_reported"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_payment_verification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_subscription_id UUID;
  v_user_current_subscription RECORD;
  v_new_end_date TIMESTAMPTZ;
  v_calculated_interval INTERVAL;
  v_user_type public.user_type_enum;
  v_new_tier public.subscription_tier_enum;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'verified' AND NEW.status = 'verified' THEN
    RAISE NOTICE 'Payment verified for user %: Processing subscription update', NEW.user_id;
    
    -- Get the user type to determine subscription tier
    SELECT P.user_type INTO v_user_type FROM public.profiles P WHERE P.id = NEW.user_id;

    IF v_user_type IS NULL THEN
      RAISE WARNING 'No profile found for user_id: %', NEW.user_id;
      RETURN NEW;
    END IF;

    -- Set the appropriate tier based on user type
    IF v_user_type = 'researcher' THEN
      v_new_tier := 'paid_researcher';
    ELSIF v_user_type = 'organizer' THEN
      v_new_tier := 'paid_organizer';
    ELSE
      v_new_tier := 'free';
    END IF;
    
    -- Calculate subscription period
    v_calculated_interval := billing_period_to_interval(NEW.billing_period);
    RAISE NOTICE 'Calculated interval for % is %', NEW.billing_period, v_calculated_interval;

    -- Get current subscription if exists
    SELECT * INTO v_user_current_subscription
    FROM public.subscriptions
    WHERE user_id = NEW.user_id;

    -- Handle subscription creation or update
    IF v_user_current_subscription IS NULL THEN
      -- No existing subscription, create new one
      v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
      INSERT INTO public.subscriptions (user_id, tier, status, start_date, end_date, trial_ends_at)
      VALUES (NEW.user_id, v_new_tier, 'active', COALESCE(NEW.verified_at, timezone('utc'::text, now())), v_new_end_date, NULL)
      RETURNING id INTO v_subscription_id;
      
      RAISE NOTICE 'Created new subscription % for user %', v_subscription_id, NEW.user_id;
    ELSE
      -- Existing subscription found
      v_subscription_id := v_user_current_subscription.id;
      RAISE NOTICE 'Found existing subscription % for user % with status %', 
        v_subscription_id, NEW.user_id, v_user_current_subscription.status;
      
      IF v_user_current_subscription.status = 'trial' OR v_user_current_subscription.status = 'expired' THEN
        -- Update from trial/expired to active
        v_new_end_date := COALESCE(NEW.verified_at, timezone('utc'::text, now())) + v_calculated_interval;
        UPDATE public.subscriptions
        SET
          tier = v_new_tier,
          status = 'active',
          start_date = COALESCE(NEW.verified_at, timezone('utc'::text, now())),
          end_date = v_new_end_date,
          trial_ends_at = NULL,
          updated_at = timezone('utc'::text, now())
        WHERE id = v_subscription_id;
        
        RAISE NOTICE 'Updated subscription from %: new end date is %', 
          v_user_current_subscription.status, v_new_end_date;
      ELSIF v_user_current_subscription.status = 'active' THEN
        -- Extend active subscription
        v_new_end_date := v_user_current_subscription.end_date + v_calculated_interval;
        UPDATE public.subscriptions
        SET
          tier = v_new_tier,
          end_date = v_new_end_date,
          updated_at = timezone('utc'::text, now())
        WHERE id = v_subscription_id;
        
        RAISE NOTICE 'Extended active subscription to %', v_new_end_date;
      ELSE
        RAISE WARNING 'Payment verified for user % with unhandled subscription status: %', 
          NEW.user_id, v_user_current_subscription.status;
        RETURN NEW;
      END IF;
    END IF;

    -- Link payment to subscription
    UPDATE public.payments
    SET subscription_id = v_subscription_id
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Linked payment % to subscription %', NEW.id, v_subscription_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_payment_verification"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_payment_verification"() IS 'Updates subscription status when a payment is verified. Called by on_payment_verified_update_subscription trigger.';



CREATE OR REPLACE FUNCTION "public"."handle_profile_verification_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only proceed if is_verified status changed
  IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
    -- Log the admin action with proper enum casting
    INSERT INTO admin_actions_log (
      action_type,
      admin_user_id,
      target_user_id,
      details
    ) VALUES (
      CASE 
        WHEN NEW.is_verified = TRUE THEN 'awarded_badge'::admin_action_type
        ELSE 'removed_badge'::admin_action_type
      END,
      auth.uid(),
      NEW.id,
      jsonb_build_object(
        'previous_status', OLD.is_verified,
        'new_status', NEW.is_verified
      )
    );
    
    -- Check if a notification with the same template was recently created
    -- This prevents duplicate emails when triggered by verification_request status changes
    IF NOT EXISTS (
      SELECT 1 FROM notification_queue 
      WHERE recipient_profile_id = NEW.id 
      AND template_key = CASE 
          WHEN NEW.is_verified = TRUE THEN 'user_verified_badge_awarded'
          ELSE 'user_verified_badge_removed'
        END
      AND created_at > (NOW() - INTERVAL '30 seconds')
    ) THEN
      -- No recent notification found, safe to create a new one
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        status,
        attempts,
        payload_data
      ) VALUES (
        CASE 
          WHEN NEW.is_verified = TRUE THEN 'user_verified_badge_awarded'
          ELSE 'user_verified_badge_removed'
        END,
        NEW.id,
        'pending',
        0,
        jsonb_build_object(
          'profile_id', NEW.id,
          'verification_status', NEW.is_verified,
          'timestamp', now()
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_profile_verification_change"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_profile_verification_change"() IS 'Handles profile verification status changes and logs admin actions. Includes duplicate notification prevention logic to prevent multiple emails when verification requests are approved.';



CREATE OR REPLACE FUNCTION "public"."handle_verification_request_processing"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  action_type admin_action_type;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set the processed_at and processed_by fields
    NEW.processed_at := NOW();
    NEW.processed_by := auth.uid();
    NEW.updated_at := NOW();
    
    -- Determine the action type based on the new status
    IF NEW.status = 'approved' THEN
      action_type := 'awarded_badge';
      
      -- Update the profile's is_verified status to true
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      action_type := 'processed_verification_request';
    END IF;
    
    -- Log the admin action
    INSERT INTO admin_actions_log (
      action_type,
      admin_user_id,
      target_user_id,
      target_entity_id,
      target_entity_type,
      details
    ) VALUES (
      action_type,
      auth.uid(),
      NEW.user_id,
      NEW.id,
      'verification_request',
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'document_path', NEW.document_path,
        'rejection_reason', NEW.rejection_reason
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_verification_request_processing"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_verification_request_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  template_key TEXT;
  action_type admin_action_type;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine which template and action type to use based on the new status
    IF NEW.status = 'approved' THEN
      template_key := 'user_verified_badge_awarded';
      action_type := 'awarded_badge';
      
      -- Update the profile's is_verified status to true
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      template_key := 'user_verified_badge_removed';
      action_type := 'removed_badge';
    END IF;
    
    -- Add to notification queue if template was determined
    IF template_key IS NOT NULL THEN
      INSERT INTO notification_queue (
        template_key,
        recipient_profile_id,
        notification_type,
        status,
        attempts,
        payload_data
      ) VALUES (
        template_key,
        NEW.user_id,
        'immediate',
        'pending',
        0,
        jsonb_build_object(
          'profile_id', NEW.user_id,
          'verification_request_id', NEW.id,
          'verification_status', (NEW.status = 'approved'),
          'timestamp', now(),
          'rejection_reason', COALESCE(NEW.rejection_reason, 'Your verification documents did not meet our requirements.')
        )
      );
      
      -- Log the admin action with more detailed context
      INSERT INTO admin_actions_log (
        action_type,
        admin_user_id,
        target_user_id,
        target_entity_id,
        target_entity_type,
        details
      ) VALUES (
        action_type,
        auth.uid(),
        NEW.user_id,
        NEW.id,
        'verification_request',
        jsonb_build_object(
          'previous_status', OLD.status,
          'new_status', NEW.status,
          'document_path', NEW.document_path,
          'rejection_reason', NEW.rejection_reason,
          'notes', NEW.notes
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_verification_request_status_change"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_verification_request_status_change"() IS 'Processes verification request status changes, properly casting action_type to admin_action_type enum.';



CREATE OR REPLACE FUNCTION "public"."handle_verification_request_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Add notification to queue for verification request submission
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    notification_type,
    status,
    attempts,
    payload_data
  ) VALUES (
    'verification_request_submitted',
    NEW.user_id,
    'immediate',
    'pending',
    0,
    jsonb_build_object(
      'profile_id', NEW.user_id,
      'verification_request_id', NEW.id,
      'submission_date', to_char(NEW.submitted_at, 'YYYY-MM-DD HH24:MI:SS')
    )
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_verification_request_submission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles -- No need for public. prefix due to search_path
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Returns true if the currently authenticated user has the ''admin'' user_type in their profile.';



CREATE OR REPLACE FUNCTION "public"."notify_organizer_new_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only notify if the status is relevant and has changed
    IF (NEW.status IN ('abstract_submitted', 'full_paper_submitted')) AND 
       (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Get the event organizer and notify them of the new submission
        INSERT INTO public.notification_queue (
            recipient_profile_id,
            template_key,
            payload_data,
            status,
            process_after
        )
        SELECT
            e.created_by,
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'new_abstract_submission'
                WHEN 'full_paper_submitted' THEN 'new_full_paper_submission'
                ELSE NULL
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'event_id', NEW.event_id,
                'event_name', e.event_name_translations,
                'submission_title', NEW.title_translations,
                'researcher_name', (
                    SELECT name 
                    FROM public.researcher_profiles 
                    WHERE profile_id = NEW.submitted_by
                )
            ),
            'pending',
            NOW()
        FROM 
            public.events e
        WHERE 
            e.id = NEW.event_id AND
            -- Only proceed if we have a valid template for this status
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'new_abstract_submission'
                WHEN 'full_paper_submitted' THEN 'new_full_paper_submission'
                ELSE NULL
            END IS NOT NULL;
    END IF;
        
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_organizer_new_submission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_submission_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only notify if the status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Create a notification based on the new status
        INSERT INTO public.notification_queue (
            recipient_profile_id,
            template_key,
            payload_data,
            status,
            process_after
        )
        SELECT
            NEW.submitted_by,
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
                WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
                WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
                WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
                WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                WHEN 'revision_requested' THEN 'revision_requested_notification'
                WHEN 'completed' THEN 
                    CASE 
                        WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                        WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                        ELSE NULL
                    END
                ELSE NULL
            END,
            jsonb_build_object(
                'submission_id', NEW.id,
                'event_id', NEW.event_id,
                'event_name', (SELECT event_name_translations FROM public.events WHERE id = NEW.event_id),
                'submission_title', NEW.title_translations,
                'feedback', NEW.review_feedback_translations
            ),
            'pending',
            NOW()
        WHERE
            -- Only proceed if we have a valid template for this status
            CASE NEW.status
                WHEN 'abstract_submitted' THEN 'abstract_received_confirmation'
                WHEN 'abstract_accepted' THEN 'abstract_accepted_notification'
                WHEN 'abstract_rejected' THEN 'abstract_rejected_notification'
                WHEN 'full_paper_submitted' THEN 'full_paper_received_confirmation'
                WHEN 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                WHEN 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                WHEN 'revision_requested' THEN 'revision_requested_notification'
                WHEN 'completed' THEN 
                    CASE 
                        WHEN OLD.status = 'full_paper_accepted' THEN 'full_paper_accepted_notification'
                        WHEN OLD.status = 'full_paper_rejected' THEN 'full_paper_rejected_notification'
                        ELSE NULL
                    END
                ELSE NULL
            END IS NOT NULL;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_submission_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."purge_expired_deletions"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Permanently delete events older than 7 days
    DELETE FROM public.events
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    
    -- Permanently delete submissions older than 7 days
    DELETE FROM public.submissions
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
END;
$$;


ALTER FUNCTION "public"."purge_expired_deletions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_trial_expiry_notification"("profile_id" "uuid", "days_remaining" integer, "template_key" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    template_key,
    profile_id,
    'pending',
    0,
    jsonb_build_object(
      'profile_id', profile_id,
      'days_remaining', days_remaining,
      'timestamp', now()
    ),
    'scheduled'
  );
END;
$$;


ALTER FUNCTION "public"."queue_trial_expiry_notification"("profile_id" "uuid", "days_remaining" integer, "template_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum" DEFAULT 'cash'::"public"."payment_method_enum", "admin_notes" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID := auth.uid();
  v_details JSONB;
  v_payment_id UUID;
  v_log_id BIGINT;
  v_subscription_id UUID;
  v_target_user_record RECORD;
BEGIN
  -- Check if the user is an admin
  SELECT (user_type = 'admin') INTO v_is_admin FROM profiles WHERE id = v_user_id;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied: Only admins can record manual payments';
  END IF;
  
  -- Validate target user exists
  SELECT * INTO v_target_user_record FROM profiles WHERE id = target_user_id;
  IF v_target_user_record IS NULL THEN
    RAISE EXCEPTION 'Target user not found with ID: %', target_user_id;
  END IF;
  
  -- Validate amount
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;
  
  -- Build details for logging
  v_details := jsonb_build_object(
    'amount', amount,
    'billing_period', billing_period,
    'payment_method', payment_method,
    'admin_notes', admin_notes,
    'is_manual_entry', true
  );
  
  -- Create a verified payment record (skipping the verification step)
  INSERT INTO payments (
    user_id,
    amount,
    billing_period,
    payment_method_reported,
    status,
    admin_verifier_id,
    admin_notes,
    verified_at
  ) VALUES (
    target_user_id,
    amount,
    billing_period,
    payment_method,
    'verified',
    v_user_id,
    admin_notes,
    NOW()
  ) RETURNING id INTO v_payment_id;
  
  -- Log the admin action
  INSERT INTO admin_actions_log (
    admin_user_id,
    action_type,
    target_user_id,
    target_entity_id,
    target_entity_type,
    details
  ) VALUES (
    v_user_id,
    'recorded_payment',
    target_user_id,
    v_payment_id,
    'payment',
    v_details
  ) RETURNING id INTO v_log_id;
  
  -- Get the subscription ID created/updated by the payment verification trigger
  SELECT subscription_id INTO v_subscription_id FROM payments WHERE id = v_payment_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Manual payment recorded successfully',
    'payment_id', v_payment_id,
    'subscription_id', v_subscription_id,
    'log_id', v_log_id,
    'user_id', target_user_id,
    'amount', amount,
    'billing_period', billing_period
  );
END;
$$;


ALTER FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum", "admin_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum", "admin_notes" "text") IS 'Admin function to record a manual payment, creating a verified payment record directly. Logs the action to admin_actions_log.';



CREATE OR REPLACE FUNCTION "public"."restore_event"("p_event_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_exists BOOLEAN;
    v_is_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_grace_period_expired BOOLEAN;
BEGIN
    -- Check if the event exists and is soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND deleted_at IS NOT NULL),
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND created_by = auth.uid()),
        EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'),
        EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id AND deleted_at < NOW() - INTERVAL '7 days')
    INTO 
        v_event_exists, v_is_owner, v_is_admin, v_grace_period_expired;
    
    IF NOT v_event_exists THEN
        RAISE EXCEPTION 'Event not found or not deleted';
    END IF;
    
    IF NOT (v_is_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to restore this event';
    END IF;
    
    IF v_grace_period_expired AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Grace period expired, only admin can restore';
    END IF;
    
    -- Perform restore
    UPDATE public.events 
    SET 
        deleted_at = NULL,
        updated_at = NOW()
    WHERE 
        id = p_event_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."restore_event"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_submission"("p_submission_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_submission_exists BOOLEAN;
    v_is_author BOOLEAN;
    v_is_event_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_grace_period_expired BOOLEAN;
    v_event_id UUID;
BEGIN
    -- Check if the submission exists and is soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at IS NOT NULL),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND submitted_by = auth.uid()),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at < NOW() - INTERVAL '7 days'),
        event_id
    INTO 
        v_submission_exists, v_is_author, v_grace_period_expired, v_event_id
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF NOT v_submission_exists THEN
        RAISE EXCEPTION 'Submission not found or not deleted';
    END IF;
    
    -- Check if the user is the event owner
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = v_event_id AND created_by = auth.uid()
    ) INTO v_is_event_owner;
    
    -- Check if the user is an admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_author OR v_is_event_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to restore this submission';
    END IF;
    
    IF v_grace_period_expired AND NOT v_is_admin THEN
        RAISE EXCEPTION 'Grace period expired, only admin can restore';
    END IF;
    
    -- Perform restore
    UPDATE public.submissions 
    SET 
        deleted_at = NULL,
        updated_at = NOW()
    WHERE 
        id = p_submission_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."restore_submission"("p_submission_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
    v_version_id UUID;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.abstract_status, s.current_abstract_version_id
    INTO v_event_id, v_event_organizer, v_current_status, v_version_id
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can review abstracts';
    END IF;
    
    -- Check if the current status allows for review
    IF v_current_status != 'abstract_submitted' THEN
        RAISE EXCEPTION 'Abstract is not in a reviewable state';
    END IF;
    
    -- Check if the new status is valid for abstract review
    IF p_status NOT IN ('abstract_accepted', 'abstract_rejected') THEN
        RAISE EXCEPTION 'Invalid status for abstract review';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET 
        abstract_status = p_status,
        status = p_status,
        review_feedback_translations = p_feedback_translations
    WHERE id = p_submission_id;
    
    -- Update the version record with feedback
    UPDATE public.submission_versions
    SET feedback_translations = p_feedback_translations
    WHERE id = v_version_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', p_status,
        'action', 'review_abstract',
        'actor', auth.uid(),
        'feedback', p_feedback_translations,
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") IS 'Function for event organizers to review an abstract (accept or reject) with feedback.';



CREATE OR REPLACE FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_event_organizer UUID;
    v_current_status public.submission_status_enum;
    v_version_id UUID;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT s.event_id, e.created_by, s.full_paper_status, s.current_full_paper_version_id
    INTO v_event_id, v_event_organizer, v_current_status, v_version_id
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Check if the user is the event organizer
    IF auth.uid() != v_event_organizer THEN
        RAISE EXCEPTION 'Only the event organizer can review papers';
    END IF;
    
    -- Check if the current status allows for review
    IF v_current_status NOT IN ('full_paper_submitted', 'revision_requested') THEN
        RAISE EXCEPTION 'Paper is not in a reviewable state';
    END IF;
    
    -- Check if the new status is valid for full paper review
    IF p_status NOT IN ('full_paper_accepted', 'full_paper_rejected', 'revision_requested') THEN
        RAISE EXCEPTION 'Invalid status for full paper review';
    END IF;
    
    -- Update the submission status
    UPDATE public.submissions
    SET 
        full_paper_status = p_status,
        status = p_status,
        review_feedback_translations = p_feedback_translations
    WHERE id = p_submission_id;
    
    -- Update the version record with feedback
    UPDATE public.submission_versions
    SET feedback_translations = p_feedback_translations
    WHERE id = v_version_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', p_status,
        'action', 'review_full_paper',
        'actor', auth.uid(),
        'feedback', p_feedback_translations,
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") IS 'Function for event organizers to review a full paper (accept, reject, or request revision) with feedback.';



CREATE OR REPLACE FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer DEFAULT 20, "offset_count" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "event_name" "text", "event_subtitle" "text", "event_date" timestamp with time zone, "event_end_date" timestamp with time zone, "wilaya_name" "text", "daira_name" "text", "organizer_name" "text", "topics" "text"[], "status" "public"."event_status_enum", "format" "public"."event_format_enum", "logo_url" "text", "abstract_submission_deadline" timestamp with time zone, "rank" real)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer, "offset_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer, "offset_count" integer) IS 'Full-text search for events in Arabic with relevance ranking';



CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;


ALTER FUNCTION "public"."set_current_timestamp_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_submission_version_number"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Get the highest version number for this submission and increment it
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.submission_versions
    WHERE submission_id = NEW.submission_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_submission_version_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_event"("p_event_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_exists BOOLEAN;
    v_is_owner BOOLEAN;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if the event exists and not already soft-deleted
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = p_event_id AND deleted_at IS NULL
    ) INTO v_event_exists;
    
    IF NOT v_event_exists THEN
        RAISE EXCEPTION 'Event not found or already deleted';
    END IF;
    
    -- Check if the user is the owner or an admin
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = p_event_id AND created_by = auth.uid()
    ) INTO v_is_owner;
    
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to delete this event';
    END IF;
    
    -- Perform soft delete
    UPDATE public.events 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = p_event_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."soft_delete_event"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_submission"("p_submission_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_submission_exists BOOLEAN;
    v_is_author BOOLEAN;
    v_is_event_owner BOOLEAN;
    v_is_admin BOOLEAN;
    v_event_id UUID;
BEGIN
    -- Check if the submission exists and not already soft-deleted
    SELECT 
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND deleted_at IS NULL),
        EXISTS(SELECT 1 FROM public.submissions WHERE id = p_submission_id AND submitted_by = auth.uid()),
        event_id
    INTO 
        v_submission_exists, v_is_author, v_event_id
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF NOT v_submission_exists THEN
        RAISE EXCEPTION 'Submission not found or already deleted';
    END IF;
    
    -- Check if the user is the event owner
    SELECT EXISTS(
        SELECT 1 FROM public.events 
        WHERE id = v_event_id AND created_by = auth.uid()
    ) INTO v_is_event_owner;
    
    -- Check if the user is an admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    ) INTO v_is_admin;
    
    IF NOT (v_is_author OR v_is_event_owner OR v_is_admin) THEN
        RAISE EXCEPTION 'Unauthorized to delete this submission';
    END IF;
    
    -- Perform soft delete
    UPDATE public.submissions 
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = p_submission_id;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."soft_delete_submission"("p_submission_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_status public.event_status_enum;
    v_submission_id UUID;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the event exists and get its status
    SELECT status, abstract_submission_deadline INTO v_event_status, v_event_deadline
    FROM public.events
    WHERE id = p_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Check if the event is accepting abstract submissions
    IF v_event_status != 'published' THEN
        RAISE EXCEPTION 'Event is not accepting abstract submissions';
    END IF;
    
    -- Check if the deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Abstract submission deadline has passed';
    END IF;
    
    -- Create a new submission
    INSERT INTO public.submissions (
        event_id,
        submitted_by,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        status,
        abstract_status
    ) VALUES (
        p_event_id,
        auth.uid(),
        p_title_translations,
        p_abstract_translations,
        p_abstract_file_url,
        p_abstract_file_metadata,
        'abstract_submitted',
        'abstract_submitted'
    ) RETURNING id INTO v_submission_id;
    
    -- Create the first version record
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata
    ) VALUES (
        v_submission_id,
        1,
        p_title_translations,
        p_abstract_translations,
        p_abstract_file_url,
        p_abstract_file_metadata
    ) RETURNING id INTO v_version_id;
    
    -- Update the submission with the current version ID
    UPDATE public.submissions
    SET current_abstract_version_id = v_version_id
    WHERE id = v_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'abstract_submitted',
        'action', 'submit_abstract',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = v_submission_id;
    
    RETURN v_submission_id;
END;
$$;


ALTER FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") IS 'Function for researchers to submit an abstract to an event. Creates a new submission and version record.';



CREATE OR REPLACE FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_event_status public.event_status_enum;
    v_submission_status public.submission_status_enum;
    v_abstract_version_id UUID;
    v_version_number INT;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT 
        s.event_id, 
        e.status, 
        s.abstract_status,
        s.current_abstract_version_id,
        e.full_paper_submission_deadline
    INTO 
        v_event_id, 
        v_event_status, 
        v_submission_status,
        v_abstract_version_id,
        v_event_deadline
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id AND s.submitted_by = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or you are not the author';
    END IF;

    -- Check if the event is accepting full papers
    IF v_event_status != 'full_paper_submission_open' THEN
        RAISE EXCEPTION 'Event is not accepting full papers';
    END IF;

    -- Check if the abstract was accepted
    IF v_submission_status != 'abstract_accepted' THEN
        RAISE EXCEPTION 'Cannot submit full paper: abstract was not accepted';
    END IF;

    -- Check if the deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Full paper submission deadline has passed';
    END IF;

    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.submission_versions
    WHERE submission_id = p_submission_id;

    -- Get the abstract details from the current abstract version
    WITH abstract_version AS (
        SELECT 
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata
        FROM public.submission_versions
        WHERE id = v_abstract_version_id
    )
    -- Create a new version record with both abstract and full paper
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        full_paper_file_url,
        full_paper_file_metadata
    )
    SELECT
        p_submission_id,
        v_version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        p_full_paper_file_url,
        p_full_paper_file_metadata
    FROM abstract_version
    RETURNING id INTO v_version_id;

    -- Update the submission with the full paper and current version
    UPDATE public.submissions
    SET 
        full_paper_file_url = p_full_paper_file_url,
        full_paper_file_metadata = p_full_paper_file_metadata,
        current_full_paper_version_id = v_version_id,
        status = 'full_paper_submitted',
        full_paper_status = 'full_paper_submitted'
    WHERE id = p_submission_id;

    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'full_paper_submitted',
        'action', 'submit_full_paper',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;

    RETURN v_version_id;
END;
$$;


ALTER FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") IS 'Function for researchers to submit a full paper for an accepted abstract. Creates a new version record.';



CREATE OR REPLACE FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_submission_status public.submission_status_enum;
    v_abstract_version_id UUID;
    v_version_number INT;
    v_version_id UUID;
    v_event_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the submission exists and get its current status
    SELECT 
        s.event_id, 
        s.full_paper_status,
        s.current_abstract_version_id,
        e.revision_deadline
    INTO 
        v_event_id, 
        v_submission_status,
        v_abstract_version_id,
        v_event_deadline
    FROM public.submissions s
    JOIN public.events e ON s.event_id = e.id
    WHERE s.id = p_submission_id AND s.submitted_by = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found or you are not the author';
    END IF;
    
    -- Check if revision was requested
    IF v_submission_status != 'revision_requested' THEN
        RAISE EXCEPTION 'Cannot submit revision: revision was not requested';
    END IF;
    
    -- Check if the revision deadline has passed
    IF v_event_deadline IS NOT NULL AND v_event_deadline < NOW() THEN
        RAISE EXCEPTION 'Revision deadline has passed';
    END IF;
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM public.submission_versions
    WHERE submission_id = p_submission_id;
    
    -- Get the abstract details from the current abstract version
    WITH abstract_version AS (
        SELECT 
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata
        FROM public.submission_versions
        WHERE id = v_abstract_version_id
    )
    
    -- Create a new version record with both abstract and revised full paper
    INSERT INTO public.submission_versions (
        submission_id,
        version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        full_paper_file_url,
        full_paper_file_metadata
    )
    SELECT
        p_submission_id,
        v_version_number,
        title_translations,
        abstract_translations,
        abstract_file_url,
        abstract_file_metadata,
        p_full_paper_file_url,
        p_full_paper_file_metadata
    FROM abstract_version
    RETURNING id INTO v_version_id;
    
    -- Update the submission with the revised paper and current version
    UPDATE public.submissions
    SET 
        full_paper_file_url = p_full_paper_file_url,
        full_paper_file_metadata = p_full_paper_file_metadata,
        current_full_paper_version_id = v_version_id,
        status = 'revision_under_review',
        full_paper_status = 'revision_under_review'
    WHERE id = p_submission_id;
    
    -- Add to feedback history
    UPDATE public.submissions
    SET feedback_history = COALESCE(feedback_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', EXTRACT(EPOCH FROM NOW()),
        'status', 'revision_under_review',
        'action', 'submit_revision',
        'actor', auth.uid(),
        'version_id', v_version_id
    )::jsonb
    WHERE id = p_submission_id;
    
    RETURN v_version_id;
END;
$$;


ALTER FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") IS 'Function for researchers to submit a revised paper after revision was requested. Creates a new version record.';



CREATE OR REPLACE FUNCTION "public"."sync_submission_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Always set a consistent status based on the workflow stage
    -- For new rows or updates
    
    -- First handle full paper status if it exists (higher priority)
    IF NEW.full_paper_status IS NOT NULL THEN
        NEW.status = NEW.full_paper_status;
    -- Then fall back to abstract status
    ELSIF NEW.abstract_status IS NOT NULL THEN
        NEW.status = NEW.abstract_status;
    END IF;
    
    -- If somehow both are NULL, status will be NULL too
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_submission_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_submission_versions"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only save a version if relevant fields change
    IF TG_OP = 'UPDATE' AND (
        OLD.title_translations IS DISTINCT FROM NEW.title_translations OR
        OLD.abstract_translations IS DISTINCT FROM NEW.abstract_translations OR
        OLD.abstract_file_url IS DISTINCT FROM NEW.abstract_file_url OR
        OLD.abstract_file_metadata IS DISTINCT FROM NEW.abstract_file_metadata OR
        OLD.full_paper_file_url IS DISTINCT FROM NEW.full_paper_file_url OR
        OLD.full_paper_file_metadata IS DISTINCT FROM NEW.full_paper_file_metadata OR
        OLD.status IS DISTINCT FROM NEW.status
    ) THEN
        -- Insert a new version record
        INSERT INTO public.submission_versions (
            submission_id,
            title_translations,
            abstract_translations,
            abstract_file_url,
            abstract_file_metadata,
            full_paper_file_url,
            full_paper_file_metadata,
            feedback_translations
        ) VALUES (
            OLD.id,
            OLD.title_translations,
            OLD.abstract_translations,
            OLD.abstract_file_url,
            OLD.abstract_file_metadata,
            OLD.full_paper_file_url,
            OLD.full_paper_file_metadata,
            OLD.review_feedback_translations
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_submission_versions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_status_based_on_date"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Check for events that should transition to abstract_review status
    -- (current time has passed the abstract_submission_deadline)
    UPDATE public.events
    SET 
        status = 'abstract_review',
        updated_at = NOW()
    WHERE 
        status = 'published' AND
        abstract_submission_deadline < NOW();

    -- Check for events that should transition to full_paper_submission_open status
    -- (current time has passed the abstract_review_result_date)
    UPDATE public.events
    SET 
        status = 'full_paper_submission_open',
        updated_at = NOW()
    WHERE 
        status = 'abstract_review' AND
        abstract_review_result_date < NOW();

    -- Check for events that should transition to full_paper_review status
    -- (current time has passed the full_paper_submission_deadline)
    UPDATE public.events
    SET 
        status = 'full_paper_review',
        updated_at = NOW()
    WHERE 
        status = 'full_paper_submission_open' AND
        full_paper_submission_deadline < NOW();

    -- Check for events that should transition to completed status
    -- (current time has passed the event_end_date)
    UPDATE public.events
    SET 
        status = 'completed',
        updated_at = NOW()
    WHERE 
        status IN ('published', 'abstract_review', 'full_paper_submission_open', 'full_paper_review') AND
        event_end_date < NOW();
END;
$$;


ALTER FUNCTION "public"."update_event_status_based_on_date"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text" DEFAULT NULL::"text", "rejection_reason" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_payment RECORD;
  v_is_admin BOOLEAN;
  v_user_id UUID := auth.uid();
  v_details JSONB;
  v_log_id BIGINT;
BEGIN
  -- Check if the user is an admin
  SELECT (user_type = 'admin') INTO v_is_admin FROM profiles WHERE id = v_user_id;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied: Only admins can verify payments';
  END IF;
  
  -- Get payment details
  SELECT * INTO v_payment FROM payments WHERE id = payment_id;
  
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'Payment not found with ID: %', payment_id;
  END IF;
  
  -- Validate status change
  IF v_payment.status != 'pending_verification' THEN
    RAISE EXCEPTION 'Payment is not in pending_verification status. Current status: %', v_payment.status;
  END IF;
  
  IF verify_status != 'verified' AND verify_status != 'rejected' THEN
    RAISE EXCEPTION 'Invalid status. Expected "verified" or "rejected", got: %', verify_status;
  END IF;
  
  -- If rejecting, ensure rejection reason is provided
  IF verify_status = 'rejected' AND rejection_reason IS NULL THEN
    RAISE EXCEPTION 'Rejection reason is required when rejecting a payment';
  END IF;
  
  -- Build details for logging
  v_details := jsonb_build_object(
    'previous_status', v_payment.status,
    'new_status', verify_status,
    'payment_amount', v_payment.amount,
    'billing_period', v_payment.billing_period,
    'payment_method', v_payment.payment_method_reported,
    'proof_document_path', v_payment.proof_document_path
  );
  
  IF rejection_reason IS NOT NULL THEN
    v_details := v_details || jsonb_build_object('rejection_reason', rejection_reason);
  END IF;
  
  -- Update payment status
  UPDATE payments SET
    status = verify_status,
    admin_notes = COALESCE(p_admin_notes, payments.admin_notes),
    admin_verifier_id = v_user_id,
    verified_at = CASE WHEN verify_status = 'verified' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = payment_id;
  
  -- Log the admin action
  -- Fixed: Explicitly cast string literals to admin_action_type enum
  INSERT INTO admin_actions_log (
    admin_user_id,
    action_type,
    target_user_id,
    target_entity_id,
    target_entity_type,
    details
  ) VALUES (
    v_user_id,
    CASE 
      WHEN verify_status = 'verified' THEN 'updated_payment_status'::admin_action_type
      WHEN verify_status = 'rejected' THEN 'updated_payment_status'::admin_action_type
    END,
    v_payment.user_id,
    payment_id,
    'payment',
    v_details
  ) RETURNING id INTO v_log_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Payment status updated to ' || verify_status,
    'payment_id', payment_id,
    'log_id', v_log_id
  );
END;
$$;


ALTER FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text", "rejection_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text", "rejection_reason" "text") IS 'Admin function to verify or reject a payment proof. Fixed ambiguous column reference and type casting issues. Logs the action to admin_actions_log.';



CREATE TABLE IF NOT EXISTS "public"."admin_actions_log" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "admin_user_id" "uuid",
    "action_type" "public"."admin_action_type" NOT NULL,
    "target_user_id" "uuid",
    "target_entity_id" "uuid",
    "target_entity_type" "text",
    "details" "jsonb",
    "ip_address" "inet"
);


ALTER TABLE "public"."admin_actions_log" OWNER TO "postgres";


ALTER TABLE "public"."admin_actions_log" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."admin_actions_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."admin_profiles" (
    "profile_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."admin_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_profiles" IS 'Extended profile information for admin users.';



CREATE TABLE IF NOT EXISTS "public"."organizer_profiles" (
    "profile_id" "uuid" NOT NULL,
    "name_translations" "jsonb" NOT NULL,
    "institution_type" "public"."institution_type_enum" NOT NULL,
    "bio_translations" "jsonb",
    "profile_picture_url" "text",
    "wilaya_id" integer NOT NULL,
    "daira_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "language" "text" DEFAULT 'ar'::"text" NOT NULL
);


ALTER TABLE "public"."organizer_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizer_profiles" IS 'Extended profile information for organizer users.';



COMMENT ON COLUMN "public"."organizer_profiles"."language" IS 'User preferred language (default: ar) for emails and notifications';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_type" "public"."user_type_enum" DEFAULT 'researcher'::"public"."user_type_enum" NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_extended_profile_complete" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Core user profile information linked to authentication, includes verification status.';



COMMENT ON COLUMN "public"."profiles"."is_verified" IS 'Whether the user account has been manually verified by an admin.';



COMMENT ON COLUMN "public"."profiles"."is_extended_profile_complete" IS 'Tracks if the user has completed the role-specific extended profile information after email confirmation. Controls access to full app features.';



CREATE TABLE IF NOT EXISTS "public"."researcher_profiles" (
    "profile_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "institution" "text" NOT NULL,
    "academic_position" "text",
    "bio_translations" "jsonb",
    "profile_picture_url" "text",
    "wilaya_id" integer NOT NULL,
    "daira_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "language" "text" DEFAULT 'ar'::"text" NOT NULL
);


ALTER TABLE "public"."researcher_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."researcher_profiles" IS 'Extended profile information for researcher users.';



COMMENT ON COLUMN "public"."researcher_profiles"."language" IS 'User preferred language (default: ar) for emails and notifications';



CREATE TABLE IF NOT EXISTS "public"."verification_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "document_path" "text" NOT NULL,
    "status" "public"."verification_request_status" DEFAULT 'pending'::"public"."verification_request_status" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "processed_by" "uuid",
    "rejection_reason" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verification_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."verification_requests" IS 'Stores verification requests submitted by organizers to get verified badge';



COMMENT ON COLUMN "public"."verification_requests"."document_path" IS 'Path to the document in the verification_documents bucket';



COMMENT ON COLUMN "public"."verification_requests"."status" IS 'Status of the verification request: pending, approved, or rejected';



COMMENT ON COLUMN "public"."verification_requests"."processed_at" IS 'When the request was processed by an admin';



COMMENT ON COLUMN "public"."verification_requests"."processed_by" IS 'Admin who processed the verification request';



COMMENT ON COLUMN "public"."verification_requests"."rejection_reason" IS 'Reason for rejection if the request was rejected';



CREATE OR REPLACE VIEW "public"."verification_request_details" AS
 SELECT "vr"."id",
    "vr"."user_id",
    "vr"."document_path",
    "vr"."status",
    "vr"."submitted_at",
    "vr"."processed_at",
    "vr"."processed_by",
    "vr"."rejection_reason",
    "vr"."notes",
    "p"."user_type",
    "p"."is_verified",
        CASE
            WHEN ("p"."user_type" = 'organizer'::"public"."user_type_enum") THEN COALESCE(("op"."name_translations" ->> 'ar'::"text"), ("op"."name_translations" ->> 'en'::"text"))
            WHEN ("p"."user_type" = 'researcher'::"public"."user_type_enum") THEN "rp"."name"
            ELSE 'Unknown'::"text"
        END AS "user_name",
        CASE
            WHEN ("p"."user_type" = 'organizer'::"public"."user_type_enum") THEN "op"."profile_picture_url"
            WHEN ("p"."user_type" = 'researcher'::"public"."user_type_enum") THEN "rp"."profile_picture_url"
            ELSE NULL::"text"
        END AS "profile_picture_url",
        CASE
            WHEN ("vr"."processed_by" IS NOT NULL) THEN COALESCE("admin_a"."name", 'Admin'::"text")
            ELSE NULL::"text"
        END AS "admin_name"
   FROM (((("public"."verification_requests" "vr"
     JOIN "public"."profiles" "p" ON (("vr"."user_id" = "p"."id")))
     LEFT JOIN "public"."organizer_profiles" "op" ON ((("p"."id" = "op"."profile_id") AND ("p"."user_type" = 'organizer'::"public"."user_type_enum"))))
     LEFT JOIN "public"."researcher_profiles" "rp" ON ((("p"."id" = "rp"."profile_id") AND ("p"."user_type" = 'researcher'::"public"."user_type_enum"))))
     LEFT JOIN "public"."admin_profiles" "admin_a" ON (("vr"."processed_by" = "admin_a"."profile_id")));


ALTER TABLE "public"."verification_request_details" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_verification_requests" AS
 SELECT "vrd"."id",
    "vrd"."user_id",
    "vrd"."document_path",
    "vrd"."status",
    "vrd"."submitted_at",
    "vrd"."processed_at",
    "vrd"."processed_by",
    "vrd"."rejection_reason",
    "vrd"."notes",
    "vrd"."user_type",
    "vrd"."is_verified",
    "vrd"."user_name",
    "vrd"."profile_picture_url",
    "vrd"."admin_name",
        CASE
            WHEN ("vrd"."status" = 'pending'::"public"."verification_request_status") THEN 'Pending Review'::"text"
            WHEN ("vrd"."status" = 'approved'::"public"."verification_request_status") THEN 'Approved'::"text"
            WHEN ("vrd"."status" = 'rejected'::"public"."verification_request_status") THEN 'Rejected'::"text"
            ELSE 'Unknown'::"text"
        END AS "status_label",
    (EXTRACT(epoch FROM ("now"() - "vrd"."submitted_at")) / (86400)::numeric) AS "days_pending"
   FROM "public"."verification_request_details" "vrd"
  ORDER BY
        CASE
            WHEN ("vrd"."status" = 'pending'::"public"."verification_request_status") THEN 0
            ELSE 1
        END, "vrd"."submitted_at" DESC;


ALTER TABLE "public"."admin_verification_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bank_name" "text",
    "account_holder" "text",
    "account_number_rib" "text",
    "payment_email" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "base_price_researcher_monthly" numeric DEFAULT 500 NOT NULL,
    "base_price_organizer_monthly" numeric DEFAULT 10000 NOT NULL,
    "discount_quarterly" numeric DEFAULT 0.05 NOT NULL,
    "discount_biannual" numeric DEFAULT 0.10 NOT NULL,
    "discount_annual" numeric DEFAULT 0.15 NOT NULL,
    CONSTRAINT "discount_annual_check" CHECK ((("discount_annual" >= (0)::numeric) AND ("discount_annual" <= (1)::numeric))),
    CONSTRAINT "discount_biannual_check" CHECK ((("discount_biannual" >= (0)::numeric) AND ("discount_biannual" <= (1)::numeric))),
    CONSTRAINT "discount_quarterly_check" CHECK ((("discount_quarterly" >= (0)::numeric) AND ("discount_quarterly" <= (1)::numeric)))
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."app_settings" IS 'Stores application-wide configurations and settings.';



COMMENT ON COLUMN "public"."app_settings"."payment_email" IS 'Contact email for payment verifications.';



COMMENT ON COLUMN "public"."app_settings"."base_price_researcher_monthly" IS 'Base monthly price for the researcher tier in DZD.';



COMMENT ON COLUMN "public"."app_settings"."base_price_organizer_monthly" IS 'Base monthly price for the organizer tier in DZD.';



COMMENT ON COLUMN "public"."app_settings"."discount_quarterly" IS 'Percentage discount for quarterly subscriptions (e.g., 0.05 for 5%).';



COMMENT ON COLUMN "public"."app_settings"."discount_biannual" IS 'Percentage discount for biannual (6 months) subscriptions (e.g., 0.10 for 10%).';



COMMENT ON COLUMN "public"."app_settings"."discount_annual" IS 'Percentage discount for annual subscriptions (e.g., 0.15 for 15%).';



CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
    "profile_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."bookmarks" OWNER TO "postgres";


COMMENT ON TABLE "public"."bookmarks" IS 'User bookmarks for events.';



CREATE TABLE IF NOT EXISTS "public"."dairas" (
    "id" integer NOT NULL,
    "wilaya_id" integer NOT NULL,
    "name_ar" "text" NOT NULL,
    "name_other" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."dairas" OWNER TO "postgres";


COMMENT ON TABLE "public"."dairas" IS 'Algerian districts/counties.';



CREATE TABLE IF NOT EXISTS "public"."email_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "queue_id" bigint,
    "recipient_email" "text" NOT NULL,
    "template_key" "text",
    "subject_sent" "text" NOT NULL,
    "payload" "jsonb",
    "status" "public"."email_log_status_enum" NOT NULL,
    "attempted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_attempt_at" timestamp with time zone,
    "retry_count" integer DEFAULT 0,
    "error_message" "text",
    "resend_message_id" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."email_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_log" IS 'Log of email sending attempts.';



CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "template_key" "text" NOT NULL,
    "subject_translations" "jsonb" NOT NULL,
    "body_html_translations" "jsonb" NOT NULL,
    "description_translations" "jsonb",
    "available_placeholders" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_templates" IS 'Email templates.';



CREATE TABLE IF NOT EXISTS "public"."event_topics" (
    "event_id" "uuid" NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."event_topics" OWNER TO "postgres";


COMMENT ON TABLE "public"."event_topics" IS 'Junction table linking events to topics.';



CREATE OR REPLACE VIEW "public"."latest_verification_requests" AS
 SELECT DISTINCT ON ("vr"."user_id") "vr"."id",
    "vr"."user_id",
    "vr"."document_path",
    "vr"."status",
    "vr"."submitted_at",
    "vr"."processed_at",
    "vr"."processed_by",
    "vr"."rejection_reason",
    "vr"."notes",
    "vr"."created_at",
    "vr"."updated_at"
   FROM "public"."verification_requests" "vr"
  ORDER BY "vr"."user_id", "vr"."submitted_at" DESC;


ALTER TABLE "public"."latest_verification_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" bigint NOT NULL,
    "recipient_profile_id" "uuid",
    "template_key" "text",
    "payload_data" "jsonb",
    "status" "public"."queue_status_enum" DEFAULT 'pending'::"public"."queue_status_enum" NOT NULL,
    "process_after" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "attempts" integer DEFAULT 0 NOT NULL,
    "last_attempt_at" timestamp with time zone,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "notification_type" "public"."notification_type_enum" DEFAULT 'scheduled'::"public"."notification_type_enum" NOT NULL
);


ALTER TABLE "public"."notification_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."notification_queue" IS 'Stores email and notification queue items for processing by Edge Functions';



COMMENT ON COLUMN "public"."notification_queue"."template_key" IS 'Template key for the email. Critical templates (payment_received_pending_verification, payment_verified_notification, payment_rejected_notification, admin_invitation) have immediate retry in Edge Function.';



COMMENT ON COLUMN "public"."notification_queue"."notification_type" IS 'Type of notification: immediate (high priority) or scheduled (regular priority)';



CREATE SEQUENCE IF NOT EXISTS "public"."notification_queue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."notification_queue_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notification_queue_id_seq" OWNED BY "public"."notification_queue"."id";



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "status" "public"."payment_status_enum" DEFAULT 'pending_verification'::"public"."payment_status_enum" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "billing_period" "public"."billing_period_enum" NOT NULL,
    "payment_method_reported" "public"."payment_method_enum" NOT NULL,
    "reported_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "verified_at" timestamp with time zone,
    "admin_verifier_id" "uuid",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "proof_document_path" "text",
    "reference_number" "text",
    "payer_notes" "text"
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."payments" IS 'Records of manual payments reported by users and verified by admins.';



COMMENT ON COLUMN "public"."payments"."admin_verifier_id" IS 'Admin profile ID who verified the payment.';



COMMENT ON COLUMN "public"."payments"."admin_notes" IS 'Internal notes from the admin regarding the payment verification.';



COMMENT ON COLUMN "public"."payments"."proof_document_path" IS 'Path to the payment proof document in the storage bucket';



COMMENT ON COLUMN "public"."payments"."reference_number" IS 'Reference number for the payment, useful for tracking bank transfers';



COMMENT ON COLUMN "public"."payments"."payer_notes" IS 'Additional notes provided by the payer';



CREATE TABLE IF NOT EXISTS "public"."researcher_topic_subscriptions" (
    "profile_id" "uuid" NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."researcher_topic_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."researcher_topic_subscriptions" IS 'Stores topic subscriptions for researchers to receive notifications.';



COMMENT ON COLUMN "public"."researcher_topic_subscriptions"."profile_id" IS 'The profile ID of the researcher subscribing to the topic.';



COMMENT ON COLUMN "public"."researcher_topic_subscriptions"."topic_id" IS 'The ID of the topic the researcher is subscribing to.';



CREATE TABLE IF NOT EXISTS "public"."submission_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "title_translations" "jsonb" NOT NULL,
    "abstract_translations" "jsonb" NOT NULL,
    "abstract_file_url" "text",
    "abstract_file_metadata" "jsonb",
    "full_paper_file_url" "text",
    "full_paper_file_metadata" "jsonb",
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "feedback_translations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."submission_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."submission_versions" IS 'Version history for paper submissions, tracking changes over time.';



CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "submitted_by" "uuid" NOT NULL,
    "title_translations" "jsonb" NOT NULL,
    "abstract_translations" "jsonb" NOT NULL,
    "abstract_file_url" "text",
    "abstract_file_metadata" "jsonb",
    "full_paper_file_url" "text",
    "full_paper_file_metadata" "jsonb",
    "submission_date" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "review_date" timestamp with time zone,
    "review_feedback_translations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_abstract_version_id" "uuid",
    "current_full_paper_version_id" "uuid",
    "abstract_status" "public"."submission_status_enum",
    "full_paper_status" "public"."submission_status_enum",
    "feedback_history" "jsonb",
    "deleted_at" timestamp with time zone,
    "status" "public"."submission_status_enum"
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."submissions" IS 'Paper submissions for events.';



COMMENT ON COLUMN "public"."submissions"."current_abstract_version_id" IS 'References the current active version of the abstract in submission_versions.';



COMMENT ON COLUMN "public"."submissions"."current_full_paper_version_id" IS 'References the current active version of the full paper in submission_versions.';



COMMENT ON COLUMN "public"."submissions"."abstract_status" IS 'Current status of the abstract submission phase.';



COMMENT ON COLUMN "public"."submissions"."full_paper_status" IS 'Current status of the full paper submission phase.';



COMMENT ON COLUMN "public"."submissions"."feedback_history" IS 'A JSONB array storing the history of feedback and status changes for the submission.';



COMMENT ON COLUMN "public"."submissions"."status" IS 'Combined status that reflects either abstract_status or full_paper_status based on the current state of the submission.';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tier" "public"."subscription_tier_enum" DEFAULT 'free'::"public"."subscription_tier_enum" NOT NULL,
    "status" "public"."subscription_status_enum" DEFAULT 'trial'::"public"."subscription_status_enum" NOT NULL,
    "start_date" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "end_date" timestamp with time zone,
    "trial_ends_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscriptions" IS 'User subscription status, tier, and lifecycle.';



COMMENT ON COLUMN "public"."subscriptions"."status" IS 'Current status of the subscription (active, expired, trial, cancelled).';



COMMENT ON COLUMN "public"."subscriptions"."trial_ends_at" IS 'Timestamp when the initial trial period ends.';



CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name_translations" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


COMMENT ON TABLE "public"."topics" IS 'Research and event topics.';



CREATE TABLE IF NOT EXISTS "public"."wilayas" (
    "id" integer NOT NULL,
    "name_ar" "text" NOT NULL,
    "name_other" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."wilayas" OWNER TO "postgres";


COMMENT ON TABLE "public"."wilayas" IS 'Algerian provinces/states.';



ALTER TABLE ONLY "public"."notification_queue" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notification_queue_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_actions_log"
    ADD CONSTRAINT "admin_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("profile_id", "event_id");



ALTER TABLE ONLY "public"."dairas"
    ADD CONSTRAINT "dairas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("template_key");



ALTER TABLE ONLY "public"."event_topics"
    ADD CONSTRAINT "event_topics_pkey" PRIMARY KEY ("event_id", "topic_id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_profiles"
    ADD CONSTRAINT "organizer_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."researcher_profiles"
    ADD CONSTRAINT "researcher_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."researcher_topic_subscriptions"
    ADD CONSTRAINT "researcher_topic_subscriptions_pkey" PRIMARY KEY ("profile_id", "topic_id");



ALTER TABLE ONLY "public"."submission_versions"
    ADD CONSTRAINT "submission_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."submission_versions"
    ADD CONSTRAINT "unique_submission_version" UNIQUE ("submission_id", "version_number");



ALTER TABLE ONLY "public"."verification_requests"
    ADD CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wilayas"
    ADD CONSTRAINT "wilayas_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admin_actions_log_action_type" ON "public"."admin_actions_log" USING "btree" ("action_type");



CREATE INDEX "idx_admin_actions_log_admin_user_id" ON "public"."admin_actions_log" USING "btree" ("admin_user_id");



CREATE INDEX "idx_admin_actions_log_created_at" ON "public"."admin_actions_log" USING "btree" ("created_at");



CREATE INDEX "idx_admin_actions_log_target_entity" ON "public"."admin_actions_log" USING "btree" ("target_entity_id", "target_entity_type");



CREATE INDEX "idx_admin_actions_log_target_user_id" ON "public"."admin_actions_log" USING "btree" ("target_user_id");



CREATE INDEX "idx_bookmarks_event_id" ON "public"."bookmarks" USING "btree" ("event_id");



CREATE INDEX "idx_bookmarks_profile_id" ON "public"."bookmarks" USING "btree" ("profile_id");



CREATE INDEX "idx_email_log_recipient_email" ON "public"."email_log" USING "btree" ("recipient_email");



CREATE INDEX "idx_email_log_status" ON "public"."email_log" USING "btree" ("status");



CREATE INDEX "idx_email_log_template_key" ON "public"."email_log" USING "btree" ("template_key");



CREATE INDEX "idx_email_templates_template_key" ON "public"."email_templates" USING "btree" ("template_key");



CREATE INDEX "idx_event_topics_event_id" ON "public"."event_topics" USING "btree" ("event_id");



CREATE INDEX "idx_event_topics_event_topic" ON "public"."event_topics" USING "btree" ("event_id", "topic_id");



CREATE INDEX "idx_event_topics_topic_id" ON "public"."event_topics" USING "btree" ("topic_id");



CREATE INDEX "idx_events_arabic_search" ON "public"."events" USING "gin" ((((((((("event_name_translations" ->> 'ar'::"text") || ' '::"text") || COALESCE(("event_subtitle_translations" ->> 'ar'::"text"), ''::"text")) || ' '::"text") || ("problem_statement_translations" ->> 'ar'::"text")) || ' '::"text") || ("event_objectives_translations" ->> 'ar'::"text"))) "public"."gin_trgm_ops");



CREATE INDEX "idx_events_created_by" ON "public"."events" USING "btree" ("created_by");



CREATE INDEX "idx_events_date_range" ON "public"."events" USING "btree" ("event_date", "event_end_date") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_events_deleted_at" ON "public"."events" USING "btree" ("deleted_at");



CREATE INDEX "idx_events_event_type" ON "public"."events" USING "btree" ("event_type");



CREATE INDEX "idx_events_featured" ON "public"."events" USING "btree" ("status", "event_date", "created_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_events_format" ON "public"."events" USING "btree" ("format");



CREATE INDEX "idx_events_location" ON "public"."events" USING "btree" ("wilaya_id", "daira_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_events_status" ON "public"."events" USING "btree" ("status");



CREATE INDEX "idx_events_status_format" ON "public"."events" USING "btree" ("status", "format") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_events_wilaya_id" ON "public"."events" USING "btree" ("wilaya_id");



CREATE INDEX "idx_notification_queue_critical_templates" ON "public"."notification_queue" USING "btree" ("template_key") WHERE ("template_key" = ANY (ARRAY['payment_received_pending_verification'::"text", 'payment_verified_notification'::"text", 'payment_rejected_notification'::"text", 'admin_invitation'::"text"]));



CREATE INDEX "idx_notification_queue_recipient_profile_id" ON "public"."notification_queue" USING "btree" ("recipient_profile_id");



CREATE INDEX "idx_notification_queue_status_process_after" ON "public"."notification_queue" USING "btree" ("status", "process_after");



CREATE INDEX "idx_organizer_profiles_institution_type" ON "public"."organizer_profiles" USING "btree" ("institution_type");



CREATE INDEX "idx_organizer_profiles_language" ON "public"."organizer_profiles" USING "btree" ("language");



CREATE INDEX "idx_organizer_profiles_name_trgm" ON "public"."organizer_profiles" USING "gin" ((("name_translations" ->> 'ar'::"text")) "public"."gin_trgm_ops");



CREATE INDEX "idx_organizer_profiles_wilaya_id" ON "public"."organizer_profiles" USING "btree" ("wilaya_id");



CREATE INDEX "idx_researcher_profiles_language" ON "public"."researcher_profiles" USING "btree" ("language");



CREATE INDEX "idx_researcher_profiles_name_trgm" ON "public"."researcher_profiles" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_researcher_profiles_wilaya_id" ON "public"."researcher_profiles" USING "btree" ("wilaya_id");



CREATE INDEX "idx_submission_versions_submission_id" ON "public"."submission_versions" USING "btree" ("submission_id");



CREATE INDEX "idx_submission_versions_version_number" ON "public"."submission_versions" USING "btree" ("version_number");



CREATE INDEX "idx_submissions_abstract_status" ON "public"."submissions" USING "btree" ("abstract_status");



CREATE INDEX "idx_submissions_current_abstract_version_id" ON "public"."submissions" USING "btree" ("current_abstract_version_id");



CREATE INDEX "idx_submissions_current_full_paper_version_id" ON "public"."submissions" USING "btree" ("current_full_paper_version_id");



CREATE INDEX "idx_submissions_deleted_at" ON "public"."submissions" USING "btree" ("deleted_at");



CREATE INDEX "idx_submissions_event_id" ON "public"."submissions" USING "btree" ("event_id");



CREATE INDEX "idx_submissions_full_paper_status" ON "public"."submissions" USING "btree" ("full_paper_status");



CREATE INDEX "idx_submissions_submitted_by" ON "public"."submissions" USING "btree" ("submitted_by");



CREATE INDEX "idx_topics_slug" ON "public"."topics" USING "btree" ("slug");



CREATE INDEX "idx_verification_requests_status" ON "public"."verification_requests" USING "btree" ("status");



CREATE INDEX "idx_verification_requests_status_submitted_at" ON "public"."verification_requests" USING "btree" ("status", "submitted_at" DESC);



CREATE INDEX "idx_verification_requests_submitted_at" ON "public"."verification_requests" USING "btree" ("submitted_at");



CREATE INDEX "idx_verification_requests_submitted_at_status" ON "public"."verification_requests" USING "btree" ("submitted_at" DESC, "status");



CREATE INDEX "idx_verification_requests_user_id" ON "public"."verification_requests" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "check_event_submission_allowed_trigger" BEFORE INSERT OR UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."check_event_submission_allowed"();



CREATE OR REPLACE TRIGGER "check_pending_verification_requests_trigger" BEFORE INSERT ON "public"."verification_requests" FOR EACH ROW EXECUTE FUNCTION "public"."check_pending_verification_requests"();



CREATE OR REPLACE TRIGGER "event_deadline_changes_trigger" AFTER UPDATE ON "public"."events" FOR EACH ROW WHEN ((("old"."abstract_submission_deadline" IS DISTINCT FROM "new"."abstract_submission_deadline") OR ("old"."abstract_review_result_date" IS DISTINCT FROM "new"."abstract_review_result_date") OR ("old"."full_paper_submission_deadline" IS DISTINCT FROM "new"."full_paper_submission_deadline") OR ("old"."submission_verdict_deadline" IS DISTINCT FROM "new"."submission_verdict_deadline") OR ("old"."event_date" IS DISTINCT FROM "new"."event_date") OR ("old"."event_end_date" IS DISTINCT FROM "new"."event_end_date"))) EXECUTE FUNCTION "public"."handle_event_deadline_changes"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."app_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"();



CREATE OR REPLACE TRIGGER "notification_insert_trigger" BEFORE INSERT ON "public"."notification_queue" FOR EACH ROW EXECUTE FUNCTION "public"."handle_notification_insert"();



CREATE OR REPLACE TRIGGER "notify_organizer_new_submission_trigger" AFTER INSERT OR UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."notify_organizer_new_submission"();



CREATE OR REPLACE TRIGGER "notify_submission_status_change_trigger" AFTER UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."notify_submission_status_change"();



CREATE OR REPLACE TRIGGER "on_payment_verified" AFTER UPDATE ON "public"."payments" FOR EACH ROW WHEN ((("old"."status" IS DISTINCT FROM "new"."status") AND ("new"."status" = 'verified'::"public"."payment_status_enum"))) EXECUTE FUNCTION "public"."handle_payment_verification"();



COMMENT ON TRIGGER "on_payment_verified" ON "public"."payments" IS 'Calls handle_payment_verification() after a payment status is updated to verified.';



CREATE OR REPLACE TRIGGER "on_payment_verified_update_subscription" AFTER UPDATE OF "status" ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_payment_verification"();



CREATE OR REPLACE TRIGGER "payment_notification_trigger" AFTER UPDATE OF "status" ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_payment_notification"();



CREATE OR REPLACE TRIGGER "payment_reported_trigger" AFTER INSERT ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_payment_reported"();



CREATE OR REPLACE TRIGGER "payment_verification_trigger" AFTER UPDATE OF "status" ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_payment_verification"();



CREATE OR REPLACE TRIGGER "profile_verification_trigger" AFTER UPDATE OF "is_verified" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_profile_verification_change"();



CREATE OR REPLACE TRIGGER "set_submission_version_number_trigger" BEFORE INSERT ON "public"."submission_versions" FOR EACH ROW EXECUTE FUNCTION "public"."set_submission_version_number"();



CREATE OR REPLACE TRIGGER "sync_submission_status_trigger" BEFORE INSERT OR UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_submission_status"();



CREATE OR REPLACE TRIGGER "track_submission_versions_trigger" BEFORE UPDATE ON "public"."submissions" FOR EACH ROW EXECUTE FUNCTION "public"."track_submission_versions"();



CREATE OR REPLACE TRIGGER "verification_request_notification_trigger" BEFORE UPDATE OF "status" ON "public"."verification_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_verification_request_status_change"();



CREATE OR REPLACE TRIGGER "verification_request_submission_trigger" AFTER INSERT ON "public"."verification_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_verification_request_submission"();



ALTER TABLE ONLY "public"."admin_actions_log"
    ADD CONSTRAINT "admin_actions_log_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_actions_log"
    ADD CONSTRAINT "admin_actions_log_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_profiles"
    ADD CONSTRAINT "admin_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dairas"
    ADD CONSTRAINT "dairas_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "public"."wilayas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "public"."notification_queue"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_template_key_fkey" FOREIGN KEY ("template_key") REFERENCES "public"."email_templates"("template_key") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_topics"
    ADD CONSTRAINT "event_topics_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_topics"
    ADD CONSTRAINT "event_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_daira_id_fkey" FOREIGN KEY ("daira_id") REFERENCES "public"."dairas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "public"."wilayas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "fk_current_abstract_version" FOREIGN KEY ("current_abstract_version_id") REFERENCES "public"."submission_versions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "fk_current_full_paper_version" FOREIGN KEY ("current_full_paper_version_id") REFERENCES "public"."submission_versions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_recipient_profile_id_fkey" FOREIGN KEY ("recipient_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_template_key_fkey" FOREIGN KEY ("template_key") REFERENCES "public"."email_templates"("template_key") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_profiles"
    ADD CONSTRAINT "organizer_profiles_daira_id_fkey" FOREIGN KEY ("daira_id") REFERENCES "public"."dairas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_profiles"
    ADD CONSTRAINT "organizer_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_profiles"
    ADD CONSTRAINT "organizer_profiles_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "public"."wilayas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_admin_verifier_id_fkey" FOREIGN KEY ("admin_verifier_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."researcher_profiles"
    ADD CONSTRAINT "researcher_profiles_daira_id_fkey" FOREIGN KEY ("daira_id") REFERENCES "public"."dairas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."researcher_profiles"
    ADD CONSTRAINT "researcher_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."researcher_profiles"
    ADD CONSTRAINT "researcher_profiles_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "public"."wilayas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."researcher_topic_subscriptions"
    ADD CONSTRAINT "researcher_topic_subscriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."researcher_topic_subscriptions"
    ADD CONSTRAINT "researcher_topic_subscriptions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submission_versions"
    ADD CONSTRAINT "submission_versions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_requests"
    ADD CONSTRAINT "verification_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verification_requests"
    ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "events_select_deleted_for_owner_admin" ON "public"."events" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NOT NULL) AND (("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'admin'::"public"."user_type_enum")))))));



CREATE POLICY "events_select_for_authenticated" ON "public"."events" FOR SELECT TO "authenticated" USING (("deleted_at" IS NULL));



CREATE POLICY "submissions_select_deleted_for_owner_admin" ON "public"."submissions" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NOT NULL) AND (("submitted_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "submissions"."event_id") AND ("events"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'admin'::"public"."user_type_enum")))))));



CREATE POLICY "submissions_select_for_owner" ON "public"."submissions" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND (("submitted_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "submissions"."event_id") AND ("events"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."user_type" = 'admin'::"public"."user_type_enum")))))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TYPE "public"."admin_action_type" TO "authenticated";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";
































































































































































































GRANT ALL ON FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."billing_period_to_interval"("period" "public"."billing_period_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_event_statistics"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_event_statistics"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_event_statistics"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_event_submission_allowed"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_event_submission_allowed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_event_submission_allowed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_pending_verification_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_pending_verification_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_pending_verification_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_subscriptions_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_subscriptions_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_subscriptions_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_my_profile"("profile_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_submission"("p_submission_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_submission"("p_submission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_submission"("p_submission_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_deadline_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_deadline_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_deadline_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."discover_events"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "event_status_filter" "public"."event_status_enum"[], "event_format_filter" "public"."event_format_enum"[], "p_organizer_id" "uuid", "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."discover_events"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "event_status_filter" "public"."event_status_enum"[], "event_format_filter" "public"."event_format_enum"[], "p_organizer_id" "uuid", "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."discover_events"("search_query" "text", "topic_ids" "uuid"[], "wilaya_id_param" integer, "daira_id_param" integer, "start_date" timestamp with time zone, "end_date" timestamp with time zone, "event_status_filter" "public"."event_status_enum"[], "event_format_filter" "public"."event_format_enum"[], "p_organizer_id" "uuid", "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."filter_events_by_date_range"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer, "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer, "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."filter_events_by_location"("wilaya_id_param" integer, "daira_id_param" integer, "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."filter_events_by_topic"("topic_ids" "uuid"[], "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_submission_stats"("event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_submission_stats"("event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_submission_stats"("event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_events_by_status"("status_filter" "public"."event_status_enum", "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_featured_events"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_featured_events"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_featured_events"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payment_details"("payment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_details"("payment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_details"("payment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payments_with_user_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_payments_with_user_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payments_with_user_details"() TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_events"("p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_events"("p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_events"("p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_details"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_details"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_details"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_pricing"("user_type" "public"."user_type_enum", "billing_period" "public"."billing_period_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_event_deadline_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_event_deadline_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_event_deadline_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_notification_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_notification_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_notification_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_payment_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_payment_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_payment_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_payment_reported"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_payment_reported"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_payment_reported"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_payment_verification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_payment_verification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_payment_verification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_profile_verification_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_profile_verification_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_profile_verification_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_verification_request_processing"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_verification_request_processing"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_verification_request_processing"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_verification_request_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_verification_request_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_verification_request_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_verification_request_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_verification_request_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_verification_request_submission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "postgres";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "anon";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_organizer_new_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_organizer_new_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_organizer_new_submission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_submission_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_submission_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_submission_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."purge_expired_deletions"() TO "anon";
GRANT ALL ON FUNCTION "public"."purge_expired_deletions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_expired_deletions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."queue_trial_expiry_notification"("profile_id" "uuid", "days_remaining" integer, "template_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."queue_trial_expiry_notification"("profile_id" "uuid", "days_remaining" integer, "template_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."queue_trial_expiry_notification"("profile_id" "uuid", "days_remaining" integer, "template_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum", "admin_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum", "admin_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_manual_payment"("target_user_id" "uuid", "amount" numeric, "billing_period" "public"."billing_period_enum", "payment_method" "public"."payment_method_enum", "admin_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_event"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_event"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_event"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_submission"("p_submission_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_submission"("p_submission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_submission"("p_submission_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback_translations" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer, "offset_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer, "offset_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_events"("search_query" "text", "limit_count" integer, "offset_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_submission_version_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_submission_version_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_submission_version_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_event"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_event"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_event"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_submission"("p_submission_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_submission"("p_submission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_submission"("p_submission_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_abstract"("p_event_id" "uuid", "p_title_translations" "jsonb", "p_abstract_translations" "jsonb", "p_abstract_file_url" "text", "p_abstract_file_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_full_paper"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_revision"("p_submission_id" "uuid", "p_full_paper_file_url" "text", "p_full_paper_file_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_submission_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_submission_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_submission_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_submission_versions"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_submission_versions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_submission_versions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_status_based_on_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_status_based_on_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_status_based_on_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text", "rejection_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text", "rejection_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_payment"("payment_id" "uuid", "verify_status" "public"."payment_status_enum", "p_admin_notes" "text", "rejection_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";
























GRANT ALL ON TABLE "public"."admin_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_actions_log" TO "service_role";
GRANT ALL ON TABLE "public"."admin_actions_log" TO "supabase_admin";



GRANT ALL ON SEQUENCE "public"."admin_actions_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_actions_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_actions_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."admin_profiles" TO "anon";
GRANT ALL ON TABLE "public"."admin_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."organizer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."researcher_profiles" TO "anon";
GRANT ALL ON TABLE "public"."researcher_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."researcher_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."verification_requests" TO "anon";
GRANT ALL ON TABLE "public"."verification_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_requests" TO "service_role";



GRANT ALL ON TABLE "public"."verification_request_details" TO "anon";
GRANT ALL ON TABLE "public"."verification_request_details" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_request_details" TO "service_role";



GRANT ALL ON TABLE "public"."admin_verification_requests" TO "anon";
GRANT ALL ON TABLE "public"."admin_verification_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_verification_requests" TO "service_role";



GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."dairas" TO "anon";
GRANT ALL ON TABLE "public"."dairas" TO "authenticated";
GRANT ALL ON TABLE "public"."dairas" TO "service_role";



GRANT ALL ON TABLE "public"."email_log" TO "anon";
GRANT ALL ON TABLE "public"."email_log" TO "authenticated";
GRANT ALL ON TABLE "public"."email_log" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."event_topics" TO "anon";
GRANT ALL ON TABLE "public"."event_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."event_topics" TO "service_role";



GRANT ALL ON TABLE "public"."latest_verification_requests" TO "anon";
GRANT ALL ON TABLE "public"."latest_verification_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."latest_verification_requests" TO "service_role";



GRANT ALL ON TABLE "public"."notification_queue" TO "anon";
GRANT ALL ON TABLE "public"."notification_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_queue" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."researcher_topic_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."researcher_topic_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."researcher_topic_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."submission_versions" TO "anon";
GRANT ALL ON TABLE "public"."submission_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."submission_versions" TO "service_role";



GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON TABLE "public"."wilayas" TO "anon";
GRANT ALL ON TABLE "public"."wilayas" TO "authenticated";
GRANT ALL ON TABLE "public"."wilayas" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
