-- Add function to get subscription details with event quota information
CREATE OR REPLACE FUNCTION public.get_subscription_details(target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    subscription_data JSONB;
    user_type_value user_type_enum;
    active_events_count INTEGER;
    max_events_allowed INTEGER;
BEGIN
    -- Determine which user to get data for
    IF target_user_id IS NULL THEN
        current_user_id := auth.uid();
    ELSE
        -- Check if requesting user is an admin when getting data for a different user
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only admins can fetch subscription data for other users';
        END IF;
        current_user_id := target_user_id;
    END IF;

    -- Get user type
    SELECT user_type INTO user_type_value
    FROM profiles
    WHERE id = current_user_id;

    -- Get the active events count for organizers
    IF user_type_value = 'organizer' THEN
        SELECT COUNT(*) INTO active_events_count
        FROM events
        WHERE created_by = current_user_id 
        AND status != 'canceled';
    ELSE
        active_events_count := 0;
    END IF;

    -- Determine max events allowed based on subscription tier
    SELECT
        CASE
            WHEN s.tier = 'free' THEN 0
            WHEN s.tier = 'trial' THEN 3
            WHEN s.tier = 'paid_organizer' THEN 
                CASE
                    -- Different limits based on billing period
                    WHEN p.billing_period = 'monthly' THEN 5
                    WHEN p.billing_period = 'quarterly' THEN 10
                    WHEN p.billing_period = 'biannual' THEN 15
                    WHEN p.billing_period = 'annual' THEN 20
                    ELSE 5 -- Default to monthly limit
                END
            ELSE 0
        END INTO max_events_allowed
    FROM subscriptions s
    LEFT JOIN payments p ON p.id = (
        SELECT id FROM payments 
        WHERE user_id = current_user_id AND status = 'verified'
        ORDER BY verified_at DESC LIMIT 1
    )
    WHERE s.user_id = current_user_id
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- If no subscription record found, set max_events_allowed to 0
    IF max_events_allowed IS NULL THEN
        max_events_allowed := 0;
    END IF;

    -- Build subscription data
    subscription_data := (
        SELECT
            jsonb_build_object(
                'has_subscription', (EXISTS (SELECT 1 FROM subscriptions WHERE user_id = current_user_id)),
                'user_id', current_user_id,
                'user_type', user_type_value,
                'subscription', (
                    SELECT jsonb_build_object(
                        'id', s.id,
                        'tier', s.tier,
                        'status', s.status,
                        'start_date', s.start_date,
                        'end_date', s.end_date,
                        'trial_ends_at', s.trial_ends_at,
                        'days_remaining', 
                            CASE
                                WHEN s.end_date IS NOT NULL THEN 
                                    GREATEST(0, EXTRACT(DAY FROM (s.end_date - CURRENT_TIMESTAMP)))::INTEGER
                                WHEN s.trial_ends_at IS NOT NULL THEN 
                                    GREATEST(0, EXTRACT(DAY FROM (s.trial_ends_at - CURRENT_TIMESTAMP)))::INTEGER
                                ELSE 0
                            END,
                        'is_active', 
                            CASE
                                WHEN s.status = 'active' THEN TRUE
                                WHEN s.status = 'trial' AND s.trial_ends_at > CURRENT_TIMESTAMP THEN TRUE
                                ELSE FALSE
                            END
                    )
                    FROM subscriptions s
                    WHERE s.user_id = current_user_id
                    ORDER BY s.created_at DESC
                    LIMIT 1
                ),
                'profile', (
                    SELECT jsonb_build_object(
                        'is_verified', p.is_verified,
                        'user_type', p.user_type
                    )
                    FROM profiles p
                    WHERE p.id = current_user_id
                ),
                'payments', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', p.id,
                            'status', p.status,
                            'amount', p.amount,
                            'billing_period', p.billing_period,
                            'payment_method', p.payment_method,
                            'reported_at', p.reported_at,
                            'verified_at', p.verified_at,
                            'reference_number', p.reference_number,
                            'has_proof_document', (
                                SELECT EXISTS (
                                    SELECT 1 FROM storage.objects
                                    WHERE bucket_id = 'payment_proofs'
                                    AND name LIKE current_user_id || '/' || p.id || '/%'
                                )
                            )
                        )
                    )
                    FROM payments p
                    WHERE p.user_id = current_user_id
                    ORDER BY p.reported_at DESC
                ),
                'pricing', (
                    SELECT jsonb_build_object(
                        'base_price_monthly', tier_info.base_price_monthly,
                        'billing_period', bp,
                        'discount_percentage', tier_info.discount_percentage,
                        'number_of_months', tier_info.number_of_months,
                        'price_before_discount', tier_info.base_price_monthly * tier_info.number_of_months,
                        'discount_amount', (tier_info.base_price_monthly * tier_info.number_of_months * tier_info.discount_percentage / 100)::NUMERIC(10,2),
                        'final_price', (tier_info.base_price_monthly * tier_info.number_of_months * (1 - tier_info.discount_percentage / 100))::NUMERIC(10,2),
                        'currency', 'DZD',
                        'user_type', user_type_value
                    )
                    FROM (
                        SELECT 
                            bp,
                            CASE 
                                WHEN user_type_value = 'researcher' THEN 500
                                WHEN user_type_value = 'organizer' THEN 1000
                                ELSE 0
                            END AS base_price_monthly,
                            CASE 
                                WHEN bp = 'monthly' THEN 0
                                WHEN bp = 'quarterly' THEN 10
                                WHEN bp = 'biannual' THEN 15
                                WHEN bp = 'annual' THEN 25
                                ELSE 0
                            END AS discount_percentage,
                            CASE 
                                WHEN bp = 'monthly' THEN 1
                                WHEN bp = 'quarterly' THEN 3
                                WHEN bp = 'biannual' THEN 6
                                WHEN bp = 'annual' THEN 12
                                ELSE 1
                            END AS number_of_months
                        FROM unnest(ARRAY['monthly', 'quarterly', 'biannual', 'annual']::text[]) AS bp
                        WHERE user_type_value IN ('researcher', 'organizer')
                    ) AS tier_info
                    WHERE bp = 'monthly' -- Default to showing monthly pricing
                ),
                'active_events_count', active_events_count,
                'max_events_allowed', max_events_allowed
            )
    );

    -- Return the final subscription data
    RETURN subscription_data;
END;
$$;

-- Update comment for the function
COMMENT ON FUNCTION public.get_subscription_details IS 'Get subscription details and status for a user, including event quota information. Admins can get details for any user by providing target_user_id.';

-- Grant execute permissions
ALTER FUNCTION public.get_subscription_details(UUID) SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.get_subscription_details(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_subscription_details(UUID) TO authenticated;
