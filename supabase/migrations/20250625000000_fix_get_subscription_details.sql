-- Fix the get_subscription_details function to avoid GROUP BY error
CREATE OR REPLACE FUNCTION public.get_subscription_details(
  target_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID;
  v_subscription RECORD;
  v_profile RECORD;
  v_payments JSON;
  v_pricing JSON;
  v_result JSON;
  v_is_admin BOOLEAN;
BEGIN
  -- Determine target user (current user or specified user for admins)
  v_user_id := COALESCE(target_user_id, auth.uid());
  
  -- If target_user_id is provided, verify the current user is an admin
  IF target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN
    SELECT (user_type = 'admin') INTO v_is_admin FROM profiles WHERE id = auth.uid();
    
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Permission denied: Only admins can view other users'' subscription details';
    END IF;
  END IF;
  
  -- Get profile information
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  
  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Get subscription information
  SELECT * INTO v_subscription FROM subscriptions WHERE user_id = v_user_id;
  
  -- Get recent payments - Fixed query to avoid GROUP BY error
  SELECT json_agg(payment_data)
  INTO v_payments
  FROM (
    SELECT
      json_build_object(
        'id', p.id,
        'status', p.status,
        'amount', p.amount,
        'billing_period', p.billing_period,
        'payment_method', p.payment_method_reported,
        'reported_at', p.reported_at,
        'verified_at', p.verified_at,
        'reference_number', p.reference_number,
        'has_proof_document', (p.proof_document_path IS NOT NULL)
      ) AS payment_data
    FROM payments p
    WHERE p.user_id = v_user_id
    ORDER BY p.reported_at DESC
    LIMIT 5
  ) subquery;
  
  -- Get pricing information for the current subscription tier if available
  IF v_subscription IS NOT NULL AND v_subscription.tier != 'free' AND v_subscription.tier != 'trial' THEN
    -- Use a pricing tier corresponding to the user type
    v_pricing := public.get_subscription_pricing(
      v_profile.user_type,
      -- If no billing period info is directly associated with subscription, use monthly as default
      COALESCE(
        (SELECT billing_period FROM payments 
         WHERE subscription_id = v_subscription.id 
         ORDER BY verified_at DESC LIMIT 1),
        'monthly'::billing_period_enum
      )
    );
  END IF;
  
  -- Build the result JSON
  IF v_subscription IS NULL THEN
    -- User has no subscription record yet
    v_result := json_build_object(
      'has_subscription', false,
      'user_id', v_user_id,
      'user_type', v_profile.user_type,
      'profile', json_build_object(
        'is_verified', v_profile.is_verified,
        'user_type', v_profile.user_type
      ),
      'payments', COALESCE(v_payments, '[]'::json)
    );
  ELSE
    -- User has a subscription record
    v_result := json_build_object(
      'has_subscription', true,
      'user_id', v_user_id,
      'user_type', v_profile.user_type,
      'subscription', json_build_object(
        'id', v_subscription.id,
        'tier', v_subscription.tier,
        'status', v_subscription.status,
        'start_date', v_subscription.start_date,
        'end_date', v_subscription.end_date,
        'trial_ends_at', v_subscription.trial_ends_at,
        'days_remaining', 
          CASE 
            WHEN v_subscription.status = 'active' AND v_subscription.end_date IS NOT NULL 
            THEN GREATEST(0, EXTRACT(DAY FROM (v_subscription.end_date - NOW())))::INTEGER
            WHEN v_subscription.status = 'trial' AND v_subscription.trial_ends_at IS NOT NULL 
            THEN GREATEST(0, EXTRACT(DAY FROM (v_subscription.trial_ends_at - NOW())))::INTEGER
            ELSE 0
          END,
        'is_active', 
          (v_subscription.status = 'active' AND (v_subscription.end_date IS NULL OR v_subscription.end_date > NOW())) OR
          (v_subscription.status = 'trial' AND (v_subscription.trial_ends_at IS NULL OR v_subscription.trial_ends_at > NOW()))
      ),
      'profile', json_build_object(
        'is_verified', v_profile.is_verified,
        'user_type', v_profile.user_type
      ),
      'payments', COALESCE(v_payments, '[]'::json),
      'pricing', v_pricing
    );
  END IF;
  
  RETURN v_result;
END;
$$; 