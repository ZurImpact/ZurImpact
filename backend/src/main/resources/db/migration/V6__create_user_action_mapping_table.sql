-- V6: Create user_action_mapping table
-- NOTE: No IF NOT EXISTS — Flyway's versioning guarantees this runs exactly once.
CREATE TABLE user_action_mapping (
                        id                  SERIAL                                      PRIMARY KEY,
                        user_id             INTEGER                                     NOT NULL,
                        action_id           INTEGER                                     NOT NULL,
                        completion_state    VARCHAR(50)                                 NOT NULL,
                        created_on          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP   NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (action_id) REFERENCES action(id)
);