-- Desktop (Electron) realtime transcription token requests. One row per
-- requestId: it stops a requestId being used twice and backs the per-user,
-- per-device, per-IP and daily limits (Vercel instances share no memory, so
-- this lives here). The ElevenLabs token itself is never stored: it is
-- single-use and goes straight back to the app. No access keys or raw IPs
-- either; rows are purged after two days.
CREATE TABLE IF NOT EXISTS desktop_transcription_requests (
  request_id   UUID PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id    UUID NOT NULL,
  ip_hash      TEXT NOT NULL,             -- keyed hash, not the IP
  app_version  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'failed')),
  error_code   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS desktop_transcription_user_time ON desktop_transcription_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS desktop_transcription_device_time ON desktop_transcription_requests (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS desktop_transcription_ip_time ON desktop_transcription_requests (ip_hash, created_at DESC);
-- The global daily limit counts every request that didn't fail.
CREATE INDEX IF NOT EXISTS desktop_transcription_live_time ON desktop_transcription_requests (created_at DESC) WHERE status <> 'failed';

-- Server-only.
ALTER TABLE desktop_transcription_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON desktop_transcription_requests TO service_role;

NOTIFY pgrst, 'reload schema';
