CREATE TABLE auth_session (
    token_hash CHAR(64)  PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_auth_session_user_id    ON auth_session (user_id);
CREATE INDEX idx_auth_session_expires_at ON auth_session (expires_at);
