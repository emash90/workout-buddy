-- Migration: Add data source tracking to fitness data tables
-- Description: Adds data_source column to track whether data came from Fitbit or Whoop
-- Date: 2025-10-09

-- Add data_source column to activity_data
ALTER TABLE activity_data
ADD COLUMN data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

-- Add data_source column to heart_rate_data
ALTER TABLE heart_rate_data
ADD COLUMN data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

-- Add data_source column to sleep_data
ALTER TABLE sleep_data
ADD COLUMN data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

-- Add data_source column to weight_data
ALTER TABLE weight_data
ADD COLUMN data_source VARCHAR(10) DEFAULT 'fitbit' CHECK (data_source IN ('fitbit', 'whoop'));

-- Create indexes for efficient filtering by data source
CREATE INDEX idx_activity_data_source ON activity_data(data_source);
CREATE INDEX idx_activity_user_date_source ON activity_data("userId", date, data_source);

CREATE INDEX idx_heart_rate_data_source ON heart_rate_data(data_source);
CREATE INDEX idx_heart_rate_user_date_source ON heart_rate_data("userId", date, data_source);

CREATE INDEX idx_sleep_data_source ON sleep_data(data_source);
CREATE INDEX idx_sleep_user_date_source ON sleep_data("userId", date, data_source);

CREATE INDEX idx_weight_data_source ON weight_data(data_source);
CREATE INDEX idx_weight_user_date_source ON weight_data("userId", date, data_source);

-- Add comments for documentation
COMMENT ON COLUMN activity_data.data_source IS 'Source of the fitness data (fitbit or whoop)';
COMMENT ON COLUMN heart_rate_data.data_source IS 'Source of the heart rate data (fitbit or whoop)';
COMMENT ON COLUMN sleep_data.data_source IS 'Source of the sleep data (fitbit or whoop)';
COMMENT ON COLUMN weight_data.data_source IS 'Source of the weight data (fitbit or whoop)';

-- Verify all existing data has been set to 'fitbit' by default
-- This ensures backward compatibility
DO $$
DECLARE
    activity_count INTEGER;
    hr_count INTEGER;
    sleep_count INTEGER;
    weight_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO activity_count FROM activity_data WHERE data_source IS NULL;
    SELECT COUNT(*) INTO hr_count FROM heart_rate_data WHERE data_source IS NULL;
    SELECT COUNT(*) INTO sleep_count FROM sleep_data WHERE data_source IS NULL;
    SELECT COUNT(*) INTO weight_count FROM weight_data WHERE data_source IS NULL;

    IF activity_count > 0 OR hr_count > 0 OR sleep_count > 0 OR weight_count > 0 THEN
        RAISE EXCEPTION 'Found NULL data_source values. This should not happen with DEFAULT constraint.';
    END IF;

    RAISE NOTICE 'Migration successful: All existing fitness data has been tagged with source=fitbit';
END $$;
