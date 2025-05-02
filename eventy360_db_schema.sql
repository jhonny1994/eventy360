-- Eventy360 Database Schema
-- A comprehensive schema for the Eventy360 platform with proper ENUMs, tables, and access controls

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- ENUM DEFINITIONS
--------------------------------------------------
CREATE TYPE user_type_enum AS ENUM ('researcher', 'organizer', 'admin');
CREATE TYPE language_enum AS ENUM ('ar', 'fr', 'en');
CREATE TYPE institution_type_enum AS ENUM ('university', 'university_center', 'national_school', 'research_center', 'research_laboratory', 'activities_service', 'research_team');
CREATE TYPE event_type_enum AS ENUM ('scientific_event', 'cultural_event', 'sports_event', 'competition');
CREATE TYPE event_format_enum AS ENUM ('physical', 'virtual', 'hybrid');
CREATE TYPE event_status_enum AS ENUM ('published', 'active', 'completed', 'canceled');
CREATE TYPE submission_status_enum AS ENUM ('received', 'under_review', 'accepted', 'rejected');
CREATE TYPE subscription_tier_enum AS ENUM ('free_researcher', 'paid_researcher', 'paid_organizer');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'inactive', 'pending', 'trial', 'expired');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'check', 'cash', 'online_payment');
CREATE TYPE verification_status_enum AS ENUM ('submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE verification_type_enum AS ENUM ('researcher', 'organizer');
CREATE TYPE file_type_enum AS ENUM ('abstract', 'full_paper');
CREATE TYPE template_type_enum AS ENUM ('welcome', 'verification', 'payment', 'submission', 'event');
CREATE TYPE email_status_enum AS ENUM ('pending', 'sent', 'failed');

-- Add comments to ENUM types
COMMENT ON TYPE user_type_enum IS 'User role types within the platform';
COMMENT ON TYPE language_enum IS 'Supported languages for multilingual content (Arabic, French, English)';
COMMENT ON TYPE institution_type_enum IS 'Types of academic and research institutions in Algeria';
COMMENT ON TYPE event_type_enum IS 'Categories of events supported on the platform';
COMMENT ON TYPE event_format_enum IS 'Format options for events (in-person, online, or hybrid)';
COMMENT ON TYPE event_status_enum IS 'Lifecycle states of an event';
COMMENT ON TYPE submission_status_enum IS 'Status options for paper submissions to events';
COMMENT ON TYPE subscription_tier_enum IS 'Available subscription tiers for different user types';
COMMENT ON TYPE subscription_status_enum IS 'Possible states of a user subscription';
COMMENT ON TYPE payment_status_enum IS 'Status options for subscription payments';
COMMENT ON TYPE payment_method_enum IS 'Available payment methods for subscriptions';
COMMENT ON TYPE verification_status_enum IS 'Workflow states for user verification requests';
COMMENT ON TYPE verification_type_enum IS 'Types of verification requests based on user role';
COMMENT ON TYPE file_type_enum IS 'Types of files that can be uploaded for submissions';
COMMENT ON TYPE template_type_enum IS 'Categories of email templates used in the system';
COMMENT ON TYPE email_status_enum IS 'Status options for emails in the delivery queue';

--------------------------------------------------
-- FUNCTIONS
--------------------------------------------------
-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create a default subscription on user creation
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  tier_name subscription_tier_enum;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set appropriate tier based on user type
  IF NEW.user_type = 'researcher' THEN
    tier_name := 'free_researcher';
  ELSIF NEW.user_type = 'organizer' THEN
    tier_name := 'paid_organizer';
  ELSE
    -- Admins don't need subscriptions
    RETURN NEW;
  END IF;
  
  -- Set trial end date (14 days from now)
  trial_end := NOW() + INTERVAL '14 days';
  
  -- Insert the subscription
  INSERT INTO subscriptions (
    profile_id, 
    tier, 
    status, 
    trial_end_date
  ) VALUES (
    NEW.id,
    tier_name,
    'trial',
    trial_end
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle verification approval
CREATE OR REPLACE FUNCTION handle_verification_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update the verified status in the profiles table
    UPDATE profiles
    SET is_verified = TRUE
    WHERE id = NEW.profile_id;
    
    -- Add to email queue for notification
    INSERT INTO email_queue (
      recipient,
      subject,
      body,
      status
    )
    SELECT
      p.email,
      'Your verification has been approved',
      'Congratulations! Your account verification has been approved.',
      'pending'
    FROM profiles p
    WHERE p.id = NEW.profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle payment verification
CREATE OR REPLACE FUNCTION handle_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    -- Update the subscription status
    UPDATE subscriptions
    SET 
      status = 'active',
      start_date = NOW(),
      end_date = NOW() + INTERVAL '1 year'
    FROM payments
    WHERE payments.id = NEW.id
    AND subscriptions.id = payments.subscription_id;
    
    -- Add to email queue for notification
    INSERT INTO email_queue (
      recipient,
      subject,
      body,
      status
    )
    SELECT
      p.email,
      'Your payment has been verified',
      'Your payment has been verified and your subscription is now active.',
      'pending'
    FROM payments pay
    JOIN subscriptions s ON pay.subscription_id = s.id
    JOIN profiles p ON s.profile_id = p.id
    WHERE pay.id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a unique reference code
  NEW.reference_code := 'PAY-' || SUBSTRING(MD5(NEW.id::text || NOW()::text), 1, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle submission status changes
CREATE OR REPLACE FUNCTION handle_submission_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Update review date if status changed to accepted or rejected
    IF NEW.status IN ('accepted', 'rejected') THEN
      NEW.review_date := NOW();
    END IF;
    
    -- Add to email queue for notification
    INSERT INTO email_queue (
      recipient,
      subject,
      body,
      status
    )
    SELECT
      p.email,
      'Your submission status has changed',
      'Your submission "' || s.title || '" status has changed to ' || NEW.status::text,
      'pending'
    FROM submissions s
    JOIN profiles p ON s.submitted_by = p.id
    WHERE s.id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check active events count for organizers
CREATE OR REPLACE FUNCTION check_active_events_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Count active events for this organizer
  SELECT COUNT(*) INTO active_count
  FROM events
  WHERE created_by = NEW.created_by
  AND status IN ('published', 'active');
  
  -- Check if limit exceeded (5 active events per organizer)
  IF active_count >= 5 THEN
    RAISE EXCEPTION 'Organizers are limited to 5 active events';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
   NEW.deleted_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to filter out soft deleted records
CREATE OR REPLACE FUNCTION exclude_deleted_records(table_name regclass) 
RETURNS TEXT AS $$
BEGIN
   RETURN format('("%s".deleted_at IS NULL)', table_name);
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- TABLES
--------------------------------------------------

-- 1. Core User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  user_type user_type_enum NOT NULL,
  preferred_language language_enum NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE profiles IS 'Core user profile information linked to Supabase auth.users';
COMMENT ON COLUMN profiles.id IS 'Primary key linked to Supabase auth.users UUID';
COMMENT ON COLUMN profiles.email IS 'User email address for notifications and communication';
COMMENT ON COLUMN profiles.display_name IS 'Public name displayed throughout the platform';
COMMENT ON COLUMN profiles.user_type IS 'Role-based classification of the user (researcher, organizer, admin)';
COMMENT ON COLUMN profiles.preferred_language IS 'User interface language preference';
COMMENT ON COLUMN profiles.is_verified IS 'Indicates whether the user has completed verification';
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when the profile was soft-deleted, null if active';

-- 2. Researcher Profiles
CREATE TABLE researcher_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  institution VARCHAR NOT NULL,
  academic_position TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE researcher_profiles IS 'Extended profile information specific to researcher users';
COMMENT ON COLUMN researcher_profiles.institution IS 'Academic or research institution the researcher is affiliated with';
COMMENT ON COLUMN researcher_profiles.academic_position IS 'Current academic role or position of the researcher';
COMMENT ON COLUMN researcher_profiles.bio IS 'Researcher biography and research interests';
COMMENT ON COLUMN researcher_profiles.deleted_at IS 'Timestamp when the researcher profile was soft-deleted, null if active';

-- 3. Organizer Profiles
CREATE TABLE organizer_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name VARCHAR NOT NULL,
  institution_type institution_type_enum NOT NULL,
  logo_url VARCHAR,
  contact_email VARCHAR NOT NULL,
  contact_phone VARCHAR,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE organizer_profiles IS 'Extended profile information specific to event organizer users';
COMMENT ON COLUMN organizer_profiles.institution_name IS 'Name of the organizing institution';
COMMENT ON COLUMN organizer_profiles.institution_type IS 'Type of institution (university, research center, etc.)';
COMMENT ON COLUMN organizer_profiles.logo_url IS 'URL to the institution logo for display on events';
COMMENT ON COLUMN organizer_profiles.contact_email IS 'Public contact email for the organizer';
COMMENT ON COLUMN organizer_profiles.contact_phone IS 'Public contact phone number for the organizer';
COMMENT ON COLUMN organizer_profiles.deleted_at IS 'Timestamp when the organizer profile was soft-deleted, null if active';

-- 4. Admin Profiles
CREATE TABLE admin_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier subscription_tier_enum NOT NULL,
  status subscription_status_enum NOT NULL,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id)
);

-- 6. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  reference_code VARCHAR NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR NOT NULL DEFAULT 'DZD',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  payment_proof_url VARCHAR NOT NULL,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Topics
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  parent_id UUID REFERENCES topics(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. User Interests (Many-to-Many)
CREATE TABLE user_interests (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, topic_id)
);

-- 9. Verification Requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type verification_type_enum NOT NULL,
  status verification_status_enum NOT NULL DEFAULT 'submitted',
  institutional_email VARCHAR NOT NULL,
  proof_document_url VARCHAR NOT NULL,
  processed_by UUID REFERENCES profiles(id),
  processed_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  status event_status_enum NOT NULL DEFAULT 'published',
  who_organizes TEXT NOT NULL,
  name VARCHAR NOT NULL,
  subtitle VARCHAR,
  problem_statement TEXT NOT NULL,
  submission_guidelines TEXT NOT NULL,
  event_axes TEXT NOT NULL,
  event_objectives TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  scientific_committees TEXT NOT NULL,
  speakers_keynotes TEXT,
  event_type event_type_enum NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_verdict_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  full_paper_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR NOT NULL,
  format event_format_enum NOT NULL,
  logo_url VARCHAR,
  email VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  website VARCHAR,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  qr_code VARCHAR,
  banner_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE events IS 'Academic and research events managed through the platform';
COMMENT ON COLUMN events.created_by IS 'Reference to the organizer profile that created the event';
COMMENT ON COLUMN events.status IS 'Current status in the event lifecycle';
COMMENT ON COLUMN events.name IS 'Primary title of the event';
COMMENT ON COLUMN events.problem_statement IS 'Description of the research problem or context addressed by the event';
COMMENT ON COLUMN events.event_date IS 'Start date and time of the event';
COMMENT ON COLUMN events.event_end_date IS 'End date and time of the event';
COMMENT ON COLUMN events.submission_deadline IS 'Deadline for abstract submissions';
COMMENT ON COLUMN events.full_paper_deadline IS 'Deadline for full paper submissions (after acceptance)';
COMMENT ON COLUMN events.format IS 'Whether the event is physical, virtual, or hybrid';
COMMENT ON COLUMN events.deleted_at IS 'Timestamp when the event was soft-deleted, null if active';

-- 11. Event Topics (Many-to-Many)
CREATE TABLE event_topics (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, topic_id)
);

