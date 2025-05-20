-- Create function to get payments with user details for listing
CREATE OR REPLACE FUNCTION public.get_payments_with_user_details()
RETURNS SETOF JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'user_name', CASE
      WHEN profiles.user_type = 'researcher' THEN rp.name
      WHEN profiles.user_type = 'organizer' THEN op.name_translations->>'en'
      WHEN profiles.user_type = 'admin' THEN ap.name
      ELSE 'Unknown User'
    END,
    'user_email', auth.email,
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
  LEFT JOIN auth.users auth ON p.user_id = auth.id
  LEFT JOIN researcher_profiles rp ON profiles.id = rp.profile_id AND profiles.user_type = 'researcher'
  LEFT JOIN organizer_profiles op ON profiles.id = op.profile_id AND profiles.user_type = 'organizer'
  LEFT JOIN admin_profiles ap ON profiles.id = ap.profile_id AND profiles.user_type = 'admin';
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION public.get_payments_with_user_details() IS 'Returns a view-like result of payments with user information for admin payment listing.'; 