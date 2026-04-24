-- Add role column to users table
ALTER TABLE users
	ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER';
