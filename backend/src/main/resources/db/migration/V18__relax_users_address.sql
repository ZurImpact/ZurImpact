-- Address is user-supplied profile data, not auth-required.
-- Drop the NOT NULL + UNIQUE constraints so registration doesn't have to
-- mint a placeholder address row per user.
ALTER TABLE users
    ALTER COLUMN address_id DROP NOT NULL;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_address_id_key;
