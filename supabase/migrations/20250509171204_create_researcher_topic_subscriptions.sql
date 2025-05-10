-- supabase/migrations/YYYYMMDDHHMMSS_create_researcher_topic_subscriptions.sql

-- Create the researcher_topic_subscriptions table
CREATE TABLE public.researcher_topic_subscriptions (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT researcher_topic_subscriptions_pkey PRIMARY KEY (profile_id, topic_id)
);

-- Enable RLS for the new table
ALTER TABLE public.researcher_topic_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add comments for clarity
COMMENT ON TABLE public.researcher_topic_subscriptions IS 'Stores topic subscriptions for researchers to receive notifications.';
COMMENT ON COLUMN public.researcher_topic_subscriptions.profile_id IS 'The profile ID of the researcher subscribing to the topic.';
COMMENT ON COLUMN public.researcher_topic_subscriptions.topic_id IS 'The ID of the topic the researcher is subscribing to.';

-- RLS Policies for researcher_topic_subscriptions

-- Allow researchers to view their own topic subscriptions
CREATE POLICY "Allow researchers to view their own topic subscriptions"
ON public.researcher_topic_subscriptions
FOR SELECT
USING (auth.uid() = profile_id);

-- Allow researchers with an active or trial subscription to insert their own topic subscriptions
CREATE POLICY "Allow subscribed researchers to insert their own topic subscriptions"
ON public.researcher_topic_subscriptions
FOR INSERT
WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
        SELECT 1
        FROM public.subscriptions s
        JOIN public.profiles p ON s.user_id = p.id
        WHERE p.id = auth.uid()
          AND s.status IN ('active', 'trial') -- 'active' covers paid, 'trial' covers trial
          AND p.user_type = 'researcher'      -- Ensure the user is a researcher
    )
);

-- Allow researchers to delete their own topic subscriptions
CREATE POLICY "Allow researchers to delete their own topic subscriptions"
ON public.researcher_topic_subscriptions
FOR DELETE
USING (auth.uid() = profile_id);


-- Grant usage on the table to authenticated users (they can only interact based on RLS)
GRANT SELECT, INSERT, DELETE ON public.researcher_topic_subscriptions TO authenticated;
