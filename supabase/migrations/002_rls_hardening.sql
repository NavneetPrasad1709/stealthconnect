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
