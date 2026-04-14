-- V10: Create user_voucher table to track voucher redemptions
CREATE TABLE user_voucher (
    id               SERIAL      PRIMARY KEY,
    user_id          INTEGER     NOT NULL REFERENCES users(id),
    voucher_id       INTEGER     NOT NULL REFERENCES voucher(id),
    redemption_code  VARCHAR(36) NOT NULL UNIQUE,
    redeemed_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);