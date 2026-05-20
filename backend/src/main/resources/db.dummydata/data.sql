-- 1. ADDRESS (referenced by company and optionally by users)
INSERT INTO address (street, city, state, postal_code, country) VALUES
                                                                    ('Bahnhofstrasse 1',  'Zürich',     'ZH', '8001', 'Switzerland'),
                                                                    ('Langstrasse 50',    'Zürich',     'ZH', '8004', 'Switzerland'),
                                                                    ('Technikumstrasse 9','Winterthur', 'ZH', '8401', 'Switzerland'),
                                                                    ('Rämistrasse 101',   'Zürich',     'ZH', '8092', 'Switzerland'),
                                                                    ('Seestrasse 22',     'Zürich',     'ZH', '8002', 'Switzerland');

-- 2. COMPANY (needs address_id 1..N)
INSERT INTO company (name, email, phone_number, description, address_id, created_on) VALUES
                                                                                         ('GreenRide AG',  'contact@greenride.ch', '+41441001001', 'Sustainable urban mobility', 4, NOW()),
                                                                                         ('EcoEats GmbH',  'hello@ecoeats.ch',     '+41441001002', 'Organic food delivery',      5, NOW()),
                                                                                         ('VeloZueri',     'info@velozueri.ch',    '+41441001003', 'Bike rental and tours',       3, NOW());

