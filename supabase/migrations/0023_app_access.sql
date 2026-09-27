-- AI Interview Assistant (desktop app) as a paid add-on to PRO+.
-- A user can use the app (download it, see their access key, sign in to it)
-- while app_access_until is in the future. Like premium_until, only the
-- server writes it: profiles UPDATE is granted to users column by column,
-- and this new column isn't one of them.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS app_access_until TIMESTAMPTZ;

-- Whether an order included the app add-on, and how much of `amount` was
-- for it (stored, so old invoices stay right if the add-on price changes).
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS includes_app BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS app_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Same as 0022, plus: an order that includes the app also extends app access
-- by the plan's length, on top of any app access still left.
CREATE OR REPLACE FUNCTION grant_premium(
  p_order_id TEXT, p_cf_payment_id TEXT, p_method TEXT
) RETURNS TABLE (granted BOOLEAN, new_until TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID;
  v_plan TEXT;
  v_app BOOLEAN;
  v_period INTERVAL;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_app_start TIMESTAMPTZ;
BEGIN
  UPDATE payments SET status = 'paid', paid_at = now(), updated_at = now(),
         cf_payment_id = COALESCE(p_cf_payment_id, cf_payment_id),
         payment_method = COALESCE(p_method, payment_method)
   WHERE order_id = p_order_id AND status <> 'paid'
   RETURNING user_id, plan, includes_app INTO v_user, v_plan, v_app;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, (SELECT pr.premium_until FROM profiles pr JOIN payments pa ON pa.user_id = pr.id WHERE pa.order_id = p_order_id);
    RETURN;
  END IF;

  v_period := CASE v_plan WHEN 'quarterly' THEN INTERVAL '3 months' ELSE INTERVAL '1 month' END;

  SELECT GREATEST(COALESCE(pr.premium_until, now()), now()),
         GREATEST(COALESCE(pr.app_access_until, now()), now())
    INTO v_start, v_app_start
    FROM profiles pr WHERE pr.id = v_user FOR UPDATE;
  v_start := COALESCE(v_start, now());
  v_end := v_start + v_period;

  UPDATE profiles SET premium_until = v_end, premium_plan = v_plan,
         premium_since = COALESCE(premium_since, now()),
         app_access_until = CASE WHEN v_app THEN COALESCE(v_app_start, now()) + v_period ELSE app_access_until END
   WHERE id = v_user;
  UPDATE payments SET period_start = v_start, period_end = v_end WHERE order_id = p_order_id;

  RETURN QUERY SELECT TRUE, v_end;
END $$;
REVOKE ALL ON FUNCTION grant_premium(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION grant_premium(TEXT, TEXT, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
