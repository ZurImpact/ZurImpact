-- V8: Rename gps_action_tasks columns gps_x/gps_y to longitude/latitude
ALTER TABLE gps_action_tasks RENAME COLUMN gps_x TO longitude;
ALTER TABLE gps_action_tasks RENAME COLUMN gps_y TO latitude;