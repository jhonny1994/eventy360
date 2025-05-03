-- Eventy360 Database Schema

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
CREATE TYPE subscription_tier_enum AS ENUM ('free_researcher', 'paid_researcher', 'free_organizer', 'paid_organizer');
CREATE TYPE subscription_status_enum AS ENUM ('free', 'paid', 'trial', 'expired');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'check', 'cash', 'online_payment');
CREATE TYPE verification_status_enum AS ENUM ('submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE verification_type_enum AS ENUM ('researcher', 'organizer');
CREATE TYPE file_type_enum AS ENUM ('abstract', 'full_paper');
CREATE TYPE billing_period_enum AS ENUM ('monthly', 'quarterly', 'biannual', 'annual');

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
  billing_period billing_period_enum NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
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
-- 16. Email Queue
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email VARCHAR NOT NULL,
  template_id VARCHAR NOT NULL,
  subject VARCHAR,
  body TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  language language_enum NOT NULL DEFAULT 'en',
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
);
-- 17. Email Events
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES email_queue(id),
  event_type VARCHAR NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 18. Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR NOT NULL,
  page_path VARCHAR,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. Audit Logs
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