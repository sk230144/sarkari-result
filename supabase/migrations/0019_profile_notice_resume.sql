-- Notice period (shown at the top of the public profile) and whether the
-- resume can be viewed and downloaded there. The resume only ever shows on a
-- profile its owner has made public; show_resume lets them hide it anyway.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notice_period TEXT
    CHECK (notice_period IN ('immediate', '15', '30', '45', '60', '60plus')),
  ADD COLUMN IF NOT EXISTS show_resume BOOLEAN NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
