-- Define ENUM types aligned with Project Summary
DROP TYPE IF EXISTS public.user_type_enum CASCADE;
CREATE TYPE public.user_type_enum AS ENUM (
    'researcher', -- Changed from attendee
    'organizer',
    'admin'
);

DROP TYPE IF EXISTS public.subscription_tier_enum CASCADE;
CREATE TYPE public.subscription_tier_enum AS ENUM (
    'free',
    'paid_researcher',
    'paid_organizer',
    'trial'
);

DROP TYPE IF EXISTS public.payment_status_enum CASCADE;
CREATE TYPE public.payment_status_enum AS ENUM (
    'pending_verification', -- Changed from pending
    'verified',           -- Changed from completed
    'rejected'            -- Removed failed, refunded
);

-- Added missing ENUMs from Summary
DROP TYPE IF EXISTS public.payment_method_enum CASCADE;
CREATE TYPE public.payment_method_enum AS ENUM (
    'bank',
    'check',
    'cash',
    'online' -- Keep online for future use, though MVP is manual
);

DROP TYPE IF EXISTS public.billing_period_enum CASCADE;
CREATE TYPE public.billing_period_enum AS ENUM (
    'monthly',
    'quarterly',
    'biannual',
    'annual'
);

DROP TYPE IF EXISTS public.subscription_status_enum CASCADE;
CREATE TYPE public.subscription_status_enum AS ENUM (
    'active',
    'expired',
    'trial',
    'cancelled'
);

-- Drop tables in reverse order of dependency to handle FKs
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.dairas CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.wilayas CASCADE;

-- Create wilayas table (Using INT ID as per summary basic definition, though SERIAL/TEXT code might be better in practice)
CREATE TABLE public.wilayas (
    id INT PRIMARY KEY, -- Changed from SERIAL, removed code
    name_ar TEXT NOT NULL,
    name_other TEXT NOT NULL, -- For English/French or other non-Arabic name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create dairas table (Using INT IDs as per summary basic definition)
CREATE TABLE public.dairas (
    id INT PRIMARY KEY, -- Changed from SERIAL, removed code
    wilaya_id INT NOT NULL REFERENCES public.wilayas(id) ON DELETE CASCADE, -- Changed from wilaya_code (TEXT)
    name_ar TEXT NOT NULL,
    name_other TEXT NOT NULL, -- For English/French or other non-Arabic name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table (Aligning closer to summary base definition)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- email TEXT UNIQUE NOT NULL, -- email is available from auth.users
    user_type public.user_type_enum NOT NULL DEFAULT 'researcher', -- Default to researcher
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Added from summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    -- Removed extra fields like full_name, username, location etc. - these belong in extended profile tables
);

-- Create payments table (Aligning with Summary for manual verification)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id), -- Added FK link based on summary text
    status public.payment_status_enum NOT NULL DEFAULT 'pending_verification',
    amount NUMERIC(10, 2) NOT NULL,
    billing_period public.billing_period_enum NOT NULL,
    payment_method_reported public.payment_method_enum NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE, -- Nullable until verified
    admin_verifier_id UUID REFERENCES public.profiles(id), -- Assuming admin profile is in profiles table with type admin
    admin_notes TEXT, -- Likely internal, translation may not be needed.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    -- Removed provider, provider_payment_id, metadata as they are for online payments
);

-- Create subscriptions table (Aligning with Summary)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE, -- Ensure one subscription per user
    tier public.subscription_tier_enum NOT NULL DEFAULT 'free',
    status public.subscription_status_enum NOT NULL DEFAULT 'trial', -- Added status
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE, -- Calculated based on billing period and start date/verification
    trial_ends_at TIMESTAMP WITH TIME ZONE, -- Added trial end date
    -- Removed payment_id FK, Payment links to Subscription as per summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to tables and columns (Optional but recommended)
COMMENT ON TABLE public.wilayas IS 'Algerian provinces/states.';
COMMENT ON TABLE public.dairas IS 'Algerian districts/counties.';
COMMENT ON TABLE public.profiles IS 'Core user profile information linked to authentication, includes verification status.';
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the user account has been manually verified by an admin.';
COMMENT ON TABLE public.payments IS 'Records of manual payments reported by users and verified by admins.';
COMMENT ON COLUMN public.payments.admin_verifier_id IS 'Admin profile ID who verified the payment.';
COMMENT ON COLUMN public.payments.admin_notes IS 'Internal notes from the admin regarding the payment verification.';
COMMENT ON TABLE public.subscriptions IS 'User subscription status, tier, and lifecycle.';
COMMENT ON COLUMN public.subscriptions.status IS 'Current status of the subscription (active, expired, trial, cancelled).';
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS 'Timestamp when the initial trial period ends.';
