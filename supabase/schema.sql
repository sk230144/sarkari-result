-- ============================================
-- SARKARI RESULT - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organization TEXT,
  category TEXT NOT NULL DEFAULT 'job',
  state TEXT,
  qualification TEXT,
  tags TEXT[] DEFAULT '{}',
  post_date DATE DEFAULT CURRENT_DATE,
  last_date DATE,
  total_posts INTEGER,
  fee TEXT,
  age_limit TEXT,
  short_description TEXT,
  notification_url TEXT,
  apply_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster public queries
CREATE INDEX IF NOT EXISTS idx_jobs_published ON jobs (is_published, post_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs (is_featured, post_date DESC);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Public can only read published jobs
CREATE POLICY "Public can view published jobs"
  ON jobs
  FOR SELECT
  USING (is_published = TRUE);

-- Admins can view all jobs (including drafts)
CREATE POLICY "Admins can view all jobs"
  ON jobs
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Admins can insert jobs
CREATE POLICY "Admins can insert jobs"
  ON jobs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Admins can update jobs
CREATE POLICY "Admins can update jobs"
  ON jobs
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Admins can delete jobs
CREATE POLICY "Admins can delete jobs"
  ON jobs
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table (direct check to avoid recursion)
CREATE POLICY "Admins can view admins"
  ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HIRING PROFILES TABLE (Who's Hiring)
-- ============================================
CREATE TABLE IF NOT EXISTS hiring_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_name TEXT NOT NULL,
  role_hiring TEXT NOT NULL,
  work_mode TEXT NOT NULL DEFAULT 'onsite',
  profile_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hiring_profiles_active ON hiring_profiles (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hiring_profiles_role ON hiring_profiles (role_hiring);

-- Enable RLS on hiring_profiles table
ALTER TABLE hiring_profiles ENABLE ROW LEVEL SECURITY;

-- Public can view active hiring profiles
CREATE POLICY "Public can view active hiring profiles"
  ON hiring_profiles
  FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all hiring profiles
CREATE POLICY "Admins can view all hiring profiles"
  ON hiring_profiles
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

-- Admins can insert hiring profiles
CREATE POLICY "Admins can insert hiring profiles"
  ON hiring_profiles
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

-- Admins can update hiring profiles
CREATE POLICY "Admins can update hiring profiles"
  ON hiring_profiles
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admins));

-- Admins can delete hiring profiles
CREATE POLICY "Admins can delete hiring profiles"
  ON hiring_profiles
  FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE TRIGGER update_hiring_profiles_updated_at
  BEFORE UPDATE ON hiring_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED: Add yourself as admin (replace with your user_id after signing up)
-- ============================================
-- INSERT INTO admins (user_id) VALUES ('your-auth-user-uuid-here');
