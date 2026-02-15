-- ============================================
-- DOCUMENT LOCKER - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- USER DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- 'aadhar', 'marksheet_10', 'marksheet_12', 'photo', 'signature', 'graduation', 'resume', 'other'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- storage path
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  label TEXT, -- optional custom label like "SSC Marksheet"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents (user_id, doc_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own documents
DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
CREATE POLICY "Users can view own documents"
  ON user_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
CREATE POLICY "Users can insert own documents"
  ON user_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete own documents" ON user_documents;
CREATE POLICY "Users can delete own documents"
  ON user_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SUPABASE STORAGE BUCKET
-- Run this separately OR create via Dashboard > Storage
-- ============================================
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New Bucket"
-- 3. Name: "user-documents"
-- 4. Toggle ON "Private bucket" (NOT public)
-- 5. Click "Create bucket"
--
-- Then add these storage policies in SQL Editor:

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own docs" ON storage.objects;
CREATE POLICY "Users can upload own docs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own files
DROP POLICY IF EXISTS "Users can read own docs" ON storage.objects;
CREATE POLICY "Users can read own docs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own docs" ON storage.objects;
CREATE POLICY "Users can delete own docs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
