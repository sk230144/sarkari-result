-- =====================================================================
--  Let progress key off a text id as well as a number
--
--  The DSA and FAANG sheets number their questions, so `question_n` was
--  enough. The System Design sheet keys by slug ("rate-limiter",
--  "url-shortener"), which does not fit an INT column.
--
--  Rather than a second table, add a text key and let `question_n` stay
--  for the numbered sheets. `item_key` is the one both paths write, so a
--  single unique constraint still guarantees one row per item.
-- =====================================================================

-- Text identity for every row: the slug for slug-based sheets, the
-- stringified number for the numbered ones.
ALTER TABLE sheet_progress ADD COLUMN IF NOT EXISTS item_key TEXT;

-- Backfill the rows written before this column existed.
UPDATE sheet_progress
SET item_key = question_n::text
WHERE item_key IS NULL;

ALTER TABLE sheet_progress ALTER COLUMN item_key SET NOT NULL;

-- question_n no longer applies to every sheet.
ALTER TABLE sheet_progress ALTER COLUMN question_n DROP NOT NULL;

-- Swap the uniqueness rule over to the text key. Dropping the old
-- constraint first, since a row can now satisfy one and not the other.
ALTER TABLE sheet_progress
  DROP CONSTRAINT IF EXISTS sheet_progress_user_id_sheet_key_question_n_key;

ALTER TABLE sheet_progress
  DROP CONSTRAINT IF EXISTS sheet_progress_user_sheet_item_key;

ALTER TABLE sheet_progress
  ADD CONSTRAINT sheet_progress_user_sheet_item_key
  UNIQUE (user_id, sheet_key, item_key);

NOTIFY pgrst, 'reload schema';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sheet_progress'
ORDER BY ordinal_position;
