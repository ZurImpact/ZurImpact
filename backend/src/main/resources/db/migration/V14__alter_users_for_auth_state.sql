ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_users_email_lower ON users (LOWER(email));
