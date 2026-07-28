-- ============================================================
-- 008 — input_type enum values the app actually sends
-- SubmitWizard / orders API send input_type 'single' and 'csv'
-- (components/dashboard/SubmitOrder/SubmitWizard.tsx:717,
--  app/api/orders/create/route.ts:46). The live DB had these
-- added via dashboard; the migration enum never did — without
-- them every order insert fails with 22P02.
-- ============================================================

ALTER TYPE input_type ADD VALUE IF NOT EXISTS 'single';
ALTER TYPE input_type ADD VALUE IF NOT EXISTS 'csv';
