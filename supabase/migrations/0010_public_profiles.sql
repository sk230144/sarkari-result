-- =====================================================================
--  Public developer profiles
--
--  Profile content lives on `profiles`. Every new column is written only
--  by the /api/profile routes (service role) after validation: the browser
--  keeps UPDATE rights on the few columns it already wrote directly, so a
--  user cannot bypass validation to plant a bad link on their public page.
-- =====================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug               TEXT,
  ADD COLUMN IF NOT EXISTS headline           TEXT,
  ADD COLUMN IF NOT EXISTS location           TEXT,
  ADD COLUMN IF NOT EXISTS summary            TEXT,
  ADD COLUMN IF NOT EXISTS open_to_work       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banner             TEXT NOT NULL DEFAULT 'lime',
  ADD COLUMN IF NOT EXISTS github_username    TEXT,
  ADD COLUMN IF NOT EXISTS socials            JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS skills             JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience         JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education          JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects           JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS layout             JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme              TEXT NOT NULL DEFAULT 'midnight',
  ADD COLUMN IF NOT EXISTS apply_details      JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS resume_imported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referred_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Every profile gets an unguessable default slug; users can claim a custom one.
UPDATE profiles
SET slug = substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
WHERE slug IS NULL;

ALTER TABLE profiles
  ALTER COLUMN slug SET DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_slug_format;
ALTER TABLE profiles ADD CONSTRAINT profiles_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,29}$');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_key ON profiles (slug);
CREATE INDEX IF NOT EXISTS profiles_referred_by ON profiles (referred_by);

-- The browser may only touch the columns it always has; everything else
-- goes through the validated API.
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, resume_path, resume_filename, resume_uploaded_at) ON profiles TO authenticated;

-- ------------------------------------------------------- profile views
-- One row per viewer per profile per day; viewer_hash is a salted hash of
-- IP + user agent, never the raw values.
CREATE TABLE IF NOT EXISTS profile_views (
  id           BIGSERIAL PRIMARY KEY,
  profile_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_hash  TEXT NOT NULL,
  day          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, viewer_hash, day)
);
CREATE INDEX IF NOT EXISTS profile_views_profile_day ON profile_views (profile_id, day DESC);

-- -------------------------------------------------------- endorsements
CREATE TABLE IF NOT EXISTS endorsements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name      TEXT NOT NULL,
  author_headline  TEXT,
  relationship     TEXT NOT NULL,
  body             TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, author_id)
);

-- ------------------------------------------------------------ messages
CREATE TABLE IF NOT EXISTS profile_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name   TEXT NOT NULL,
  sender_email  TEXT NOT NULL,
  body          TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profile_messages_profile ON profile_messages (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS profile_messages_sender ON profile_messages (sender_id, created_at DESC);

ALTER TABLE profile_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_messages ENABLE ROW LEVEL SECURITY;
GRANT ALL ON profile_views, endorsements, profile_messages TO service_role;
GRANT USAGE, SELECT ON SEQUENCE profile_views_id_seq TO service_role;

-- ------------------------------------------------------- avatar bucket
-- Public read, so avatars render on public profiles; uploads go through
-- the API with the service role.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

NOTIFY pgrst, 'reload schema';

SELECT count(*) AS profiles_with_slug FROM profiles WHERE slug IS NOT NULL;
