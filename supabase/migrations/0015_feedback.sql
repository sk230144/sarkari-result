-- User feedback. Written by /api/feedback, read and resolved only from the
-- admin page (service role). No browser access at all.
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT,
  email       TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('bug', 'idea', 'praise', 'other')),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  page        TEXT,
  user_agent  TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_created ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_user ON feedback (user_id, created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
GRANT ALL ON feedback TO service_role;

NOTIFY pgrst, 'reload schema';
