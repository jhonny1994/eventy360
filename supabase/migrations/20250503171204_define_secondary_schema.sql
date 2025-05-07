-- Define ENUM types. The DROP/CREATE pattern ensures they match this definition.

DROP TYPE IF EXISTS public.institution_type_enum CASCADE;
CREATE TYPE public.institution_type_enum AS ENUM (
    'university', 'university_center', 'national_school', 'research_center',
    'research_laboratory', 'activities_service', 'research_team'
);

DROP TYPE IF EXISTS public.event_type_enum CASCADE;
CREATE TYPE public.event_type_enum AS ENUM (
    'scientific_event', 'cultural_event', 'sports_event', 'competition'
);

DROP TYPE IF EXISTS public.event_format_enum CASCADE;
CREATE TYPE public.event_format_enum AS ENUM (
    'physical', 'virtual', 'hybrid'
);

DROP TYPE IF EXISTS public.event_status_enum CASCADE;
CREATE TYPE public.event_status_enum AS ENUM (
    'published', 'active', 'completed', 'canceled'
);

DROP TYPE IF EXISTS public.submission_status_enum CASCADE;
CREATE TYPE public.submission_status_enum AS ENUM (
    'received', 'under_review', 'accepted', 'rejected'
);

DROP TYPE IF EXISTS public.email_log_status_enum CASCADE;
CREATE TYPE public.email_log_status_enum AS ENUM (
    'attempted', 'sent', 'failed', 'retry_attempted'
);

DROP TYPE IF EXISTS public.queue_status_enum CASCADE;
CREATE TYPE public.queue_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

-- Drop and Recreate Tables to ensure exact match with this definition.
-- WARNING: This is destructive to existing data in these specific tables.

DROP TABLE IF EXISTS public.researcher_profiles CASCADE;
CREATE TABLE public.researcher_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    institution TEXT,
    academic_position TEXT,
    bio_translations JSONB,
    profile_picture_url TEXT,
    wilaya_id INT REFERENCES public.wilayas(id) ON DELETE SET NULL,
    daira_id INT REFERENCES public.dairas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.researcher_profiles IS 'Extended profile information for researcher users.';

DROP TABLE IF EXISTS public.organizer_profiles CASCADE;
CREATE TABLE public.organizer_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_translations JSONB,
    institution_type public.institution_type_enum,
    bio_translations JSONB,
    profile_picture_url TEXT,
    wilaya_id INT REFERENCES public.wilayas(id) ON DELETE SET NULL,
    daira_id INT REFERENCES public.dairas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.organizer_profiles IS 'Extended profile information for organizer users.';

DROP TABLE IF EXISTS public.admin_profiles CASCADE;
CREATE TABLE public.admin_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.admin_profiles IS 'Extended profile information for admin users.';

DROP TABLE IF EXISTS public.topics CASCADE;
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_translations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.topics IS 'Research and event topics.';

DROP TABLE IF EXISTS public.events CASCADE;
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status public.event_status_enum NOT NULL,
    who_organizes_translations JSONB,
    event_name_translations JSONB NOT NULL,
    event_subtitle_translations JSONB,
    problem_statement_translations JSONB,
    submission_guidelines_translations JSONB,
    event_axes_translations JSONB,
    event_objectives_translations JSONB,
    target_audience_translations JSONB,
    scientific_committees_translations JSONB,
    speakers_keynotes_translations JSONB,
    event_type public.event_type_enum NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    submission_deadline TIMESTAMP WITH TIME ZONE,
    submission_verdict_deadline TIMESTAMP WITH TIME ZONE,
    full_paper_deadline TIMESTAMP WITH TIME ZONE,
    wilaya_id INT REFERENCES public.wilayas(id) ON DELETE SET NULL,
    daira_id INT REFERENCES public.dairas(id) ON DELETE SET NULL,
    format public.event_format_enum NOT NULL,
    logo_url TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    price NUMERIC(10, 2),
    qr_code_url TEXT,
    brochure_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_event_dates CHECK (event_end_date >= event_date),
    CONSTRAINT check_submission_deadline CHECK (submission_deadline IS NULL OR submission_deadline <= event_date)
);
COMMENT ON TABLE public.events IS 'Core event information.';

