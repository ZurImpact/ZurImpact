-- V1: Create users table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.
CREATE TABLE users (
    id              SERIAL                      PRIMARY KEY,
    username        VARCHAR(50)     UNIQUE      NOT NULL,
    email           VARCHAR(255)    UNIQUE      NOT NULL,
    address_id      INTEGER         UNIQUE      NOT NULL,
    password_hash   VARCHAR(255)                NOT NULL,
    created_at      TIMESTAMP                   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
