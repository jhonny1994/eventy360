-- Create function for admins to record manual payments
CREATE OR REPLACE FUNCTION public.record_manual_payment(
  target_user_id UUID,
  amount NUMERIC,
  billing_period billing_period_enum,
  payment_method payment_method_enum DEFAULT 'cash',
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_id UUID := auth.uid();
  v_details JSONB;
  v_payment_id UUID;
  v_log_id BIGINT;
  v_subscription_id UUID;
  v_target_user_record RECORD;
BEGIN
  -- Check if the user is an admin
  SELECT (user_type = 'admin') INTO v_is_admin FROM profiles WHERE id = v_user_id;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied: Only admins can record manual payments';
  END IF;
  
  -- Validate target user exists
  SELECT * INTO v_target_user_record FROM profiles WHERE id = target_user_id;
  IF v_target_user_record IS NULL THEN
    RAISE EXCEPTION 'Target user not found with ID: %', target_user_id;
  END IF;
  
  -- Validate amount
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;
  
  -- Build details for logging
  v_details := jsonb_build_object(
    'amount', amount,
    'billing_period', billing_period,
    'payment_method', payment_method,
    'admin_notes', admin_notes,
    'is_manual_entry', true
  );
  
  -- Create a verified payment record (skipping the verification step)
  INSERT INTO payments (
    user_id,
    amount,
    billing_period,
    payment_method_reported,
    status,
    admin_verifier_id,
    admin_notes,
    verified_at
  ) VALUES (
    target_user_id,
    amount,
    billing_period,
    payment_method,
    'verified',
    v_user_id,
    admin_notes,
    NOW()
  ) RETURNING id INTO v_payment_id;
  
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
    'recorded_payment',
    target_user_id,
    v_payment_id,
    'payment',
    v_details
  ) RETURNING id INTO v_log_id;
  
  -- Get the subscription ID created/updated by the payment verification trigger
  SELECT subscription_id INTO v_subscription_id FROM payments WHERE id = v_payment_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Manual payment recorded successfully',
    'payment_id', v_payment_id,
    'subscription_id', v_subscription_id,
    'log_id', v_log_id,
    'user_id', target_user_id,
    'amount', amount,
    'billing_period', billing_period
  );
END;
$$;

-- Add comment to function
COMMENT ON FUNCTION public.record_manual_payment(UUID, NUMERIC, billing_period_enum, payment_method_enum, TEXT) IS 'Admin function to record a manual payment, creating a verified payment record directly. Logs the action to admin_actions_log.'; 