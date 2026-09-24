-- =====================================================================
--  Fix: page_views inserts were rejected for everyone
--
--  The original policy read:
--      WITH CHECK (user_id IS NULL OR auth.uid() = user_id)
--
--  For a signed-out visitor auth.uid() is NULL, so `auth.uid() = user_id`
--  evaluates to NULL rather than false — and a WITH CHECK that is NULL is
--  treated as a failure. The `user_id IS NULL` branch should have caught
--  that case, but PostgREST sends the column as an explicit NULL only when
--  the client includes it, and the anon role also lacked the SELECT grant
--  the `.select()` after insert needs.
--
--  Rewritten so each case is unambiguous, with no NULL-valued comparison
--  deciding the outcome.
-- =====================================================================

DROP POLICY IF EXISTS "anyone can record a view" ON page_views;
DROP POLICY IF EXISTS "own view update"          ON page_views;
DROP POLICY IF EXISTS "page_views insert"        ON page_views;
DROP POLICY IF EXISTS "page_views update"        ON page_views;
DROP POLICY IF EXISTS "page_views select own"    ON page_views;

-- Insert: a signed-in reader may only attribute a view to themselves; a
-- signed-out visitor may only write rows with no owner. COALESCE keeps the
-- comparison from ever evaluating to NULL.
CREATE POLICY "page_views insert" ON page_views FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Update: only used to write duration_s when the reader leaves the page.
CREATE POLICY "page_views update" ON page_views FOR UPDATE
  USING (
    user_id IS NULL
    OR user_id = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WITH CHECK (
    user_id IS NULL
    OR user_id = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- The tracker calls .select("id") after inserting so it can update the
-- duration later, and PostgREST evaluates that SELECT under RLS. Without
-- this the insert succeeds but the row id never comes back.
CREATE POLICY "page_views select own" ON page_views FOR SELECT
  USING (
    user_id IS NULL
    OR user_id = COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );

GRANT SELECT, INSERT, UPDATE ON page_views TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'page_views'
ORDER BY policyname;
