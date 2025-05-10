-- Enable RLS on the objects in the bucket if not already (though creating as public might handle this)
-- This is more a safeguard for the policies themselves to be enforced correctly.
-- Storage policies are slightly different from table RLS but principles are similar.

-- Policy: Allow authenticated users to UPLOAD their own avatar (filename is user_id.ext)
CREATE POLICY "Allow authenticated uploads for user_id filenames"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '.', 1) -- Assumes name is 'user_id.extension'
  -- Add other checks like file type, size if desired
);

-- Policy: Allow authenticated users to SELECT their own avatar
CREATE POLICY "Allow authenticated select for user_id filenames"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '.', 1)
);

-- Policy: Allow authenticated users to UPDATE/OVERWRITE their own avatar
CREATE POLICY "Allow authenticated updates for user_id filenames"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '.', 1)
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '.', 1)
);

-- Policy: Allow authenticated users to DELETE their own avatar
CREATE POLICY "Allow authenticated deletes for user_id filenames"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = split_part(name, '.', 1)
);

-- Policy: Public read access for all avatars in the bucket
-- This is needed if you want images to be directly viewable via their URL without auth.
-- Your client-side <Image> or <Avatar> component will need this.
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public  -- Or anon, public is broader
USING ( bucket_id = 'avatars' );
