-- This migration creates the email_change_token table, which is used to store tokens for email change requests.
CREATE TABLE email_change_token (
    token_hash   VARCHAR(64) PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    new_email    VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL,
    expires_at    TIMESTAMP NOT NULL,
    consumed_at   TIMESTAMP NULL,
    CONSTRAINT fk_email_change_token_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);