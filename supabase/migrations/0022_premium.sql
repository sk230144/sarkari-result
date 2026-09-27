-- PRO+ membership paid through Cashfree.
-- A user is premium while premium_until is in the future. Only the server
-- writes these columns (users can't: profiles UPDATE is limited to a few
-- named columns).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_plan  TEXT,
  ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ;

-- One row per Cashfree order.
CREATE TABLE IF NOT EXISTS payments (
  order_id            TEXT PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                TEXT NOT NULL CHECK (plan IN ('monthly', 'quarterly')),
  amount              NUMERIC(10, 2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'expired')),
  cf_order_id         TEXT,
  cf_payment_id       TEXT,
  payment_method      TEXT,
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_user ON payments (user_id, created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
GRANT ALL ON payments TO service_role;

-- Marks an order paid and extends the user's premium, exactly once per order.
-- Both the browser-side verify and Cashfree's webhook call this; whichever
-- arrives second finds the order already paid and changes nothing. Time is
-- added on top of any premium still left, so renewing early loses nothing.
CREATE OR REPLACE FUNCTION grant_premium(
  p_order_id TEXT, p_cf_payment_id TEXT, p_method TEXT
) RETURNS TABLE (granted BOOLEAN, new_until TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID;
  v_plan TEXT;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  UPDATE payments SET status = 'paid', paid_at = now(), updated_at = now(),
         cf_payment_id = COALESCE(p_cf_payment_id, cf_payment_id),
         payment_method = COALESCE(p_method, payment_method)
   WHERE order_id = p_order_id AND status <> 'paid'
   RETURNING user_id, plan INTO v_user, v_plan;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, (SELECT pr.premium_until FROM profiles pr JOIN payments pa ON pa.user_id = pr.id WHERE pa.order_id = p_order_id);
    RETURN;
  END IF;

  SELECT GREATEST(COALESCE(pr.premium_until, now()), now()) INTO v_start FROM profiles pr WHERE pr.id = v_user FOR UPDATE;
  v_start := COALESCE(v_start, now());
  v_end := v_start + CASE v_plan WHEN 'quarterly' THEN INTERVAL '3 months' ELSE INTERVAL '1 month' END;

  UPDATE profiles SET premium_until = v_end, premium_plan = v_plan,
         premium_since = COALESCE(premium_since, now())
   WHERE id = v_user;
  UPDATE payments SET period_start = v_start, period_end = v_end WHERE order_id = p_order_id;

  RETURN QUERY SELECT TRUE, v_end;
END $$;
REVOKE ALL ON FUNCTION grant_premium(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION grant_premium(TEXT, TEXT, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
