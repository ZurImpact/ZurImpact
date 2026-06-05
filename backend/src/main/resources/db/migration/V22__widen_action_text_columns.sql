-- V22: Widen text columns on action and gps_action_tasks to TEXT (no 255 limit)
ALTER TABLE action
    ALTER COLUMN description  TYPE TEXT,
    ALTER COLUMN display_name TYPE TEXT,
    ALTER COLUMN tags         TYPE TEXT,
    ALTER COLUMN type         TYPE TEXT;

ALTER TABLE gps_action_tasks
    ALTER COLUMN display_name TYPE TEXT,
    ALTER COLUMN description  TYPE TEXT;