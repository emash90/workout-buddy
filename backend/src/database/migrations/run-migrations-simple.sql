-- Simplified Migration Script for Command Line Execution
-- Runs all Whoop integration migrations without RAISE NOTICE statements

BEGIN;

-- Migration 001: Add provider tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS connected_provider VARCHAR(10) CHECK (connected_provider IN ('fitbit', 'whoop'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_connected_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_users_connected_provider ON users(connected_provider);

UPDATE users u
SET connected_provider = 'fitbit', provider_connected_at = (SELECT "createdAt" FROM fitbit_tokens WHERE "userId" = u.id ORDER BY "createdAt" DESC LIMIT 1)
WHERE connected_provider IS NULL AND EXISTS (SELECT 1 FROM fitbit_tokens WHERE "userId" = u.id);

-- Migration 002: Add data source to fitness tables
ALTER TABLE activity_data ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));
ALTER TABLE heart_rate_data ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));
ALTER TABLE sleep_data ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));
ALTER TABLE weight_data ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

CREATE INDEX IF NOT EXISTS idx_activity_data_source ON activity_data(data_source);
CREATE INDEX IF NOT EXISTS idx_heart_rate_data_source ON heart_rate_data(data_source);
CREATE INDEX IF NOT EXISTS idx_sleep_data_source ON sleep_data(data_source);
CREATE INDEX IF NOT EXISTS idx_weight_data_source ON weight_data(data_source);

-- Migration 003: Create whoop_tokens table
CREATE TABLE IF NOT EXISTS whoop_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    whoop_user_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_whoop_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_whoop_tokens_user_id ON whoop_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_tokens_whoop_user_id ON whoop_tokens(whoop_user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_tokens_expires_at ON whoop_tokens(expires_at);

CREATE OR REPLACE FUNCTION update_whoop_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_whoop_tokens_timestamp ON whoop_tokens;
CREATE TRIGGER trigger_update_whoop_tokens_timestamp BEFORE UPDATE ON whoop_tokens FOR EACH ROW EXECUTE FUNCTION update_whoop_tokens_updated_at();

COMMIT;

SELECT 'Migrations completed successfully!' AS status;
