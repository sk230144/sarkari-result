-- Public sharing of a finished mock interview report. Off by default; the
-- owner turns it on from the report. The link uses an unguessable token,
-- never the interview id, and turning sharing off makes the link dead.
ALTER TABLE mock_interviews
  ADD COLUMN IF NOT EXISTS share_token TEXT,
  ADD COLUMN IF NOT EXISTS is_public   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_at   TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS mock_interviews_share_token
  ON mock_interviews (share_token) WHERE share_token IS NOT NULL;

NOTIFY pgrst, 'reload schema';
