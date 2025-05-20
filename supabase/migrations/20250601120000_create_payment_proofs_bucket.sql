-- Create a secure payment proofs bucket
-- This bucket is private and will store payment proof documents
-- Only admins can view all payment proofs, while users can only access their own

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'payment_proofs',
  'payment_proofs',
  FALSE, -- Not public, requires authentication
  FALSE, -- No avif detection needed for documents
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[] -- Allow only PDF, JPEG, and PNG
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[];

-- Enable Row Level Security (RLS) for this bucket
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;

-- Allow users to upload their own payment proofs
-- File path pattern: payment_proofs/{user_id}/{timestamp}_{filename}
CREATE POLICY "Users can upload their own payment proofs" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment_proofs' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  array_length(storage.foldername(name), 1) = 2
);

-- Allow edge functions (service role) to upload payment proofs
CREATE POLICY "Service role can upload payment proofs" 
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (
  bucket_id = 'payment_proofs'
);

-- Allow users to view their own payment proofs
CREATE POLICY "Users can view their own payment proofs" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment_proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Prevent users from updating payment proofs
CREATE POLICY "Users cannot update payment proofs" 
ON storage.objects
FOR UPDATE
TO authenticated
USING (false);

-- Allow users to delete their own payment proofs (but only while in pending status)
CREATE POLICY "Users can delete their own pending payment proofs" 
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment_proofs' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (
    SELECT 1 FROM payments
    WHERE 
      payments.user_id = auth.uid() AND
      payments.status = 'pending_verification'::payment_status_enum AND
      payments.proof_document_path LIKE ('payment_proofs/' || auth.uid() || '/%')
  )
);

-- Allow admins to view all payment proofs
CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment_proofs' AND
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Add a comment explaining the bucket's purpose
COMMENT ON TABLE storage.objects IS 'Stores files including payment proofs in the "payment_proofs" bucket.'; 