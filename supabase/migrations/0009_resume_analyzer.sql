-- =====================================================================
--  Resume analyzer: cached AI extractions and reports
--
--  Every table is written only by the service role from API routes.
--  Users may read their own reports; the shared caches (JD profiles, AI
--  risk per role) hold no personal data and stay server-only.
-- =====================================================================

-- Call A output, once per distinct resume file (cv_documents is per file hash).
CREATE TABLE IF NOT EXISTS cv_profiles (
  cv_id       UUID PRIMARY KEY REFERENCES cv_documents(id) ON DELETE CASCADE,
  profile     JSONB NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Call B output, once per unique cleaned JD (or per role title when no JD),
-- shared by all users.
CREATE TABLE IF NOT EXISTS jd_profiles (
  jd_hash     TEXT PRIMARY KEY,
  profile     JSONB NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finished report per (resume, JD) pair.
CREATE TABLE IF NOT EXISTS resume_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id       UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  jd_hash     TEXT NOT NULL,
  report      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cv_id, jd_hash)
);

CREATE INDEX IF NOT EXISTS resume_reports_user_time
  ON resume_reports (user_id, created_at DESC);

-- AI disruption estimate per normalized role title, not per user.
CREATE TABLE IF NOT EXISTS ai_risk (
  role_key    TEXT PRIMARY KEY,
  risk        JSONB NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cv_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_risk        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own reports read" ON resume_reports;
CREATE POLICY "own reports read" ON resume_reports FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON resume_reports TO authenticated;
GRANT ALL ON cv_profiles, jd_profiles, resume_reports, ai_risk TO service_role;

NOTIFY pgrst, 'reload schema';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cv_profiles', 'jd_profiles', 'resume_reports', 'ai_risk')
ORDER BY table_name;
