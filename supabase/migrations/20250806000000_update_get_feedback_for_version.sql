-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_feedback_for_version(UUID);

-- Update the get_feedback_for_version function to improve display names for different user types
CREATE OR REPLACE FUNCTION public.get_feedback_for_version(p_version_id UUID)
RETURNS TABLE (
  id UUID,
  submission_version_id UUID,
  providing_user_id UUID,
  role_at_submission public.user_type_enum,
  feedback_content text,
  created_at timestamptz,
  updated_at timestamptz,
  provider_name text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id,
    sf.submission_version_id,
    sf.providing_user_id,
    sf.role_at_submission,
    sf.feedback_content,
    sf.created_at,
    sf.updated_at,
    -- Improved provider_name handling for all user types
    CASE 
      WHEN sf.role_at_submission = 'researcher' THEN 
        COALESCE(rp.name, 'Unknown Researcher')
      WHEN sf.role_at_submission = 'organizer' THEN 
        COALESCE(
          op.name_translations ->> op.language,
          (SELECT value FROM jsonb_each_text(op.name_translations) WHERE value IS NOT NULL LIMIT 1),
          'Unknown Organizer'
        )
      WHEN sf.role_at_submission = 'admin' THEN 
        COALESCE(ap.name, 'Unknown Admin')
      ELSE 'Unknown User'
    END AS provider_name
  FROM 
    public.submission_feedback sf
    -- Join for researcher names
    LEFT JOIN public.profiles p_researcher ON sf.providing_user_id = p_researcher.id AND sf.role_at_submission = 'researcher'
    LEFT JOIN public.researcher_profiles rp ON p_researcher.id = rp.profile_id
    
    -- Join for organizer names
    LEFT JOIN public.profiles p_organizer ON sf.providing_user_id = p_organizer.id AND sf.role_at_submission = 'organizer'
    LEFT JOIN public.organizer_profiles op ON p_organizer.id = op.profile_id
    
    -- Join for admin names
    LEFT JOIN public.profiles p_admin ON sf.providing_user_id = p_admin.id AND sf.role_at_submission = 'admin'
    LEFT JOIN public.admin_profiles ap ON p_admin.id = ap.profile_id
  WHERE 
    sf.submission_version_id = p_version_id
  ORDER BY 
    sf.created_at DESC;
END;
$$; 