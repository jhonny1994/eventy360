-- Create function to check subscriptions expiring or expiring soon
CREATE OR REPLACE FUNCTION check_subscriptions_expiry()
RETURNS VOID AS $$
DECLARE
  expiring_trial RECORD;
  expired_trial RECORD;
BEGIN
  -- Process trials ending in 3 days
  FOR expiring_trial IN
    SELECT 
      s.user_id, 
      p.id AS profile_id, 
      s.trial_ends_at, 
      s.status
    FROM subscriptions s
    JOIN profiles p ON s.user_id = p.id
    WHERE 
      s.status = 'trial' 
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      -- Avoid duplicate notifications by checking if one was sent in the last day
      AND NOT EXISTS (
        SELECT 1 FROM notification_queue nq
        WHERE 
          nq.recipient_profile_id = s.user_id 
          AND nq.template_key = 'trial_ending_soon'
          AND nq.created_at > NOW() - INTERVAL '1 day'
      )
  LOOP
    -- Call the function we created in the previous migration
    PERFORM queue_trial_expiry_notification(
      expiring_trial.profile_id, 
      EXTRACT(DAY FROM expiring_trial.trial_ends_at - NOW())::INTEGER,
      'trial_ending_soon'
    );
  END LOOP;

  -- Process expired trials (ended in the last day)
  FOR expired_trial IN
    SELECT 
      s.user_id, 
      p.id AS profile_id, 
      s.trial_ends_at, 
      s.status
    FROM subscriptions s
    JOIN profiles p ON s.user_id = p.id
    WHERE 
      s.status = 'trial' 
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at < NOW()
      AND s.trial_ends_at > NOW() - INTERVAL '1 day'
      -- Avoid duplicate notifications
      AND NOT EXISTS (
        SELECT 1 FROM notification_queue nq
        WHERE 
          nq.recipient_profile_id = s.user_id 
          AND nq.template_key = 'trial_expired'
          AND nq.created_at > NOW() - INTERVAL '1 day'
      )
  LOOP
    -- Queue expired notification
    PERFORM queue_trial_expiry_notification(
      expired_trial.profile_id, 
      0,
      'trial_expired'
    );
    
    -- Update subscription status to expired
    UPDATE subscriptions
    SET status = 'expired'
    WHERE user_id = expired_trial.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 