-- =====================================================================
--  Resume fields + private storage policies
--
--  Splits out of 0002 because that file was already applied: its
--  CREATE TABLE IF NOT EXISTS skipped `profiles` on the second run, so
--  the resume columns added to it later never landed.
-- =====================================================================

-- The file itself lives in the private `user-documents` bucket; these
-- columns are just the pointer to it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_path     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_filename TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMPTZ;

-- ------------------------------------------------- resume storage
-- `user-documents` is private. These policies let a signed-in reader touch
-- only files under a folder named after their own user id, which is the
-- layout the uploader writes to: "{user_id}/resume.pdf".
DROP POLICY IF EXISTS "own documents read"   ON storage.objects;
DROP POLICY IF EXISTS "own documents insert" ON storage.objects;
DROP POLICY IF EXISTS "own documents update" ON storage.objects;
DROP POLICY IF EXISTS "own documents delete" ON storage.objects;

CREATE POLICY "own documents read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';

-- Confirm the columns landed this time.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
