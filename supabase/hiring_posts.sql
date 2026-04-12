-- Hiring Posts table
CREATE TABLE IF NOT EXISTS hiring_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  apply_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',   -- e.g. ['Frontend', 'React', 'Remote']
  work_mode TEXT NOT NULL DEFAULT 'onsite',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hiring_posts_active
  ON hiring_posts (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hiring_posts_tags
  ON hiring_posts USING gin(tags);

ALTER TABLE hiring_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active hiring posts"
  ON hiring_posts FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can view all hiring posts"
  ON hiring_posts FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can insert hiring posts"
  ON hiring_posts FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can update hiring posts"
  ON hiring_posts FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can delete hiring posts"
  ON hiring_posts FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE TRIGGER update_hiring_posts_updated_at
  BEFORE UPDATE ON hiring_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
