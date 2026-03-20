-- V2: Create company table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.

CREATE TABLE company (
    id                  SERIAL                                      PRIMARY KEY,
    name                VARCHAR(255)    UNIQUE                      NOT NULL,
    email               VARCHAR(255)    UNIQUE                      NOT NULL,
    phone_number        VARCHAR(20)     UNIQUE                      NOT NULL,
    description         VARCHAR(255)                                NOT NULL,
    address_id          INTEGER         UNIQUE                      NOT NULL,
    created_on          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP   NOT NULL
);