-- 12. Saved Events (Many-to-Many)
CREATE TABLE saved_events (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, event_id)
);

-- 13. Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  status submission_status_enum NOT NULL DEFAULT 'received',
  language language_enum NOT NULL,
  title VARCHAR NOT NULL,
  abstract TEXT NOT NULL,
  organizer_feedback TEXT,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  review_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE submissions IS 'Research paper submissions to events';
COMMENT ON COLUMN submissions.event_id IS 'Reference to the event the submission is for';
COMMENT ON COLUMN submissions.submitted_by IS 'Reference to the researcher who submitted the paper';
COMMENT ON COLUMN submissions.status IS 'Current status in the submission review workflow';
COMMENT ON COLUMN submissions.language IS 'Primary language of the submission content';
COMMENT ON COLUMN submissions.title IS 'Title of the research paper';
COMMENT ON COLUMN submissions.abstract IS 'Abstract text summarizing the research paper';
COMMENT ON COLUMN submissions.organizer_feedback IS 'Feedback provided by event organizers/reviewers';
COMMENT ON COLUMN submissions.submission_date IS 'When the submission was initially received';
COMMENT ON COLUMN submissions.review_date IS 'When the submission was reviewed';
COMMENT ON COLUMN submissions.deleted_at IS 'Timestamp when the submission was soft-deleted, null if active';

