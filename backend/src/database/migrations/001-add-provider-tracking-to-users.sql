-- Migration: Add provider tracking to users table
-- Description: Adds columns to track which fitness device provider (Fitbit or Whoop) is connected
-- Date: 2025-10-09

-- Add connected_provider column
ALTER TABLE users
ADD COLUMN connected_provider VARCHAR(10) CHECK (connected_provider IN ('fitbit', 'whoop'));

-- Add timestamp for when provider was connected
ALTER TABLE users
ADD COLUMN provider_connected_at TIMESTAMP;

-- Create index for faster queries
CREATE INDEX idx_users_connected_provider ON users(connected_provider);

-- Set existing Fitbit users' connected_provider
-- This ensures backward compatibility for users who already have Fitbit connected
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
WHERE EXISTS (
    SELECT 1
    FROM fitbit_tokens
    WHERE user_id = u.id
);

-- Add comment for documentation
COMMENT ON COLUMN users.connected_provider IS 'The currently connected fitness device provider (fitbit or whoop)';
COMMENT ON COLUMN users.provider_connected_at IS 'Timestamp when the provider was connected';
