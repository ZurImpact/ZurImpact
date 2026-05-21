-- Removes any old permissions
DELETE FROM http_permission;

-- Public auth endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/auth/register', 'POST', ''),
    ('/api/auth/verify-email', 'POST', ''),
    ('/api/auth/resend-verification', 'POST', ''),
    ('/api/auth/login', 'POST', ''),
    ('/api/auth/password-reset/request', 'POST', ''),
    ('/api/auth/password-reset/confirm', 'POST', ''),
    ('/api/auth/verify-email-change', 'POST', ''),
    ('/api/auth/dev-login', 'POST', '');

-- Authenticated auth endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/auth/logout', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/auth/whoami', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER');

-- User endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/users/*', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/*/actions', 'GET', 'ROLE_ADMIN'),
    ('/api/users/me/actions', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/me/password-change', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/me/name-change', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/me/email-change', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/users/me/delete-account', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER');

-- Settings endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/settings', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/settings/username', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER');

-- Action endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/actions', 'GET', ''),
    ('/api/actions/*', 'GET', ''),
    ('/api/actions', 'POST', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/*', 'PUT', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/*', 'DELETE', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/startAction', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/completeAction', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/actions/cancelAction', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER');

-- SubTask endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/subTasks/completeSubTask', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/subTasks/*', 'PUT', 'ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/subTasks/*', 'DELETE', 'ROLE_ADMIN,ROLE_PARTNER');

-- Voucher endpoints
INSERT INTO http_permission (path_pattern, http_method, roles) VALUES
    ('/api/vouchers', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/vouchers/*/redeem', 'POST', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER'),
    ('/api/vouchers/**', 'GET', 'ROLE_USER,ROLE_ADMIN,ROLE_PARTNER');