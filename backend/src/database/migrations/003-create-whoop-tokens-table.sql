-- Migration: Create whoop_tokens table
-- Description: Creates table to store Whoop OAuth tokens and authentication data
-- Date: 2025-10-09

-- Create whoop_tokens table (mirrors fitbit_tokens structure)
CREATE TABLE whoop_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    whoop_user_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_whoop_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX idx_whoop_tokens_user_id ON whoop_tokens(user_id);
CREATE INDEX idx_whoop_tokens_whoop_user_id ON whoop_tokens(whoop_user_id);
CREATE INDEX idx_whoop_tokens_expires_at ON whoop_tokens(expires_at);

-- Add comments for documentation
COMMENT ON TABLE whoop_tokens IS 'Stores Whoop OAuth tokens for authenticated users';
COMMENT ON COLUMN whoop_tokens.id IS 'Primary key UUID';
COMMENT ON COLUMN whoop_tokens.user_id IS 'Reference to users table (one-to-one relationship)';
COMMENT ON COLUMN whoop_tokens.access_token IS 'Whoop OAuth 2.0 access token';
COMMENT ON COLUMN whoop_tokens.refresh_token IS 'Whoop OAuth 2.0 refresh token';
COMMENT ON COLUMN whoop_tokens.expires_at IS 'Unix timestamp when access token expires';
COMMENT ON COLUMN whoop_tokens.whoop_user_id IS 'Whoop user ID from their API';
COMMENT ON COLUMN whoop_tokens.metadata IS 'Additional Whoop API metadata (JSON)';
COMMENT ON COLUMN whoop_tokens.created_at IS 'Timestamp when token was created';
COMMENT ON COLUMN whoop_tokens.updated_at IS 'Timestamp when token was last updated';

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whoop_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_whoop_tokens_timestamp
    BEFORE UPDATE ON whoop_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_whoop_tokens_updated_at();

-- Verify table structure
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whoop_tokens') THEN
        RAISE EXCEPTION 'whoop_tokens table was not created successfully';
    END IF;

    -- Check if foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_whoop_tokens_user'
    ) THEN
        RAISE EXCEPTION 'Foreign key constraint was not created successfully';
    END IF;

    RAISE NOTICE 'Migration successful: whoop_tokens table created with all constraints and indexes';
END $$;
