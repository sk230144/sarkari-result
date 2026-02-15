-- ============================================
-- EXAM CALENDAR - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL, -- 'exam', 'result', 'admit'
  description TEXT, -- optional notes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events (user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events (event_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
CREATE POLICY "Users can view own events"
  ON calendar_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own events
DROP POLICY IF EXISTS "Users can insert own events" ON calendar_events;
CREATE POLICY "Users can insert own events"
  ON calendar_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
DROP POLICY IF EXISTS "Users can update own events" ON calendar_events;
CREATE POLICY "Users can update own events"
  ON calendar_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own events
DROP POLICY IF EXISTS "Users can delete own events" ON calendar_events;
CREATE POLICY "Users can delete own events"
  ON calendar_events
  FOR DELETE
  USING (auth.uid() = user_id);
