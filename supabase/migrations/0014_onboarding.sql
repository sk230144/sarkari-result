-- Answers from the post-signup onboarding. Written only by /api/onboarding
-- (service role) after validation.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country          TEXT,
  ADD COLUMN IF NOT EXISTS job_search_stage TEXT CHECK (job_search_stage IN ('active', 'passive', 'not_looking')),
  ADD COLUMN IF NOT EXISTS challenges       JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS heard_from       TEXT,
  ADD COLUMN IF NOT EXISTS contact_consent  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarded_at     TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
