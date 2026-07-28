-- ============================================================
-- 007 — credit_logs.order_id (schema drift fix)
-- The live DB had this column (added via dashboard, never in a
-- migration) and lib/admin-db.ts inserts it — without it every
-- insertCreditLog with an order reference fails with PGRST204.
-- ============================================================

ALTER TABLE credit_logs
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_credit_logs_order_id ON credit_logs(order_id);