-- 14. Submission Keywords (Many-to-Many)
CREATE TABLE submission_keywords (
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (submission_id, topic_id)
);

-- 15. Submission Files
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_path VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  file_format VARCHAR NOT NULL,
  file_type file_type_enum NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  download_count INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE submission_files IS 'Files attached to research paper submissions';
COMMENT ON COLUMN submission_files.submission_id IS 'Reference to the submission this file belongs to';
COMMENT ON COLUMN submission_files.file_path IS 'Storage path to the file in Supabase Storage';
COMMENT ON COLUMN submission_files.file_name IS 'Original filename as uploaded by the user';
COMMENT ON COLUMN submission_files.file_format IS 'File format extension (PDF, DOCX, etc.)';
COMMENT ON COLUMN submission_files.file_type IS 'Whether this is an abstract or full paper file';
COMMENT ON COLUMN submission_files.download_count IS 'Number of times the file has been downloaded';
COMMENT ON COLUMN submission_files.deleted_at IS 'Timestamp when the file was soft-deleted, null if active';

-- 16. Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_type template_type_enum NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 17. Email Queue
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status email_status_enum NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 18. Email Logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  template_type template_type_enum NOT NULL,
  status email_status_enum NOT NULL,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR NOT NULL,
  page_path VARCHAR,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