DROP TABLE IF EXISTS public.event_topics CASCADE;
CREATE TABLE public.event_topics (
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (event_id, topic_id)
);
COMMENT ON TABLE public.event_topics IS 'Junction table linking events to topics.';

DROP TABLE IF EXISTS public.bookmarks CASCADE;
CREATE TABLE public.bookmarks (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, event_id)
);
COMMENT ON TABLE public.bookmarks IS 'User bookmarks for events.';

DROP TABLE IF EXISTS public.submissions CASCADE;
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status public.submission_status_enum NOT NULL,
    title_translations JSONB NOT NULL,
    abstract_translations JSONB NOT NULL,
    abstract_file_url TEXT,
    abstract_file_metadata JSONB,
    full_paper_file_url TEXT,
    full_paper_file_metadata JSONB,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    review_date TIMESTAMP WITH TIME ZONE,
    review_feedback_translations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.submissions IS 'Paper submissions for events.';

DROP TABLE IF EXISTS public.email_templates CASCADE;
CREATE TABLE public.email_templates (
    template_key TEXT PRIMARY KEY,
    subject_translations JSONB NOT NULL,
    body_html_translations JSONB NOT NULL,
    description_translations JSONB,
    available_placeholders TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.email_templates IS 'Email templates.';

DROP TABLE IF EXISTS public.notification_queue CASCADE;
CREATE TABLE public.notification_queue (
    id BIGSERIAL PRIMARY KEY,
    recipient_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_key TEXT REFERENCES public.email_templates(template_key) ON DELETE SET NULL,
    payload_data JSONB,
    status public.queue_status_enum NOT NULL DEFAULT 'pending',
    process_after TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    attempts INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.notification_queue IS 'Queue for asynchronous processing of notifications.';

DROP TABLE IF EXISTS public.email_log CASCADE;
CREATE TABLE public.email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id BIGINT REFERENCES public.notification_queue(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    template_key TEXT REFERENCES public.email_templates(template_key) ON DELETE SET NULL,
    subject_sent TEXT NOT NULL,
    payload JSONB,
    status public.email_log_status_enum NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    retry_count INT DEFAULT 0,
    error_message TEXT,
    resend_message_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.email_log IS 'Log of email sending attempts.';

-- Add indexes. Since tables are recreated, no need for IF NOT EXISTS.
CREATE INDEX idx_researcher_profiles_wilaya_id ON public.researcher_profiles(wilaya_id);
CREATE INDEX idx_organizer_profiles_wilaya_id ON public.organizer_profiles(wilaya_id);
CREATE INDEX idx_organizer_profiles_institution_type ON public.organizer_profiles(institution_type);
CREATE INDEX idx_topics_slug ON public.topics(slug);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_format ON public.events(format);
CREATE INDEX idx_events_wilaya_id ON public.events(wilaya_id);
CREATE INDEX idx_event_topics_event_id ON public.event_topics(event_id);
CREATE INDEX idx_event_topics_topic_id ON public.event_topics(topic_id);
CREATE INDEX idx_bookmarks_profile_id ON public.bookmarks(profile_id);
CREATE INDEX idx_bookmarks_event_id ON public.bookmarks(event_id);
CREATE INDEX idx_submissions_event_id ON public.submissions(event_id);
CREATE INDEX idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_email_templates_template_key ON public.email_templates(template_key);
CREATE INDEX idx_notification_queue_status_process_after ON public.notification_queue(status, process_after);
CREATE INDEX idx_notification_queue_recipient_profile_id ON public.notification_queue(recipient_profile_id);
CREATE INDEX idx_email_log_status ON public.email_log(status);
CREATE INDEX idx_email_log_recipient_email ON public.email_log(recipient_email);
CREATE INDEX idx_email_log_template_key ON public.email_log(template_key);
