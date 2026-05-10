ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET email_verified = TRUE;

CREATE INDEX idx_users_email_lower ON users (LOWER(email));