--------------------------------------------------
-- TRIGGERS
--------------------------------------------------

-- Updated_at Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_researcher_profiles_updated_at BEFORE UPDATE ON researcher_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizer_profiles_updated_at BEFORE UPDATE ON organizer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default subscription trigger
CREATE TRIGGER create_profile_subscription AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Verification approval trigger
CREATE TRIGGER verification_approval_trigger AFTER UPDATE ON verification_requests
FOR EACH ROW EXECUTE FUNCTION handle_verification_approval();

-- Payment verification trigger
CREATE TRIGGER payment_verification_trigger AFTER UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION handle_payment_verification();

-- Payment reference trigger
CREATE TRIGGER payment_reference_trigger BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION generate_payment_reference();

-- Submission status trigger
CREATE TRIGGER submission_status_trigger BEFORE UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION handle_submission_status_change();

-- Event limit trigger
CREATE TRIGGER event_limit_trigger BEFORE INSERT ON events
FOR EACH ROW EXECUTE FUNCTION check_active_events_limit();

-- Soft delete triggers
CREATE TRIGGER soft_delete_profiles BEFORE UPDATE OF deleted_at ON profiles
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_researcher_profiles BEFORE UPDATE OF deleted_at ON researcher_profiles
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_organizer_profiles BEFORE UPDATE OF deleted_at ON organizer_profiles
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_events BEFORE UPDATE OF deleted_at ON events
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_submissions BEFORE UPDATE OF deleted_at ON submissions
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_submission_files BEFORE UPDATE OF deleted_at ON submission_files
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION soft_delete_record();

--------------------------------------------------
-- INDEXES
--------------------------------------------------

-- User and profile indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX idx_profiles_preferred_language ON profiles(preferred_language);

-- Subscription indexes
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Payment indexes
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference_code ON payments(reference_code);

-- Event indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_format ON events(format);
CREATE INDEX idx_events_submission_deadline ON events(submission_deadline);

-- Submission indexes
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_language ON submissions(language);
CREATE INDEX idx_submissions_submission_date ON submissions(submission_date);

-- Verification indexes
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_type ON verification_requests(verification_type);

-- Email indexes
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled_for ON email_queue(scheduled_for);

