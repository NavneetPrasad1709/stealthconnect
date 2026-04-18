-- ============================================================
-- StealthConnect AI — Initial Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE input_type AS ENUM ('linkedin_url', 'csv_upload', 'manual');
CREATE TYPE contact_type AS ENUM ('email', 'phone', 'both');
CREATE TYPE credit_log_type AS ENUM ('purchase', 'usage', 'refund', 'admin_grant');

-- ============================================================
-- TABLE: profiles
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  phone         TEXT,
  linkedin_id   TEXT,
  credits       INTEGER NOT NULL DEFAULT 1,
  role          user_role NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT credits_non_negative CHECK (credits >= 0)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on new auth user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE: orders
-- ============================================================

CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input_type            input_type NOT NULL,
  linkedin_urls         TEXT[] NOT NULL DEFAULT '{}',
  contact_type          contact_type NOT NULL,
  quantity              INTEGER NOT NULL CHECK (quantity > 0),
  amount_paid           NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  paypal_order_id       TEXT UNIQUE,
  email_draft_requested BOOLEAN NOT NULL DEFAULT FALSE,
  status                order_status NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at          TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_paypal_order_id ON orders(paypal_order_id);

-- ============================================================
-- TABLE: credit_logs
-- ============================================================

CREATE TABLE credit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,        -- positive = credit added, negative = deducted
  type        credit_log_type NOT NULL,
  note        TEXT,
  admin_id    UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_logs_user_id ON credit_logs(user_id);
CREATE INDEX idx_credit_logs_type ON credit_logs(type);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ──────────────────────────────────────

-- Users see only their own profile
CREATE POLICY "profiles: users can read own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (not role or credits)
CREATE POLICY "profiles: users can update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND credits = (SELECT credits FROM profiles WHERE id = auth.uid())
  );

-- Admins can read all profiles
CREATE POLICY "profiles: admins can read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile (e.g., grant credits, change role)
CREATE POLICY "profiles: admins can update all"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── orders policies ────────────────────────────────────────

-- Users see only their own orders
CREATE POLICY "orders: users can read own"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "orders: users can insert own"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "orders: admins can read all"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any order (status updates, delivery)
CREATE POLICY "orders: admins can update all"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── credit_logs policies ───────────────────────────────────

-- Users see only their own logs
CREATE POLICY "credit_logs: users can read own"
  ON credit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (done via server-side functions)
-- Admins can read all logs
CREATE POLICY "credit_logs: admins can read all"
  ON credit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- HELPER FUNCTION: Deduct credit + log atomically
-- Call from server-side with service_role key
-- ============================================================

CREATE OR REPLACE FUNCTION deduct_credit(
  p_user_id   UUID,
  p_order_id  UUID,
  p_note      TEXT DEFAULT 'Order processed'
)
RETURNS VOID AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF current_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE profiles SET credits = credits - 1 WHERE id = p_user_id;

  INSERT INTO credit_logs (user_id, amount, type, note)
  VALUES (p_user_id, -1, 'usage', p_note);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Add credits + log atomically
-- ============================================================

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id   UUID,
  p_amount    INTEGER,
  p_type      credit_log_type DEFAULT 'purchase',
  p_note      TEXT DEFAULT NULL,
  p_admin_id  UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET credits = credits + p_amount WHERE id = p_user_id;

  INSERT INTO credit_logs (user_id, amount, type, note, admin_id)
  VALUES (p_user_id, p_amount, p_type, p_note, p_admin_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Make first signup an admin (optional, run once)
-- UPDATE profiles SET role = 'admin' WHERE email = 'navneetprasad1709@gmail.com';
-- ============================================================
