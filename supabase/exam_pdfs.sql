-- ============================================
-- EXAM CALENDAR PDFs - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Table to store admin-uploaded exam calendar PDFs
CREATE TABLE IF NOT EXISTS exam_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,           -- e.g. "SSC CGL 2026 Exam Calendar"
  exam_body TEXT NOT NULL,      -- e.g. "SSC", "UPSC", "Railway"
  file_path TEXT NOT NULL,      -- Supabase storage path
  file_url TEXT NOT NULL,       -- Public URL
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_pdfs_exam_body ON exam_pdfs (exam_body);

-- RLS
ALTER TABLE exam_pdfs ENABLE ROW LEVEL SECURITY;

-- Everyone (including anonymous) can view
DROP POLICY IF EXISTS "Public can view exam pdfs" ON exam_pdfs;
CREATE POLICY "Public can view exam pdfs"
  ON exam_pdfs FOR SELECT
  USING (true);

-- Only admins can insert/update/delete (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Admins can manage exam pdfs" ON exam_pdfs;
CREATE POLICY "Admins can manage exam pdfs"
  ON exam_pdfs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKET
-- Run this too or create via Supabase dashboard:
-- Bucket name: exam-pdfs
-- Public: true
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('exam-pdfs', 'exam-pdfs', true)
-- ON CONFLICT DO NOTHING;
