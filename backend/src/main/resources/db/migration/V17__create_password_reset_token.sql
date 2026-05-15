CREATE TABLE password_reset_token (
    token_hash  CHAR(64)  PRIMARY KEY,
    user_id     BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP
);

CREATE INDEX idx_prt_user_id ON password_reset_token (user_id);
