-- Job Alerts: Add notification fields to profiles table
-- Run this in your Supabase SQL Editor

-- Add new columns for job alert preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree_stream TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_notifications BOOLEAN DEFAULT FALSE;

-- Index for finding users who want notifications
CREATE INDEX IF NOT EXISTS idx_profiles_notifications ON profiles(wants_notifications) WHERE wants_notifications = TRUE;
