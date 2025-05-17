-- Create verification request status enum type
CREATE TYPE verification_request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Create the verification_requests table
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_path TEXT NOT NULL,
  status verification_request_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add appropriate comments
COMMENT ON TABLE verification_requests IS 'Stores verification requests submitted by organizers to get verified badge';
COMMENT ON COLUMN verification_requests.document_path IS 'Path to the document in the verification_documents bucket';
COMMENT ON COLUMN verification_requests.status IS 'Status of the verification request: pending, approved, or rejected';
COMMENT ON COLUMN verification_requests.processed_at IS 'When the request was processed by an admin';
COMMENT ON COLUMN verification_requests.processed_by IS 'Admin who processed the verification request';
COMMENT ON COLUMN verification_requests.rejection_reason IS 'Reason for rejection if the request was rejected';

-- Add indexes for better performance
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_submitted_at ON verification_requests(submitted_at);

-- Enable RLS on the verification_requests table
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own verification requests
CREATE POLICY "Users can view their own verification requests"
ON verification_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own verification requests
CREATE POLICY "Users can submit their own verification requests"
ON verification_requests
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  status = 'pending'::verification_request_status
);

-- Prevent users from updating their verification requests
CREATE POLICY "Users cannot update verification requests"
ON verification_requests
FOR UPDATE
TO authenticated
USING (false);

-- Prevent users from deleting verification requests
CREATE POLICY "Users cannot delete verification requests"
ON verification_requests
FOR DELETE
TO authenticated
USING (false);

-- Allow admins to view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON verification_requests
FOR SELECT
TO authenticated
USING ((SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to update verification requests to approve or reject
CREATE POLICY "Admins can update verification requests"
ON verification_requests
FOR UPDATE
TO authenticated
USING ((SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin');

-- Grant appropriate privileges
GRANT USAGE ON TYPE verification_request_status TO authenticated;
GRANT SELECT, INSERT ON verification_requests TO authenticated;
GRANT UPDATE(status, processed_at, processed_by, rejection_reason, notes, updated_at) ON verification_requests TO authenticated;

-- Update the admin action type to include verification request management
ALTER TYPE admin_action_type ADD VALUE IF NOT EXISTS 'processed_verification_request';

-- Create a function to handle verification request processing
CREATE OR REPLACE FUNCTION handle_verification_request_processing()
RETURNS TRIGGER AS $$
DECLARE
  action_type admin_action_type;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set the processed_at and processed_by fields
    NEW.processed_at := NOW();
    NEW.processed_by := auth.uid();
    NEW.updated_at := NOW();
    
    -- Determine the action type based on the new status
    IF NEW.status = 'approved' THEN
      action_type := 'awarded_badge';
      
      -- Update the profile's is_verified status to true
      UPDATE profiles
      SET is_verified = TRUE
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      action_type := 'processed_verification_request';
    END IF;
    
    -- Log the admin action
    INSERT INTO admin_actions_log (
      action_type,
      admin_user_id,
      target_user_id,
      target_entity_id,
      target_entity_type,
      details
    ) VALUES (
      action_type,
      auth.uid(),
      NEW.user_id,
      NEW.id,
      'verification_request',
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'document_path', NEW.document_path,
        'rejection_reason', NEW.rejection_reason
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on verification_requests table
DROP TRIGGER IF EXISTS verification_request_processing_trigger ON verification_requests;

CREATE TRIGGER verification_request_processing_trigger
BEFORE UPDATE OF status ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION handle_verification_request_processing();

-- Create a function to ensure users don't submit duplicate pending requests
CREATE OR REPLACE FUNCTION check_pending_verification_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are any pending verification requests for this user
  IF EXISTS (
    SELECT 1 FROM verification_requests
    WHERE user_id = NEW.user_id
    AND status = 'pending'::verification_request_status
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'You already have a pending verification request.';
  END IF;
  
  -- Check if user is already verified
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = NEW.user_id
    AND is_verified = TRUE
  ) THEN
    RAISE EXCEPTION 'Your profile is already verified.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to prevent duplicate pending requests
CREATE TRIGGER check_pending_verification_requests_trigger
BEFORE INSERT ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION check_pending_verification_requests();

-- Add view to get the latest verification request for each user
CREATE OR REPLACE VIEW latest_verification_requests AS
SELECT DISTINCT ON (user_id)
  vr.*
FROM
  verification_requests vr
ORDER BY
  user_id, submitted_at DESC;

-- Expose visible to web users and admins
GRANT SELECT ON latest_verification_requests TO authenticated; 