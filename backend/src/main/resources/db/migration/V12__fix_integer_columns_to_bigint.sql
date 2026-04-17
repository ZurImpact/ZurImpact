-- V12: Fix all SERIAL (INTEGER) primary keys and INTEGER foreign key columns to BIGINT
--      to match the Long type used in JPA entities.

-- Step 1: Drop foreign key constraints that reference columns being altered
ALTER TABLE voucher             DROP CONSTRAINT IF EXISTS voucher_company_id_fkey;
ALTER TABLE user_action_mapping DROP CONSTRAINT IF EXISTS user_action_mapping_user_id_fkey;
ALTER TABLE user_action_mapping DROP CONSTRAINT IF EXISTS user_action_mapping_action_id_fkey;
ALTER TABLE gps_action_tasks    DROP CONSTRAINT IF EXISTS gps_action_tasks_action_id_fkey;
ALTER TABLE voucher_code        DROP CONSTRAINT IF EXISTS voucher_code_voucher_id_fkey;
ALTER TABLE voucher_code        DROP CONSTRAINT IF EXISTS voucher_code_user_id_fkey;

-- Step 2: Alter primary key columns (SERIAL = INTEGER-backed sequence)
ALTER TABLE address             ALTER COLUMN id TYPE BIGINT;
ALTER TABLE company             ALTER COLUMN id TYPE BIGINT;
ALTER TABLE voucher             ALTER COLUMN id TYPE BIGINT;
ALTER TABLE users               ALTER COLUMN id TYPE BIGINT;
ALTER TABLE action              ALTER COLUMN id TYPE BIGINT;
ALTER TABLE user_action_mapping ALTER COLUMN id TYPE BIGINT;
ALTER TABLE voucher_code        ALTER COLUMN id TYPE BIGINT;

-- Step 3: Alter foreign key columns
ALTER TABLE company             ALTER COLUMN address_id  TYPE BIGINT;
ALTER TABLE voucher             ALTER COLUMN company_id  TYPE BIGINT;
ALTER TABLE users               ALTER COLUMN address_id  TYPE BIGINT;
ALTER TABLE user_action_mapping ALTER COLUMN user_id     TYPE BIGINT;
ALTER TABLE user_action_mapping ALTER COLUMN action_id   TYPE BIGINT;
ALTER TABLE gps_action_tasks    ALTER COLUMN action_id   TYPE BIGINT;
ALTER TABLE voucher_code        ALTER COLUMN voucher_id  TYPE BIGINT;
ALTER TABLE voucher_code        ALTER COLUMN user_id     TYPE BIGINT;

-- Step 4: Re-add foreign key constraints
ALTER TABLE voucher             ADD CONSTRAINT voucher_company_id_fkey             FOREIGN KEY (company_id) REFERENCES company(id);
ALTER TABLE user_action_mapping ADD CONSTRAINT user_action_mapping_user_id_fkey    FOREIGN KEY (user_id)    REFERENCES users(id);
ALTER TABLE user_action_mapping ADD CONSTRAINT user_action_mapping_action_id_fkey  FOREIGN KEY (action_id)  REFERENCES action(id);
ALTER TABLE gps_action_tasks    ADD CONSTRAINT gps_action_tasks_action_id_fkey     FOREIGN KEY (action_id)  REFERENCES action(id);
ALTER TABLE voucher_code        ADD CONSTRAINT voucher_code_voucher_id_fkey        FOREIGN KEY (voucher_id) REFERENCES voucher(id);
ALTER TABLE voucher_code        ADD CONSTRAINT voucher_code_user_id_fkey           FOREIGN KEY (user_id)    REFERENCES users(id);
