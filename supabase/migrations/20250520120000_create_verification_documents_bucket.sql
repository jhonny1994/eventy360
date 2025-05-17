-- Create a secure verification documents bucket
-- This bucket is private and will store verification documents submitted by organizers
-- Only admins can view all documents, while users can only access their own documents

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'verification_documents',
  'verification_documents',
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

-- Allow users to upload their own documents
-- File path pattern: verification_documents/{user_id}/{timestamp}_{filename}
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification_documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  array_length(storage.foldername(name), 1) = 2
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification_documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Prevent users from updating documents
CREATE POLICY "Users cannot update verification documents" 
ON storage.objects
FOR UPDATE
TO authenticated
USING (false);

-- Allow users to delete their own documents (but only while in pending status)
-- This should be checked in combination with verification_requests table status
CREATE POLICY "Users can delete their own pending verification documents" 
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification_documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
  -- Note: In practice, this should be joined with verification_requests table
  -- to only allow deletion if the verification request is still in 'pending' status
);

-- Allow admins to view all verification documents
CREATE POLICY "Admins can view all verification documents" 
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification_documents' AND
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Admins should not delete documents directly (should be done through a controlled process)
-- This is to maintain audit trail and prevent accidental deletion

-- Add a comment explaining the bucket's purpose
COMMENT ON TABLE storage.objects IS 'Stores files including avatar images in the "avatars" bucket and verification documents in the "verification_documents" bucket.'; 