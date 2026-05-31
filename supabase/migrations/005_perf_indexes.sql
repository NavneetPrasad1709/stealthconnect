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
