-- Desktop (Electron) chat requests. One row per requestId: it dedupes
-- retries, enforces one active request per user, and backs the per-minute
-- and daily limits (Vercel instances share no memory, so this lives here).
-- Never stores prompts, images, access keys or raw IPs. The response text is
-- kept briefly so a retried requestId gets its answer without a second
-- Gemini call; rows are purged after two days.
CREATE TABLE IF NOT EXISTS desktop_chat_requests (
  request_id      UUID PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_fp          TEXT NOT NULL,             -- first 16 hex of the key's SHA-256
  ip_hash         TEXT NOT NULL,             -- keyed hash, not the IP
  device_id       TEXT,
  app_version     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'failed')),
  error_code      TEXT,
  model           TEXT,
  finish_reason   TEXT,
  input_tokens    INT NOT NULL DEFAULT 0,
  output_tokens   INT NOT NULL DEFAULT 0,
  thinking_tokens INT NOT NULL DEFAULT 0,
  cached_tokens   INT NOT NULL DEFAULT 0,
  total_tokens    INT NOT NULL DEFAULT 0,
  response        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS desktop_chat_user_time ON desktop_chat_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS desktop_chat_ip_time ON desktop_chat_requests (ip_hash, created_at DESC);

-- Server-only.
ALTER TABLE desktop_chat_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON desktop_chat_requests TO service_role;

NOTIFY pgrst, 'reload schema';
