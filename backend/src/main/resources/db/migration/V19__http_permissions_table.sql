CREATE TABLE http_permission (
    id           BIGSERIAL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL,
    http_method  VARCHAR(10)  NOT NULL DEFAULT '*',
    roles        VARCHAR(255)
);

