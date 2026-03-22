-- ============================================
-- REFERRAL SYSTEM
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add referral columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_days_earned INTEGER DEFAULT 0;

-- Index for fast referral code lookup
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- ============================================
-- Function: Generate unique 8-char referral code
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Auto-assign referral code on new profile
-- ============================================
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      new_code := generate_referral_code() || generate_referral_code();
      EXIT;
    END IF;
  END LOOP;
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: assign code before insert
CREATE TRIGGER assign_referral_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION assign_referral_code();

-- ============================================
-- Backfill: assign codes to existing profiles
-- ============================================
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
  attempts INT;
BEGIN
  FOR rec IN SELECT id FROM profiles WHERE referral_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        new_code := generate_referral_code() || generate_referral_code();
        EXIT;
      END IF;
    END LOOP;
    UPDATE profiles SET referral_code = new_code WHERE id = rec.id;
  END LOOP;
END;
$$;
