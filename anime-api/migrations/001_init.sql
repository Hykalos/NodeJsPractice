CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year_from INT NOT NULL,
  year_to INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_anime_year_from CHECK (year_from BETWEEN 1900 AND (EXTRACT(YEAR FROM NOW())::INT + 1)),
  CONSTRAINT chk_anime_year_to CHECK (year_to IS NULL OR year_to BETWEEN 1900 AND (EXTRACT(YEAR FROM NOW())::INT + 1)),
  CONSTRAINT chk_anime_year_range CHECK (year_to IS NULL OR year_to >= year_from),
  CONSTRAINT uq_anime_title_year_from UNIQUE (title, year_from)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_anime_title ON anime(title);
CREATE INDEX IF NOT EXISTS idx_anime_year_from ON anime(year_from);
CREATE INDEX IF NOT EXISTS idx_anime_year_to ON anime(year_to);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash_active ON api_keys(key_hash) WHERE revoked_at IS NULL;