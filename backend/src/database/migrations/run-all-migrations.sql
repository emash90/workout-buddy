-- Master Migration Script: Whoop Integration
-- Description: Runs all migrations in order for Whoop integration
-- Date: 2025-10-09
-- Usage: psql -U postgres -d workout_buddy_dev -f run-all-migrations.sql

-- Start transaction
BEGIN;

RAISE NOTICE '========================================';
RAISE NOTICE 'Starting Whoop Integration Migrations';
RAISE NOTICE '========================================';

-- Migration 001: Add provider tracking to users
RAISE NOTICE '';
RAISE NOTICE 'Running Migration 001: Add provider tracking to users';
RAISE NOTICE '----------------------------------------';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS connected_provider VARCHAR(10) CHECK (connected_provider IN ('fitbit', 'whoop'));

ALTER TABLE users
ADD COLUMN IF NOT EXISTS provider_connected_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_connected_provider ON users(connected_provider);

UPDATE users u
SET
    connected_provider = 'fitbit',
    provider_connected_at = (
        SELECT created_at
        FROM fitbit_tokens
        WHERE user_id = u.id
        ORDER BY created_at DESC
        LIMIT 1
    )
WHERE connected_provider IS NULL
AND EXISTS (
    SELECT 1
    FROM fitbit_tokens
    WHERE user_id = u.id
);

COMMENT ON COLUMN users.connected_provider IS 'The currently connected fitness device provider (fitbit or whoop)';
COMMENT ON COLUMN users.provider_connected_at IS 'Timestamp when the provider was connected';

RAISE NOTICE 'Migration 001 completed successfully';

-- Migration 002: Add data source to fitness tables
RAISE NOTICE '';
RAISE NOTICE 'Running Migration 002: Add data source to fitness tables';
RAISE NOTICE '----------------------------------------';

ALTER TABLE activity_data
ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

ALTER TABLE heart_rate_data
ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

ALTER TABLE sleep_data
ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

ALTER TABLE weight_data
ADD COLUMN IF NOT EXISTS data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

CREATE INDEX IF NOT EXISTS idx_activity_data_source ON activity_data(data_source);
CREATE INDEX IF NOT EXISTS idx_activity_user_date_source ON activity_data("userId", date, data_source);

CREATE INDEX IF NOT EXISTS idx_heart_rate_data_source ON heart_rate_data(data_source);
CREATE INDEX IF NOT EXISTS idx_heart_rate_user_date_source ON heart_rate_data("userId", date, data_source);

CREATE INDEX IF NOT EXISTS idx_sleep_data_source ON sleep_data(data_source);
CREATE INDEX IF NOT EXISTS idx_sleep_user_date_source ON sleep_data("userId", date, data_source);

CREATE INDEX IF NOT EXISTS idx_weight_data_source ON weight_data(data_source);
CREATE INDEX IF NOT EXISTS idx_weight_user_date_source ON weight_data("userId", date, data_source);

COMMENT ON COLUMN activity_data.data_source IS 'Source of the fitness data (fitbit or whoop)';
COMMENT ON COLUMN heart_rate_data.data_source IS 'Source of the heart rate data (fitbit or whoop)';
COMMENT ON COLUMN sleep_data.data_source IS 'Source of the sleep data (fitbit or whoop)';
COMMENT ON COLUMN weight_data.data_source IS 'Source of the weight data (fitbit or whoop)';

RAISE NOTICE 'Migration 002 completed successfully';

-- Migration 003: Create whoop_tokens table
RAISE NOTICE '';
RAISE NOTICE 'Running Migration 003: Create whoop_tokens table';
RAISE NOTICE '----------------------------------------';

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

    CONSTRAINT fk_whoop_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_whoop_tokens_user_id ON whoop_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_tokens_whoop_user_id ON whoop_tokens(whoop_user_id);
CREATE INDEX IF NOT EXISTS idx_whoop_tokens_expires_at ON whoop_tokens(expires_at);

COMMENT ON TABLE whoop_tokens IS 'Stores Whoop OAuth tokens for authenticated users';
COMMENT ON COLUMN whoop_tokens.id IS 'Primary key UUID';
COMMENT ON COLUMN whoop_tokens.user_id IS 'Reference to users table (one-to-one relationship)';
COMMENT ON COLUMN whoop_tokens.access_token IS 'Whoop OAuth 2.0 access token';
COMMENT ON COLUMN whoop_tokens.refresh_token IS 'Whoop OAuth 2.0 refresh token';
COMMENT ON COLUMN whoop_tokens.expires_at IS 'Unix timestamp when access token expires';
COMMENT ON COLUMN whoop_tokens.whoop_user_id IS 'Whoop user ID from their API';
COMMENT ON COLUMN whoop_tokens.metadata IS 'Additional Whoop API metadata (JSON)';

CREATE OR REPLACE FUNCTION update_whoop_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_whoop_tokens_timestamp ON whoop_tokens;
CREATE TRIGGER trigger_update_whoop_tokens_timestamp
    BEFORE UPDATE ON whoop_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_whoop_tokens_updated_at();

RAISE NOTICE 'Migration 003 completed successfully';

-- Commit all changes
COMMIT;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE 'All migrations completed successfully!';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'Summary:';
RAISE NOTICE '- Users table: Added connected_provider and provider_connected_at columns';
RAISE NOTICE '- Fitness tables: Added data_source column to track Fitbit vs Whoop data';
RAISE NOTICE '- Created whoop_tokens table for OAuth authentication';
RAISE NOTICE '- All existing data has been tagged with source=fitbit for backward compatibility';
RAISE NOTICE '';