-- Full-text search indexes
CREATE INDEX idx_events_name_fts ON events USING GIN (to_tsvector('english', name));
CREATE INDEX idx_events_problem_statement_fts ON events USING GIN (to_tsvector('english', problem_statement));
CREATE INDEX idx_submissions_title_fts ON submissions USING GIN (to_tsvector('english', title));
CREATE INDEX idx_submissions_abstract_fts ON submissions USING GIN (to_tsvector('english', abstract));
CREATE INDEX idx_topics_name_fts ON topics USING GIN (to_tsvector('english', name));
CREATE INDEX idx_events_name_ar_fts ON events USING GIN (to_tsvector('arabic', name));
CREATE INDEX idx_events_name_fr_fts ON events USING GIN (to_tsvector('french', name));

--------------------------------------------------
-- RLS POLICIES
--------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE researcher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Researcher profiles policies
CREATE POLICY "Researcher profiles are viewable by everyone" 
  ON researcher_profiles FOR SELECT USING (true);

CREATE POLICY "Researchers can update their own profile" 
  ON researcher_profiles FOR UPDATE USING (auth.uid() = profile_id);

-- Organizer profiles policies
CREATE POLICY "Organizer profiles are viewable by everyone" 
  ON organizer_profiles FOR SELECT USING (true);

CREATE POLICY "Organizers can update their own profile" 
  ON organizer_profiles FOR UPDATE USING (auth.uid() = profile_id);

-- Admin profiles policies
CREATE POLICY "Only admins can view admin profiles" 
  ON admin_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Only admins can update admin profiles" 
  ON admin_profiles FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Only admins can update subscriptions" 
  ON subscriptions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Payments policies
CREATE POLICY "Users can view their own payments" 
  ON payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.id = payments.subscription_id 
    AND subscriptions.profile_id = auth.uid()
  ));

CREATE POLICY "Users can create their own payments" 
  ON payments FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE subscriptions.id = payments.subscription_id 
    AND subscriptions.profile_id = auth.uid()
  ));

CREATE POLICY "Only admins can update payment status" 
  ON payments FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Topics policies
CREATE POLICY "Topics are viewable by everyone" 
  ON topics FOR SELECT USING (true);

CREATE POLICY "Only admins can manage topics" 
  ON topics FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- User interests policies
CREATE POLICY "Users can view their own interests" 
  ON user_interests FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage their own interests" 
  ON user_interests FOR ALL USING (auth.uid() = profile_id);

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests" 
  ON verification_requests FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can submit verification requests" 
  ON verification_requests FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Only admins can update verification requests" 
  ON verification_requests FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Events policies
CREATE POLICY "Events are viewable by everyone" 
  ON events FOR SELECT USING (true);

CREATE POLICY "Only paid organizers can create events" 
  ON events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p
    JOIN subscriptions s ON p.id = s.profile_id
    WHERE p.id = auth.uid() 
    AND p.user_type = 'organizer'
    AND p.is_verified = true
    AND s.tier = 'paid_organizer'
    AND s.status = 'active'
  ));

CREATE POLICY "Organizers can update their own events" 
  ON events FOR UPDATE USING (auth.uid() = created_by);

-- Event topics policies
CREATE POLICY "Event topics are viewable by everyone" 
  ON event_topics FOR SELECT USING (true);

CREATE POLICY "Only the event creator can manage event topics" 
  ON event_topics FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_topics.event_id 
    AND events.created_by = auth.uid()
  ));

-- Saved events policies
CREATE POLICY "Users can view their own saved events" 
  ON saved_events FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage their own saved events" 
  ON saved_events FOR ALL USING (auth.uid() = profile_id);

-- Submissions policies
CREATE POLICY "Users can view relevant submissions" 
  ON submissions FOR SELECT 
  USING (
    auth.uid() = submitted_by OR 
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = submissions.event_id 
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Only paid researchers can create submissions" 
  ON submissions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN subscriptions s ON p.id = s.profile_id
      WHERE p.id = auth.uid() 
      AND p.user_type = 'researcher'
      AND s.tier = 'paid_researcher'
      AND s.status = 'active'
    )
  );

CREATE POLICY "Only event organizers can update submissions" 
  ON submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = submissions.event_id 
      AND events.created_by = auth.uid()
    )
  );

-- Submission keywords policies
CREATE POLICY "Submission keywords are viewable by relevant parties" 
  ON submission_keywords FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = submission_keywords.submission_id 
      AND (
        submissions.submitted_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM events 
          WHERE events.id = submissions.event_id 
          AND events.created_by = auth.uid()
        )
      )
    )
  );

