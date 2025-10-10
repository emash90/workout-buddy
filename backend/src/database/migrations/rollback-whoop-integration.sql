-- Rollback Script: Whoop Integration Migrations
-- Description: Reverts all changes made by migrations 001, 002, and 003
-- WARNING: This will delete the whoop_tokens table and remove provider tracking
-- Date: 2025-10-09

-- Begin transaction
BEGIN;

-- Rollback Migration 003: Drop whoop_tokens table
DROP TRIGGER IF EXISTS trigger_update_whoop_tokens_timestamp ON whoop_tokens;
DROP FUNCTION IF EXISTS update_whoop_tokens_updated_at();
DROP TABLE IF EXISTS whoop_tokens CASCADE;
RAISE NOTICE 'Rolled back Migration 003: whoop_tokens table dropped';

-- Rollback Migration 002: Remove data_source columns from fitness tables
DROP INDEX IF EXISTS idx_weight_user_date_source;
DROP INDEX IF EXISTS idx_weight_data_source;
DROP INDEX IF EXISTS idx_sleep_user_date_source;
DROP INDEX IF EXISTS idx_sleep_data_source;
DROP INDEX IF EXISTS idx_heart_rate_user_date_source;
DROP INDEX IF EXISTS idx_heart_rate_data_source;
DROP INDEX IF EXISTS idx_activity_user_date_source;
DROP INDEX IF EXISTS idx_activity_data_source;

ALTER TABLE weight_data DROP COLUMN IF EXISTS data_source;
ALTER TABLE sleep_data DROP COLUMN IF EXISTS data_source;
ALTER TABLE heart_rate_data DROP COLUMN IF EXISTS data_source;
ALTER TABLE activity_data DROP COLUMN IF EXISTS data_source;
RAISE NOTICE 'Rolled back Migration 002: data_source columns removed from fitness tables';

-- Rollback Migration 001: Remove provider tracking from users
DROP INDEX IF EXISTS idx_users_connected_provider;
ALTER TABLE users DROP COLUMN IF EXISTS provider_connected_at;
ALTER TABLE users DROP COLUMN IF EXISTS connected_provider;
RAISE NOTICE 'Rolled back Migration 001: provider tracking removed from users table';

-- Commit transaction
COMMIT;

RAISE NOTICE 'All Whoop integration migrations have been successfully rolled back';
