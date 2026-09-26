-- Mock interviews: generated questions, the user's answers (autosaved while
-- they work), and the AI evaluation. Written only by /api/mock-interview.
CREATE TABLE IF NOT EXISTS mock_interviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id          UUID REFERENCES cv_documents(id) ON DELETE SET NULL,
  role           TEXT NOT NULL,
  level          TEXT NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
  status         TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'evaluating', 'completed')),
  questions      JSONB NOT NULL,
  answers        JSONB NOT NULL DEFAULT '{}'::jsonb,
  results        JSONB,
  summary        JSONB,
  overall_score  INT,
  time_limit_s   INT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mock_interviews_user ON mock_interviews (user_id, created_at DESC);

ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own interviews read" ON mock_interviews;
CREATE POLICY "own interviews read" ON mock_interviews FOR SELECT USING (auth.uid() = user_id);
GRANT SELECT ON mock_interviews TO authenticated;
GRANT ALL ON mock_interviews TO service_role;

NOTIFY pgrst, 'reload schema';