-- Submission files policies
CREATE POLICY "Submission files are viewable by relevant parties" 
  ON submission_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = submission_files.submission_id 
      AND (
        submissions.submitted_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM events 
          WHERE events.id = submissions.event_id 
          AND events.created_by = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Only submission author can upload files" 
  ON submission_files FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = submission_files.submission_id 
      AND submissions.submitted_by = auth.uid()
    )
  );

-- Email templates, queue, logs policies (admin only)
CREATE POLICY "Only admins can access email templates" 
  ON email_templates FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

CREATE POLICY "Only admins can access email queue" 
  ON email_queue FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

CREATE POLICY "Only admins can access email logs" 
  ON email_logs FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Analytics events policies
CREATE POLICY "Only admins can view analytics events" 
  ON analytics_events FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Update RLS policies to exclude soft-deleted records
CREATE POLICY "Public profiles exclude deleted" 
  ON profiles FOR SELECT 
  USING (deleted_at IS NULL);

CREATE POLICY "Events exclude deleted" 
  ON events FOR SELECT 
  USING (deleted_at IS NULL);

CREATE POLICY "Submissions exclude deleted" 
  ON submissions FOR SELECT 
  USING (deleted_at IS NULL);

CREATE POLICY "Submission files exclude deleted" 
  ON submission_files FOR SELECT 
  USING (deleted_at IS NULL);

-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking changes to critical data';
COMMENT ON COLUMN audit_logs.table_name IS 'Name of the table where the change occurred';
COMMENT ON COLUMN audit_logs.record_id IS 'Primary key of the record that was changed';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (INSERT, UPDATE, DELETE, SOFT_DELETE)';
COMMENT ON COLUMN audit_logs.old_data IS 'JSON representation of the data before the change';
COMMENT ON COLUMN audit_logs.new_data IS 'JSON representation of the data after the change';
COMMENT ON COLUMN audit_logs.changed_by IS 'Reference to the user who made the change';

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access audit logs
CREATE POLICY "Only admins can access audit logs" 
  ON audit_logs FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

--------------------------------------------------
-- VIEWS
--------------------------------------------------

-- Upcoming events
CREATE VIEW upcoming_events AS
SELECT e.*
FROM events e
WHERE e.event_date > NOW()
AND e.status IN ('published', 'active');

-- Events with open submissions
CREATE VIEW events_open_for_submissions AS
SELECT e.*
FROM events e
WHERE e.submission_deadline > NOW()
AND e.status IN ('published', 'active');

-- Recent submissions
CREATE VIEW recent_submissions AS
SELECT s.*, e.name as event_name, p.display_name as researcher_name
FROM submissions s
JOIN events e ON s.event_id = e.id
JOIN profiles p ON s.submitted_by = p.id
ORDER BY s.submission_date DESC;

-- Pending verifications
CREATE VIEW pending_verifications AS
SELECT v.*, p.display_name, p.email
FROM verification_requests v
JOIN profiles p ON v.profile_id = p.id
WHERE v.status = 'submitted'
ORDER BY v.created_at ASC;

-- Pending payments
CREATE VIEW pending_payments AS
SELECT 
  pay.*, 
  s.tier, 
  p.display_name, 
  p.email
FROM payments pay
JOIN subscriptions s ON pay.subscription_id = s.id
JOIN profiles p ON s.profile_id = p.id
WHERE pay.status = 'pending'
ORDER BY pay.created_at ASC;

-- User dashboard summary
CREATE VIEW user_dashboard_summary AS
SELECT 
  p.id as profile_id,
  p.display_name,
  p.user_type,
  p.is_verified,
  s.tier as subscription_tier,
  s.status as subscription_status,
  s.trial_end_date,
  s.end_date as subscription_end_date,
  (SELECT COUNT(*) FROM submissions sub WHERE sub.submitted_by = p.id) as submission_count,
  (SELECT COUNT(*) FROM saved_events se WHERE se.profile_id = p.id) as saved_events_count,
  (SELECT COUNT(*) FROM events e WHERE e.created_by = p.id) as created_events_count
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.profile_id;

--------------------------------------------------
-- REALTIME PUBLICATIONS
--------------------------------------------------

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE verification_requests; 