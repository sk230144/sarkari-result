-- =====================================================================
--  Usage analytics for the admin view
--
--  Supabase auth already records last_sign_in_at, so "last login" needs no
--  storage. Time-on-platform and section popularity do — nothing was being
--  recorded before this, so both start empty and fill as people use the
--  site.
--
--  One row per page visit rather than per session: sessions are derived by
--  grouping visits, which keeps writes append-only and avoids the client
--  having to hold session state across navigations.
-- =====================================================================

CREATE TABLE IF NOT EXISTS page_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Null for signed-out visitors: their traffic still counts toward
  -- section popularity even though it belongs to no account.
  user_id     UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Groups visits into a single visit-sequence. Generated per browser tab.
  session_id  TEXT NOT NULL,
  path        TEXT NOT NULL,
  -- "jobs", "dsa-sheets", "faang-questions" … the first path segment, so
  -- popularity can be counted without parsing paths at read time.
  section     TEXT NOT NULL,
  -- How long the page was actually open and visible, in seconds. Written
  -- when the reader leaves, so it is null for a visit still in progress.
  duration_s  INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The admin queries: activity per user, and totals per section.
CREATE INDEX IF NOT EXISTS page_views_user_idx    ON page_views (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_section_idx ON page_views (section, created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_session_idx ON page_views (session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anyone may record their own visit, including signed-out visitors. This
-- is deliberately permissive on INSERT: the table holds no secrets and
-- blocking anonymous writes would lose most of the traffic data.
DROP POLICY IF EXISTS "anyone can record a view" ON page_views;
CREATE POLICY "anyone can record a view" ON page_views FOR INSERT
  WITH CHECK (
    -- A signed-in reader may only attribute a view to themselves.
    user_id IS NULL OR auth.uid() = user_id
  );

-- Closing out a visit's duration: only the row's own owner, and only the
-- duration column matters. Anonymous rows are updatable by session id,
-- which is unguessable enough for a metric that carries no secrets.
DROP POLICY IF EXISTS "own view update" ON page_views;
CREATE POLICY "own view update" ON page_views FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Nobody reads this table through the anon key. The admin page reads it
-- server-side with the service key, which bypasses RLS — so there is
-- deliberately no SELECT policy.

GRANT INSERT, UPDATE ON page_views TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'page_views'
ORDER BY ordinal_position;