-- 3. USERS (BCrypt hash below is for password "secret"; address_id is nullable per V18)
--    Roles cover ROLE_USER / ROLE_ADMIN / ROLE_PARTNER so role-gated endpoints can be demoed.
--    `testy` is intentionally unverified so the /api/auth/verify-email flow has a target.
INSERT INTO users (username, email,                  password_hash,                                                  address_id, created_at, points, role,           email_verified) VALUES
                  ('alice',   'alice@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1,          NOW(),      0,      'ROLE_USER',    TRUE),
                  ('bob',     'bob@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2,          NOW(),      0,      'ROLE_USER',    TRUE),
                  ('charlie', 'charlie@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3,          NOW(),      0,      'ROLE_USER',    TRUE),
                  ('admin',   'admin@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL,       NOW(),      0,      'ROLE_ADMIN',   TRUE),
                  ('partner', 'partner@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL,       NOW(),      0,      'ROLE_PARTNER', TRUE),
                  ('testy',   'testy@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NULL,       NOW(),      0,      'ROLE_USER',    FALSE);

-- 4. VOUCHER (needs company_id)
INSERT INTO voucher (description, display_name, points, company_id, valid_until, created_on) VALUES
                                                                                                 ('10% off GreenRide subscription', '10% GreenRide Discount', 100, 1, NOW() + INTERVAL '60 days', NOW()),
                                                                                                 ('Free EcoEats delivery',          'EcoEats Free Delivery',   50, 2, NOW() + INTERVAL '30 days', NOW()),
                                                                                                 ('1-day free VeloZueri rental',    'Free Bike Day',           200, 3, NOW() + INTERVAL '90 days', NOW());

-- 5. VOUCHER_CODE (individual redeemable codes per voucher template)
INSERT INTO voucher_code (voucher_id, code) VALUES
    (1, 'GREENRIDE-ABC1'),
    (1, 'GREENRIDE-ABC2'),
    (1, 'GREENRIDE-ABC3'),
    (2, 'ECOEATS-XYZ1'),
    (2, 'ECOEATS-XYZ2'),
    (3, 'VELO-FREE-001'),
    (3, 'VELO-FREE-002'),
    (3, 'VELO-FREE-003'),
    (3, 'VELO-FREE-004'),
    (3, 'VELO-FREE-005'),
    (3, 'VELO-FREE-006'),
    (3, 'VELO-FREE-007'),
    (3, 'VELO-FREE-008'),
    (3, 'VELO-FREE-009'),
    (3, 'VELO-FREE-010'),
    (3, 'VELO-FREE-011'),
    (3, 'VELO-FREE-012'),
    (3, 'VELO-FREE-013'),
    (3, 'VELO-FREE-014'),
    (3, 'VELO-FREE-015'),
    (3, 'VELO-FREE-016'),
    (3, 'VELO-FREE-017'),
    (3, 'VELO-FREE-018'),
    (3, 'VELO-FREE-019'),
    (3, 'VELO-FREE-020');


-- 6. ACTION
INSERT INTO action (description, display_name, points, tags, type, has_subtasks, valid_until, created_on) VALUES
                                                                                                              ('Visit the lake by bike and check in at waypoints', 'Lake Bike Tour',      150, 'CYCLING,SPORTS', 'GPS',    true,  NOW() + INTERVAL '90 days',  NOW()),
                                                                                                              ('Take a photo at a local farmers market',           'Farmers Market Shot',  50, 'FOOD,HEALTH',    'PHOTO',  false, NOW() + INTERVAL '30 days',  NOW()),
                                                                                                              ('Use public transport for a full day',              'Green Commute Day',    75, 'TRAVEL',         'TICKET', false, NOW() + INTERVAL '60 days',  NOW()),
                                                                                                              ('Cycle to work instead of driving',                 'Cycle to Work',       100, 'CYCLING,HEALTH', 'GPS',    true,  NOW() + INTERVAL '120 days', NOW());

-- 7. GPS_ACTION_TASKS (action_id references action.id)
INSERT INTO gps_action_tasks (description, display_name, action_id, latitude, longitude, distance_threshold_level) VALUES
                                                                                             ('Check in at Bürkliplatz',    'Waypoint 1 – Bürkliplatz',    1, 47.3665, 8.5417, 'EASY'),
                                                                                             ('Check in at Zürichhorn',     'Waypoint 2 – Zürichhorn',     1, 47.3528, 8.5556, 'MEDIUM'),
                                                                                             ('Check in at Seebad Utoquai', 'Waypoint 3 – Seebad Utoquai', 1, 47.3597, 8.5493, 'HARD'),
                                                                                             ('Start at HB Zürich',         'Start – Hauptbahnhof',        4, 47.3782, 8.5403, 'EASY'),
                                                                                             ('Arrive at ZHAW Winterthur',  'End – ZHAW',                  4, 47.4985, 8.7271, 'EASY');

-- 8. USER_ACTION_MAPPING (run AFTER V8 migration fixes the FK)
INSERT INTO user_action_mapping (user_id, action_id, completion_state, created_on, is_subtask, subtask_id) VALUES
                                                                                                                 (1, 1, 'IN_PROGRESS', NOW(), false, NULL),
                                                                                                                 (1, 2, 'COMPLETED',   NOW(), false, NULL),
                                                                                                                 (2, 3, 'COMPLETED',   NOW(), false, NULL),
                                                                                                                 (2, 4, 'IN_PROGRESS', NOW(), true,  '1'),
                                                                                                                 (3, 1, 'IN_PROGRESS', NOW(), false, NULL);

-- 9. HTTP_PERMISSIONS (role-based routing)
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/auth/logout', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/auth/whoami', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/auth/verify-email', 'POST', ''),
    ('/api/auth/verify-email-change', 'POST', ''),
    ('/api/users/me/password-change', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/**', 'GET', 'ROLE_USER,ROLE_ADMIN'),
    ('/api/action', 'GET', ''),
    ('/api/actions', 'GET', ''),
    ('/api/actions/**', 'GET', ''),
    ('/api/actions', 'POST', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/**', 'PUT', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/**', 'DELETE', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/subTasks/**', 'PUT', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/subTasks/**', 'DELETE', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/settings/**', '*', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/admin/**', '*', 'ROLE_ADMIN'),
    ('/api/user/**', '*', 'ROLE_USER,ROLE_ADMIN');
