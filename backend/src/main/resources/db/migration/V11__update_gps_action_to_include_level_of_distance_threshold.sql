-- V11 update gps action to include level of distance threshold

ALTER TABLE gps_action_tasks ADD COLUMN IF NOT EXISTS distance_threshold_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM';