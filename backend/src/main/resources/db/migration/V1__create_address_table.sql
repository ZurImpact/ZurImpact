-- V1: Create address table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.
CREATE TABLE address (
    id              SERIAL PRIMARY KEY,
    street          VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(20)  NOT NULL,
    country         VARCHAR(100) NOT NULL,
    created_on      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL
);