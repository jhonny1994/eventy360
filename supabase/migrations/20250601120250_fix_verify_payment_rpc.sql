-- Fix ambiguous column reference in verify_payment function
-- The issue is with the admin_notes parameter having the same name as the table column

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.verify_payment(UUID, payment_status_enum, TEXT, TEXT);

-- Create the fixed function
CREATE OR REPLACE FUNCTION public.verify_payment(
  payment_id UUID,
  verify_status payment_status_enum,
  p_admin_notes TEXT DEFAULT NULL, -- Changed parameter name to p_admin_notes
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
  -- Fixed: Use p_admin_notes to avoid ambiguity with table column
  UPDATE payments SET
    status = verify_status,
    admin_notes = COALESCE(p_admin_notes, payments.admin_notes),
    admin_verifier_id = v_user_id,
    verified_at = CASE WHEN verify_status = 'verified' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = payment_id;
  
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
    CASE 
      WHEN verify_status = 'verified' THEN 'updated_payment_status'
      WHEN verify_status = 'rejected' THEN 'updated_payment_status'
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

-- Add comment to function
COMMENT ON FUNCTION public.verify_payment(UUID, payment_status_enum, TEXT, TEXT) IS 'Admin function to verify or reject a payment proof. Fixed ambiguous column reference. Logs the action to admin_actions_log.'; 