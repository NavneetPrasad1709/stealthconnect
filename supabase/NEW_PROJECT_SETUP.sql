
-- ============================================================
-- FILE: 001_initial_schema.sql
-- ============================================================
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

-- ============================================================
-- FILE: 002_rls_hardening.sql
-- ============================================================
-- ============================================================
-- StealthConnect AI — RLS Hardening Migration
-- Fixes: missing DELETE policies, explicit INSERT deny on credit_logs
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ── profiles: block DELETE for all non-admin users ──────────

-- Users cannot delete their own profile
CREATE POLICY "profiles: users cannot delete"
  ON profiles FOR DELETE
  USING (false);

-- Admins can delete profiles (e.g. GDPR requests)
CREATE POLICY "profiles: admins can delete"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── orders: prevent deletion by users ───────────────────────

-- Users cannot delete orders
CREATE POLICY "orders: users cannot delete"
  ON orders FOR DELETE
  USING (false);

-- Admins can delete orders (refunds / data cleanup)
CREATE POLICY "orders: admins can delete"
  ON orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── credit_logs: fully locked down ──────────────────────────

-- No one can INSERT directly into credit_logs (use add_credits() / deduct_credit() functions)
CREATE POLICY "credit_logs: no direct insert"
  ON credit_logs FOR INSERT
  WITH CHECK (false);

-- No one can UPDATE credit_logs (append-only audit log)
CREATE POLICY "credit_logs: no update"
  ON credit_logs FOR UPDATE
  USING (false);

-- No one can DELETE credit_logs
CREATE POLICY "credit_logs: no delete"
  ON credit_logs FOR DELETE
  USING (false);

-- ── orders: users cannot update status directly ──────────────
-- (status changes go through server-side API with service_role key)
CREATE POLICY "orders: users cannot update status"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Users can only update non-status fields (e.g. adding URLs before payment)
    status = (SELECT status FROM orders WHERE id = orders.id)
  );

-- ============================================================
-- FILE: 003_handle_new_user_phone_linkedin.sql
-- ============================================================
-- Update handle_new_user to also store phone and linkedin_id from signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, linkedin_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'linkedin_id', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FILE: 004_audit_fixes.sql
-- ============================================================
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

-- ============================================================
-- FILE: 005_perf_indexes.sql
-- ============================================================
-- ============================================================
-- 005_perf_indexes.sql — PERF-M2: speed up admin order search
-- OPTIONAL. Apply in the Supabase SQL editor when convenient.
-- The admin order search uses ILIKE '%term%' on profiles.email, which cannot use a
-- plain btree index; a trigram (gin) index makes substring search index-backed at scale.
-- Functionality is unaffected without it — this is purely a performance optimisation.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm
  ON profiles USING gin (email gin_trgm_ops);

-- ============================================================
-- FILE: 006_fix_rls_recursion.sql
-- ============================================================
-- ============================================================
-- 006 — Fix RLS infinite recursion (42P17)
--
-- Every table query fails with:
--   infinite recursion detected in policy for relation "profiles"
--
-- Cause: policies subquery the same table they protect. The
-- profiles admin policies (001/002) subquery profiles, and
-- "orders: users cannot update status" (002) subqueries orders.
-- The RLS rewriter re-enters the same relation while expanding
-- its policies and aborts every query that touches it.
--
-- Fix: move the lookups into SECURITY DEFINER helper functions.
-- They execute as the table owner, which bypasses RLS, so the
-- rewriter never re-enters the table. Then rebuild the policies
-- on top of the helpers. Admin policies on other tables are
-- switched to is_admin() too for consistency and speed.
-- ============================================================

-- ── helpers ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_credits()
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT credits FROM profiles WHERE id = auth.uid();
$$;

-- Reads the pre-update row (statement snapshot), letting the
-- WITH CHECK below compare new status against stored status
-- without subquerying orders inside an orders policy.
CREATE OR REPLACE FUNCTION public.current_order_status(p_order_id UUID)
RETURNS order_status
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM orders WHERE id = p_order_id;
$$;

-- ── profiles ────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: admins can read all"   ON profiles;
DROP POLICY IF EXISTS "profiles: admins can update all" ON profiles;
DROP POLICY IF EXISTS "profiles: admins can delete"     ON profiles;
DROP POLICY IF EXISTS "profiles: users can update own"  ON profiles;

CREATE POLICY "profiles: admins can read all"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles: admins can update all"
  ON profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "profiles: admins can delete"
  ON profiles FOR DELETE
  USING (public.is_admin());

-- Users can update their own profile, but not role or credits
CREATE POLICY "profiles: users can update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role    = public.my_role()
    AND credits = public.my_credits()
  );

-- ── orders ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "orders: admins can read all"        ON orders;
DROP POLICY IF EXISTS "orders: admins can update all"      ON orders;
DROP POLICY IF EXISTS "orders: admins can delete"          ON orders;
DROP POLICY IF EXISTS "orders: users cannot update status" ON orders;

CREATE POLICY "orders: admins can read all"
  ON orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "orders: admins can update all"
  ON orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "orders: admins can delete"
  ON orders FOR DELETE
  USING (public.is_admin());

-- Users can update own order fields but not its status
CREATE POLICY "orders: users cannot update status"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = public.current_order_status(id)
  );

-- ── credit_logs ─────────────────────────────────────────────

DROP POLICY IF EXISTS "credit_logs: admins can read all" ON credit_logs;

CREATE POLICY "credit_logs: admins can read all"
  ON credit_logs FOR SELECT
  USING (public.is_admin());

-- ── signup trigger functions ────────────────────────────────
-- Recreated with SET search_path so they resolve public.* even
-- from GoTrue's auth-schema session, and to guarantee the live
-- versions are SECURITY DEFINER owned by postgres (bypass RLS).
-- Signup currently fails with "Database error saving new user"
-- because this trigger's INSERT hits the recursive policies.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.grant_signup_credit_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- ── paypal_intents / pending_alerts (004) ───────────────────

DROP POLICY IF EXISTS "paypal_intents: admins can read"   ON paypal_intents;
DROP POLICY IF EXISTS "pending_alerts: admins can read"   ON pending_alerts;
DROP POLICY IF EXISTS "pending_alerts: admins can update" ON pending_alerts;

CREATE POLICY "paypal_intents: admins can read"
  ON paypal_intents FOR SELECT
  USING (public.is_admin());

CREATE POLICY "pending_alerts: admins can read"
  ON pending_alerts FOR SELECT
  USING (public.is_admin());

CREATE POLICY "pending_alerts: admins can update"
  ON pending_alerts FOR UPDATE
  USING (public.is_admin());
