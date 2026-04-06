-- V8: Add roles to users and seed initial users

-- Alter users table to add roles column
ALTER TABLE users ADD COLUMN roles VARCHAR(255);

-- Seed addresses for initial users
INSERT INTO address (id, street, city, state, postal_code, country) VALUES
(1, 'Admin St 1', 'Zurich', 'ZH', '8000', 'Switzerland'),
(2, 'User Ave 2', 'Winterthur', 'ZH', '8400', 'Switzerland'),
(3, 'Partner Rd 3', 'Bern', 'BE', '3000', 'Switzerland');

-- Seed initial users (password is 'secret')
-- Admin has both ROLE_USER and ROLE_ADMIN
INSERT INTO users (username, email, address_id, password_hash, roles, created_at) VALUES
('admin', 'admin@zurimpact.ch', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMno.99pZuGe', 'ROLE_USER,ROLE_ADMIN', CURRENT_TIMESTAMP),
('user', 'user@zurimpact.ch', 2, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMno.99pZuGe', 'ROLE_USER', CURRENT_TIMESTAMP),
('partner', 'partner@zurimpact.ch', 3, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMno.99pZuGe', 'ROLE_PARTNER', CURRENT_TIMESTAMP);
