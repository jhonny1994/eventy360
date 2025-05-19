-- Add language column to both profile tables with 'ar' (Arabic) as the default
-- This addresses an issue where the email notification system was looking for a non-existent column

-- Add language column to researcher_profiles
ALTER TABLE public.researcher_profiles 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'ar';

-- Add comment explaining the column
COMMENT ON COLUMN public.researcher_profiles.language IS 'User preferred language (default: ar) for emails and notifications';

-- Update existing rows to ensure they have Arabic as default
UPDATE public.researcher_profiles 
SET language = 'ar' 
WHERE language IS NULL;

-- Add language column to organizer_profiles
ALTER TABLE public.organizer_profiles 
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'ar';

-- Add comment explaining the column
COMMENT ON COLUMN public.organizer_profiles.language IS 'User preferred language (default: ar) for emails and notifications';

-- Update existing rows to ensure they have Arabic as default
UPDATE public.organizer_profiles 
SET language = 'ar' 
WHERE language IS NULL;

-- Create indexes for faster language preference lookups
CREATE INDEX IF NOT EXISTS idx_researcher_profiles_language 
ON public.researcher_profiles(language);

CREATE INDEX IF NOT EXISTS idx_organizer_profiles_language 
ON public.organizer_profiles(language); 