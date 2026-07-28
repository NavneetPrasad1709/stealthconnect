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
