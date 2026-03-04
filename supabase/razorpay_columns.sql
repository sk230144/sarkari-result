-- Run this in Supabase SQL Editor to add Razorpay payment tracking columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_order_id TEXT,
  ADD COLUMN IF NOT EXISTS premium_payment_id TEXT;
