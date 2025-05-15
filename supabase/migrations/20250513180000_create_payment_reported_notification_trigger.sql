-- Create trigger for new payment insertions (user reports payment)
CREATE OR REPLACE FUNCTION handle_payment_reported()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue notification email for payment pending verification
  INSERT INTO notification_queue (
    template_key,
    recipient_profile_id,
    status,
    attempts,
    payload_data,
    notification_type
  ) VALUES (
    'payment_received_pending_verification',
    NEW.user_id,
    'pending',
    0,
    jsonb_build_object(
      'payment_id', NEW.id,
      'amount', NEW.amount,
      'reported_at', NEW.reported_at,
      'payment_method', NEW.payment_method_reported,
      'billing_period', NEW.billing_period,
      'reference_number', NEW.id  -- Using payment ID as reference number
    ),
    'immediate'  -- Process this immediately
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on payments table for new insertions
DROP TRIGGER IF EXISTS payment_reported_trigger ON payments;

CREATE TRIGGER payment_reported_trigger
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION handle_payment_reported(); 