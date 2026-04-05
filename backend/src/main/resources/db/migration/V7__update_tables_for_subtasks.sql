-- V7: Update tables for subtasks and create gps_action_tasks

-- Alter action table
ALTER TABLE action ADD COLUMN type VARCHAR(255);
ALTER TABLE action ADD COLUMN has_subtasks BOOLEAN DEFAULT FALSE;

-- Alter user_action_mapping table
ALTER TABLE user_action_mapping ADD COLUMN is_subtask BOOLEAN DEFAULT FALSE;
ALTER TABLE user_action_mapping ADD COLUMN subaction_id VARCHAR(255);

-- Create gps_action_tasks table
CREATE TABLE gps_action_tasks (
    id BIGSERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    action_id INTEGER NOT NULL,
    gps_x FLOAT NOT NULL,
    gps_y FLOAT NOT NULL,
    FOREIGN KEY (action_id) REFERENCES action(id)
);
