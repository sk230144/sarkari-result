-- =====================================================================
--  User accounts and DSA sheet progress
--
--  Every row is owned by an auth.users id and protected by RLS, so one
--  reader can never see or edit another's progress even though the app
--  queries with the public anon key from the browser.
-- =====================================================================

-- ------------------------------------------------------------ profiles
-- Mirrors auth.users with the app's own fields. Created automatically on
-- signup by the trigger at the bottom of this file.
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT,
  avatar_url TEXT,
  -- Resume is mandatory at signup; the file itself lives in the private
  -- `user-documents` storage bucket, this is just the pointer.
  resume_path     TEXT,
  resume_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------ sheet_progress
-- One row per (user, sheet, question). Holds both the solved flag and the
-- note, because they are edited together and always read together.
--
-- `sheet_key` matches the tracker's storageKey ("striver-sde", "faang-meta",
-- …) and `question_n` is the question's 1-based position in that sheet, so
-- no foreign key to the question data is needed — the sheets live in code.
CREATE TABLE IF NOT EXISTS sheet_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  sheet_key   TEXT NOT NULL,
  question_n  INT  NOT NULL,
  solved      BOOLEAN NOT NULL DEFAULT FALSE,
  note        TEXT,
  solved_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Idempotency: ticking the same question twice updates one row.
  UNIQUE (user_id, sheet_key, question_n)
);

-- The tracker's only query: everything for one user on one sheet.
CREATE INDEX IF NOT EXISTS sheet_progress_user_sheet_idx
  ON sheet_progress (user_id, sheet_key);

-- Powers "solved this week" style stats without scanning the table.
CREATE INDEX IF NOT EXISTS sheet_progress_solved_idx
  ON sheet_progress (user_id, solved, solved_at DESC);

-- --------------------------------------------------------------- RLS
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_progress ENABLE ROW LEVEL SECURITY;

-- A reader sees and edits only their own rows. auth.uid() is the caller's
-- id from their JWT, so these hold even though the browser uses the
-- public anon key.
DROP POLICY IF EXISTS "own profile read"   ON profiles;
DROP POLICY IF EXISTS "own profile write"  ON profiles;
DROP POLICY IF EXISTS "own profile insert" ON profiles;

CREATE POLICY "own profile read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile write"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "own progress read"   ON sheet_progress;
DROP POLICY IF EXISTS "own progress insert" ON sheet_progress;
DROP POLICY IF EXISTS "own progress update" ON sheet_progress;
DROP POLICY IF EXISTS "own progress delete" ON sheet_progress;

CREATE POLICY "own progress read"   ON sheet_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own progress insert" ON sheet_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON sheet_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON sheet_progress FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------- triggers
-- Reuses touch_updated_at() from 0001; recreated here so this migration
-- can run standalone.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS sheet_progress_touch_updated_at ON sheet_progress;
CREATE TRIGGER sheet_progress_touch_updated_at BEFORE UPDATE ON sheet_progress
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Stamp solved_at the moment a question is first ticked, and clear it if
-- the reader un-ticks — so "solved this week" stays truthful.
CREATE OR REPLACE FUNCTION stamp_solved_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.solved AND (OLD IS NULL OR NOT OLD.solved) THEN
    NEW.solved_at = NOW();
  ELSIF NOT NEW.solved THEN
    NEW.solved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sheet_progress_stamp_solved ON sheet_progress;
CREATE TRIGGER sheet_progress_stamp_solved
  BEFORE INSERT OR UPDATE ON sheet_progress
  FOR EACH ROW EXECUTE FUNCTION stamp_solved_at();

-- ------------------------------------------- profile on signup
-- SECURITY DEFINER so it can write to profiles from the auth schema's
-- trigger context, where the caller is not yet an authenticated user.
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------- resume storage
-- The `user-documents` bucket is private. These policies let a reader
-- read and write only files under a folder named after their own user id,
-- which is the layout uploadResume() writes to: "{user_id}/resume.pdf".
DROP POLICY IF EXISTS "own documents read"   ON storage.objects;
DROP POLICY IF EXISTS "own documents insert" ON storage.objects;
DROP POLICY IF EXISTS "own documents update" ON storage.objects;
DROP POLICY IF EXISTS "own documents delete" ON storage.objects;

CREATE POLICY "own documents read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "own documents delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';

SELECT table_name,
       (SELECT count(*) FROM information_schema.columns c
         WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
