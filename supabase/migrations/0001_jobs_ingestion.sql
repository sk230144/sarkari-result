-- Jobs24 automated job ingestion — core schema.
-- Mirrors the technical design doc §9 (jobs), §9.1 (job_sources),
-- §4.2 (companies), §15 (sync logs) and §16 (blocked_*).

-- ---------------------------------------------------------------- jobs
CREATE TABLE IF NOT EXISTS jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id       TEXT NOT NULL,
  source            TEXT NOT NULL,
  source_company_id TEXT,
  title             TEXT NOT NULL,
  slug              TEXT,
  company_name      TEXT NOT NULL,
  company_domain    TEXT,
  role_category     TEXT,
  experience_min    INT,
  experience_max    INT,
  experience_level  TEXT,
  city              TEXT,
  state             TEXT,
  country           TEXT,
  remote_type       TEXT,
  employment_type   TEXT,
  salary_min        NUMERIC,
  salary_max        NUMERIC,
  salary_currency   TEXT,
  tech_stack        JSONB NOT NULL DEFAULT '[]'::jsonb,
  description       TEXT,
  apply_url         TEXT NOT NULL,
  source_url        TEXT NOT NULL,
  source_posted_at  TIMESTAMPTZ,
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_at  TIMESTAMPTZ,
  -- active | stale | closed | unknown | blocked  (§11.1)
  status            TEXT NOT NULL DEFAULT 'active',
  -- Set when the classifier was unsure; these stay out of the default feed.
  needs_review      BOOLEAN NOT NULL DEFAULT FALSE,
  fingerprint       TEXT,
  source_metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- The hard idempotency key (§10.1): a re-fetch updates, never inserts.
  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS jobs_active_posted_idx  ON jobs (status, source_posted_at DESC);
CREATE INDEX IF NOT EXISTS jobs_role_category_idx  ON jobs (role_category);
CREATE INDEX IF NOT EXISTS jobs_city_idx           ON jobs (city);
CREATE INDEX IF NOT EXISTS jobs_remote_type_idx    ON jobs (remote_type);
CREATE INDEX IF NOT EXISTS jobs_fingerprint_idx    ON jobs (fingerprint);
CREATE INDEX IF NOT EXISTS jobs_tech_stack_gin_idx ON jobs USING GIN (tech_stack);

-- Free-text search over the fields a reader actually searches by.
CREATE INDEX IF NOT EXISTS jobs_search_idx ON jobs
  USING GIN (to_tsvector('english', title || ' ' || company_name));

-- ------------------------------------------------------- job_sources
-- One row per provider. Cadence and policy live here, not in code (§2.1).
CREATE TABLE IF NOT EXISTS job_sources (
  source_key            TEXT PRIMARY KEY,
  enabled               BOOLEAN NOT NULL DEFAULT TRUE,
  source_type           TEXT NOT NULL,
  sync_interval_minutes INT NOT NULL DEFAULT 360,
  attribution_required  BOOLEAN NOT NULL DEFAULT FALSE,
  attribution_text      TEXT,
  allow_google_jobs     BOOLEAN NOT NULL DEFAULT FALSE,
  allow_redistribution  BOOLEAN NOT NULL DEFAULT FALSE,
  retention_policy      TEXT,
  max_requests_per_run  INT NOT NULL DEFAULT 200,
  last_sync_at          TIMESTAMPTZ,
  next_sync_at          TIMESTAMPTZ,
  health_status         TEXT NOT NULL DEFAULT 'unknown',
  consecutive_failures  INT NOT NULL DEFAULT 0,
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------- companies
-- The ATS registry (§4.2). Grown by monthly discovery, not by hand-entry.
CREATE TABLE IF NOT EXISTS companies (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name         TEXT NOT NULL,
  company_domain       TEXT,
  ats_provider         TEXT NOT NULL,
  ats_identifier       TEXT NOT NULL,
  careers_url          TEXT,
  discovery_url        TEXT,
  -- unverified | public_feed | permitted | blocked  (§3.1 "Important")
  permission_status    TEXT NOT NULL DEFAULT 'unverified',
  enabled              BOOLEAN NOT NULL DEFAULT TRUE,
  last_success_at      TIMESTAMPTZ,
  consecutive_failures INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ats_provider, ats_identifier)
);

CREATE INDEX IF NOT EXISTS companies_enabled_idx ON companies (enabled, ats_provider);

-- ----------------------------------------------------- job_sync_logs
CREATE TABLE IF NOT EXISTS job_sync_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key     TEXT NOT NULL,
  company_id     UUID REFERENCES companies (id) ON DELETE SET NULL,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ,
  fetched_count  INT NOT NULL DEFAULT 0,
  created_count  INT NOT NULL DEFAULT 0,
  updated_count  INT NOT NULL DEFAULT 0,
  rejected_count INT NOT NULL DEFAULT 0,
  failed_count   INT NOT NULL DEFAULT 0,
  -- ok | partial | failed
  status         TEXT NOT NULL DEFAULT 'ok',
  error_message  TEXT,
  reject_reasons JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS sync_logs_source_idx ON job_sync_logs (source_key, started_at DESC);

-- ------------------------------------------------------- blocked_*
-- Removals must survive the next sync (§16).
CREATE TABLE IF NOT EXISTS blocked_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source     TEXT NOT NULL,
  external_id TEXT NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS blocked_companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_name)
);

-- --------------------------------------------------------- triggers
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_touch_updated_at ON jobs;
CREATE TRIGGER jobs_touch_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS companies_touch_updated_at ON companies;
CREATE TRIGGER companies_touch_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ------------------------------------------------------------- RLS
-- The site reads through the server with the service key, which bypasses
-- RLS. These tables stay locked to everyone else until a public read path
-- is deliberately opened.
ALTER TABLE jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sync_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_companies ENABLE ROW LEVEL SECURITY;
