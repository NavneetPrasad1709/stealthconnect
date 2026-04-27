-- ============================================================
-- 004_audit_fixes.sql — Production-readiness fixes
-- Run AFTER 001 / 002 / 003.
-- ============================================================

-- ============================================================
-- 1. Fix deduct_credit: accept amount, return boolean
-- ============================================================

DROP FUNCTION IF EXISTS deduct_credit(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS deduct_credit(UUID, INTEGER);

CREATE OR REPLACE FUNCTION deduct_credit(
  p_user_id UUID,
  p_amount  INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT credits INTO current_credits
  FROM profiles WHERE id = p_user_id
  FOR UPDATE;

  IF current_credits IS NULL OR current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles SET credits = credits - p_amount WHERE id = p_user_id;

  INSERT INTO credit_logs (user_id, amount, type, note)
  VALUES (p_user_id, -p_amount, 'usage',
          'Deducted ' || p_amount || ' credit' || CASE WHEN p_amount > 1 THEN 's' ELSE '' END);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. add_credits: positive-amount guard
-- ============================================================

DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER, credit_log_type, TEXT, UUID);

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id   UUID,
  p_amount    INTEGER,
  p_type      credit_log_type DEFAULT 'purchase',
  p_note      TEXT DEFAULT NULL,
  p_admin_id  UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE profiles SET credits = credits + p_amount WHERE id = p_user_id;

  INSERT INTO credit_logs (user_id, amount, type, note, admin_id)
  VALUES (p_user_id, p_amount, p_type, p_note, p_admin_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Email-confirmed signup credit (anti-abuse)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS signup_credit_granted BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: existing accounts already granted (don't double-grant on backfill)
UPDATE profiles SET signup_credit_granted = TRUE WHERE signup_credit_granted = FALSE;

-- New accounts start with 0 credits; grant only on email confirmation
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 0;

-- handle_new_user: grant credit immediately if user is pre-confirmed (OAuth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_credits INTEGER := 0;
  v_granted BOOLEAN := FALSE;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL THEN
    v_credits := 1;
    v_granted := TRUE;
  END IF;

  INSERT INTO profiles (id, email, full_name, phone, linkedin_id, credits, signup_credit_granted)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'linkedin_id', NULL),
    v_credits,
    v_granted
  );

  IF v_granted THEN
    INSERT INTO credit_logs (user_id, amount, type, note)
    VALUES (NEW.id, 1, 'admin_grant', 'Signup credit (pre-confirmed)');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant credit when user verifies email (email/password flow)
CREATE OR REPLACE FUNCTION grant_signup_credit_on_confirm()
RETURNS TRIGGER AS $$
DECLARE
  v_already_granted BOOLEAN;
BEGIN
  SELECT signup_credit_granted INTO v_already_granted
  FROM profiles WHERE id = NEW.id;

  IF v_already_granted IS DISTINCT FROM TRUE THEN
    UPDATE profiles
    SET credits = credits + 1,
        signup_credit_granted = TRUE
    WHERE id = NEW.id;

    INSERT INTO credit_logs (user_id, amount, type, note)
    VALUES (NEW.id, 1, 'admin_grant', 'Signup credit (email confirmed)');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION grant_signup_credit_on_confirm();

-- ============================================================
-- 4. paypal_intents — ownership + amount mapping for PayPal orders
-- ============================================================

CREATE TABLE IF NOT EXISTS paypal_intents (
  paypal_order_id  TEXT PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_type     contact_type NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  email_draft      BOOLEAN NOT NULL DEFAULT FALSE,
  expected_cents   INTEGER NOT NULL CHECK (expected_cents > 0),
  consumed         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paypal_intents_user    ON paypal_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_intents_created ON paypal_intents(created_at);

ALTER TABLE paypal_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paypal_intents: admins can read"
  ON paypal_intents FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 5. pending_alerts — surface team-email failures, dispute events
-- ============================================================

CREATE TABLE IF NOT EXISTS pending_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,
  details     JSONB,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_alerts_unresolved
  ON pending_alerts(resolved, created_at DESC);

ALTER TABLE pending_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pending_alerts: admins can read"
  ON pending_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "pending_alerts: admins can update"
  ON pending_alerts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
