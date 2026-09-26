-- Rotating per-user access keys. Each user has one current key, valid for a
-- 12-hour window. Only a SHA-256 hash is stored; the key itself is derived
-- on the server from a secret, so a database leak doesn't expose keys.
CREATE TABLE IF NOT EXISTS user_access_keys (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash    TEXT NOT NULL UNIQUE,
  issued_at   TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Server-only table: no policies, so the anon/authenticated roles can't read it.
ALTER TABLE user_access_keys ENABLE ROW LEVEL SECURITY;
GRANT ALL ON user_access_keys TO service_role;

NOTIFY pgrst, 'reload schema';
