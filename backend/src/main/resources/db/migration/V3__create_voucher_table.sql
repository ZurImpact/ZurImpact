-- V3: Create action table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.
CREATE TABLE VOUCHER (
    id                  SERIAL                                      PRIMARY KEY,
    description         VARCHAR(255)                                NOT NULL,
    display_name        VARCHAR(255)                                NOT NULL,
    points              INTEGER                                     NOT NULL,
    company_id          INTEGER                                     NOT NULL,
    valid_until         TIMESTAMP                                   NOT NULL,
    created_on          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP   NOT NULL,
    FOREIGN KEY (company_id) REFERENCES company(id)
);