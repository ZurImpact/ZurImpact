-- V5: Create action table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.
CREATE TABLE action (
                       id                  SERIAL                                      PRIMARY KEY,
                       description         VARCHAR(255)                                NOT NULL,
                       display_name        VARCHAR(255)                                NOT NULL,
                       points              INTEGER                                     NOT NULL,
                       tags                VARCHAR(255)                                NOT NULL,
                       valid_until         TIMESTAMP                                   NOT NULL,
                       created_on          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP   NOT NULL
);