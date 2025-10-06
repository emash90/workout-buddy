-- Migration: Create conversations table for AI chat history
-- Date: 2025-01-06
-- Description: Stores AI agent conversation history with users

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tools_used TEXT[], -- Array of tool names used by agent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to users table
    CONSTRAINT fk_conversations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id
    ON conversations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_conversation
    ON conversations(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_at
    ON conversations(created_at DESC);

-- Add comments
COMMENT ON TABLE conversations IS 'Stores AI agent conversation history';
COMMENT ON COLUMN conversations.user_id IS 'Reference to the user';
COMMENT ON COLUMN conversations.conversation_id IS 'Unique identifier for conversation thread';
COMMENT ON COLUMN conversations.role IS 'Message sender: user or assistant';
COMMENT ON COLUMN conversations.content IS 'Message content';
COMMENT ON COLUMN conversations.tools_used IS 'Array of AI agent tools used to generate response';
COMMENT ON COLUMN conversations.created_at IS 'Timestamp when message was created';

-- Optional: Create ai_insights table for caching insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('week', 'month', 'year')),
    insights JSONB NOT NULL,
    summary JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Foreign key
    CONSTRAINT fk_ai_insights_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Unique constraint to prevent duplicate insights for same period
    CONSTRAINT unique_user_period
        UNIQUE (user_id, period)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id
    ON ai_insights(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_insights_expires_at
    ON ai_insights(expires_at);

-- Add comments
COMMENT ON TABLE ai_insights IS 'Cached AI-generated insights to reduce API calls';
COMMENT ON COLUMN ai_insights.period IS 'Time period for insights: week, month, or year';
COMMENT ON COLUMN ai_insights.insights IS 'Generated insights in JSON format';
COMMENT ON COLUMN ai_insights.expires_at IS 'When the cached insights expire';

-- Grant permissions (adjust based on your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO workout_buddy_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO workout_buddy_app;
-- GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO workout_buddy_app;
-- GRANT USAGE, SELECT ON SEQUENCE ai_insights_id_seq TO workout_buddy_app;
