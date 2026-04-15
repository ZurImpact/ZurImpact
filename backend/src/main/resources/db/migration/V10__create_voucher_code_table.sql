-- V10: Create voucher_code table to normalize individual redeemable codes
-- out of the voucher template table.
CREATE TABLE voucher_code (
    id           SERIAL       PRIMARY KEY,
    voucher_id   INTEGER      NOT NULL REFERENCES voucher(id),
    code         VARCHAR(255) NOT NULL UNIQUE,
    user_id      INTEGER               REFERENCES users(id),
    assigned_at  TIMESTAMP
);