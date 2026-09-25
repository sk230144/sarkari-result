-- =====================================================================
--  Cover letter generator: cleaned CVs, cached letters, AI usage log
--
--  All writes happen server-side with the service role, after the API
--  route has verified the session. Users may only read their own rows.
-- =====================================================================

-- One row per distinct resume file a user has processed. file_hash is the
-- SHA-256 of the PDF bytes, so re-using the same file never re-parses it.
-- cleaned_text has contact details and personal data already stripped;
-- those contact details live separately in `contact` and are added back by
-- the app when it wraps the letter, never sent to the model.
CREATE TABLE IF NOT EXISTS cv_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_hash     TEXT NOT NULL,
  filename      TEXT,
  cleaned_text  TEXT NOT NULL,
  contact       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, file_hash)
);

-- Generated letter bodies. jd_hash covers role + cleaned JD, so the same
-- CV applied to the same job is served from here at zero cost.
CREATE TABLE IF NOT EXISTS cover_letters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id       UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
  jd_hash     TEXT NOT NULL,
  role        TEXT NOT NULL,
  jd_clean    TEXT,
  operator    TEXT NOT NULL,
  believer    TEXT NOT NULL,
  short       TEXT NOT NULL,
  model       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cover_letters_lookup
  ON cover_letters (user_id, cv_id, jd_hash, created_at DESC);

-- Every paid model call, for the per-user daily limit and cost tracking.
CREATE TABLE IF NOT EXISTS ai_usage (
  id               BIGSERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind             TEXT NOT NULL,
  model            TEXT NOT NULL,
  input_tokens     INT NOT NULL DEFAULT 0,
  output_tokens    INT NOT NULL DEFAULT 0,
  thinking_tokens  INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_user_time
  ON ai_usage (user_id, created_at DESC);

ALTER TABLE cv_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage      ENABLE ROW LEVEL SECURITY;

-- Read-only access to your own rows. No insert/update/delete policies:
-- only the service role (API routes) writes these tables.
DROP POLICY IF EXISTS "own cv read"      ON cv_documents;
DROP POLICY IF EXISTS "own letters read" ON cover_letters;
DROP POLICY IF EXISTS "own usage read"   ON ai_usage;

CREATE POLICY "own cv read"      ON cv_documents  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own letters read" ON cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own usage read"   ON ai_usage      FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON cv_documents, cover_letters, ai_usage TO authenticated;
GRANT ALL    ON cv_documents, cover_letters, ai_usage TO service_role;
GRANT USAGE, SELECT ON SEQUENCE ai_usage_id_seq TO service_role;

NOTIFY pgrst, 'reload schema';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('cv_documents', 'cover_letters', 'ai_usage')
ORDER BY table_name;
