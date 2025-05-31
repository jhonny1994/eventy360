-- Add a test trigger to help debug payment verification
-- This trigger will log additional information when a payment status is updated

CREATE OR REPLACE FUNCTION public.log_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log payment verification for debugging
  RAISE LOG 'PAYMENT VERIFICATION DEBUG - Payment ID: %, Old Status: %, New Status: %, User ID: %, Subscription ID: %',
    NEW.id, OLD.status, NEW.status, NEW.user_id, NEW.subscription_id;
    
  -- Continue with normal processing
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the test trigger
DROP TRIGGER IF EXISTS payment_verification_debug_trigger ON payments;
CREATE TRIGGER payment_verification_debug_trigger
AFTER UPDATE OF status ON payments
FOR EACH ROW
EXECUTE FUNCTION public.log_payment_verification();

-- Also add a test trigger to log subscription updates
CREATE OR REPLACE FUNCTION public.log_subscription_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Log subscription updates for debugging
  RAISE LOG 'SUBSCRIPTION UPDATE DEBUG - Subscription ID: %, User ID: %, Old Status: %, New Status: %, Old Tier: %, New Tier: %',
    NEW.id, NEW.user_id, OLD.status, NEW.status, OLD.tier, NEW.tier;
    
  -- Continue with normal processing
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the subscription debug trigger
DROP TRIGGER IF EXISTS subscription_update_debug_trigger ON subscriptions;
CREATE TRIGGER subscription_update_debug_trigger
AFTER UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_subscription_updates();
