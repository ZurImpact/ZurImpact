-- V8: Add timestamp columns to gps_action_tasks, fix foreign key, and improve table structure

-- Add timestamp columns to gps_action_tasks
ALTER TABLE gps_action_tasks ADD COLUMN IF NOT EXISTS created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE gps_action_tasks ADD COLUMN IF NOT EXISTS updated_on TIMESTAMP;

-- Update existing rows to have updated_on set to created_on if NULL
UPDATE gps_action_tasks SET updated_on = created_on WHERE updated_on IS NULL;

-- Drop old foreign key constraint if it exists (it may have wrong type)
ALTER TABLE gps_action_tasks DROP CONSTRAINT IF EXISTS gps_action_tasks_action_id_fkey;

-- Ensure action_id is BIGINT to match action table id type (SERIAL = BIGINT)
ALTER TABLE gps_action_tasks ALTER COLUMN action_id TYPE BIGINT;

-- Re-create foreign key constraint with correct type
ALTER TABLE gps_action_tasks ADD CONSTRAINT gps_action_tasks_action_id_fkey
    FOREIGN KEY (action_id) REFERENCES action(id) ON DELETE CASCADE;

