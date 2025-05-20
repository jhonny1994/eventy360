-- Create function to get detailed payment information with user details
CREATE OR REPLACE FUNCTION public.get_payment_details(payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_payment RECORD;
  v_user_profile RECORD;
  v_admin_verifier_profile RECORD;
  v_result JSONB;
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
      WHEN p.user_type = 'organizer' THEN op.name_translations->>'en'
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
  
  -- Get admin verifier profile if payment was verified
  IF v_payment.admin_verifier_id IS NOT NULL THEN
    SELECT 
      ap.name AS admin_name
    INTO v_admin_verifier_profile
    FROM admin_profiles ap
    WHERE ap.profile_id = v_payment.admin_verifier_id;
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
  IF v_payment.admin_verifier_id IS NOT NULL AND v_admin_verifier_profile.admin_name IS NOT NULL THEN
    v_result := v_result || jsonb_build_object('admin_verifier_name', v_admin_verifier_profile.admin_name);
  END IF;
  
  RETURN v_result;
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION public.get_payment_details(UUID) IS 'Gets detailed payment information including user profile details for admin payment verification.'; 