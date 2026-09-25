-- =====================================================================
--  Task board
--
--  The browser talks to this table directly with the user's own session;
--  RLS limits every row to its owner and CHECK constraints keep the data
--  valid, so no API route is needed in between.
-- =====================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  tag           TEXT NOT NULL DEFAULT 'Other'
                  CHECK (tag IN ('Resume', 'DSA Sheets', 'Interview', 'Applied', 'Other')),
  status        TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'done')),
  -- Order inside a column. Floats, so a card can be dropped between two
  -- others without renumbering the whole column.
  position      DOUBLE PRECISION NOT NULL DEFAULT 0,
  due_date      DATE,
  reference     TEXT CHECK (reference IS NULL OR char_length(reference) <= 200),
  notes         TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  completed_at  TIMESTAMPTZ,
  archived_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_board ON tasks (user_id, archived_at, status, position);
CREATE INDEX IF NOT EXISTS tasks_completed ON tasks (user_id, completed_at DESC) WHERE completed_at IS NOT NULL;

-- updated_at, and completed_at stamped when a task enters Done (cleared when it leaves).
CREATE OR REPLACE FUNCTION tasks_before_write() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'done' AND (TG_OP = 'INSERT' OR OLD.status <> 'done') THEN
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  ELSIF NEW.status <> 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_before_write ON tasks;
CREATE TRIGGER tasks_before_write BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION tasks_before_write();

-- A board is a planning tool, not storage: cap it so a script can't fill the table.
CREATE OR REPLACE FUNCTION tasks_limit() RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM tasks WHERE user_id = NEW.user_id) >= 1000 THEN
    RAISE EXCEPTION 'Task limit reached (1000). Delete or clear old tasks first.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_limit ON tasks;
CREATE TRIGGER tasks_limit BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION tasks_limit();

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own tasks read"   ON tasks;
DROP POLICY IF EXISTS "own tasks insert" ON tasks;
DROP POLICY IF EXISTS "own tasks update" ON tasks;
DROP POLICY IF EXISTS "own tasks delete" ON tasks;

CREATE POLICY "own tasks read"   ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tasks insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tasks update" ON tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tasks delete" ON tasks FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;

-- Weekly goal for the "weekly target" meter, editable by its owner.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS task_weekly_goal INT NOT NULL DEFAULT 10
  CHECK (task_weekly_goal BETWEEN 1 AND 200);
GRANT UPDATE (task_weekly_goal) ON profiles TO authenticated;

NOTIFY pgrst, 'reload schema';

SELECT 'tasks' AS created, count(*) AS rows FROM tasks;
