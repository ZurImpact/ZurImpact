# Testing Concept – ZurImpact Backend

## 1. Overview

The ZurImpact backend uses a **multi-layered test strategy** to ensure correctness from the model layer up to the database. Tests are organized into three tiers, each with a specific purpose and trade-off between speed and realism.

| Tier | Type | Framework | DB Required? | Speed |
|------|------|-----------|-------------|-------|
| 1 | Unit Tests | JUnit 5 + Mockito | No | ~1 s |
| 2 | Integration Tests | JUnit 5 + Testcontainers | Docker | ~15 s |

---

## 2. Test Tiers Explained

### Tier 1 – Unit Tests (Service Layer)

**Purpose:** Verify that the service layer correctly delegates to the DAO and
applies business logic without relying on a real database.

**How it works:**
- Uses [Mockito](https://site.mockito.org/) to create mock objects of `UserDao`.
- Injects the mocks into `UserServiceImpl` via `@InjectMocks`.
- Each test asserts the return value **and** verifies that the correct DAO method
  was called with the expected arguments.

**What it covers:**
- `UserServiceImpl.findUserById()` – found & not found
- `UserServiceImpl.findUserByUsername()` – found & not found
- `UserServiceImpl.findAllUsers()` – populated & empty list
- `UserServiceImpl.saveUser()` – insert (id=null) & update (id set)
- `UserServiceImpl.deleteUserById()` – delegation check

**Test class:** `src/test/java/com/zhaw/backend/service/UserServiceImplTest.java`

---

### Tier 2 – Integration Tests (DAO + Database)

**Purpose:** Verify that the hand-written SQL in `UserDao` works against a
**real PostgreSQL 16 database**, and that Flyway migrations produce a correct schema.

**How it works:**
- Uses [Testcontainers](https://testcontainers.com/) to start an ephemeral
  PostgreSQL 16 Docker container before the test class runs.
- A Spring `@Configuration` class (`TestDatabaseConfig`) wires up:
    - `HikariDataSource` → container
    - `Flyway` → runs all migrations from `src/main/resources/db/migration/`
    - `JdbcTemplate`, `EntityManagerFactory`, `TransactionManager`
- Each test method is `@Transactional` and is **rolled back** after execution,
  keeping the database clean between tests.
- An `@ExtendWith(DockerAvailableCondition.class)` annotation ensures that
  when Docker is not running, the tests are **skipped with a message** instead
  of crashing.

**What it covers:**
- `INSERT` – generated ID is returned, `createdAt` is set if null
- `INSERT` – constraint violations: duplicate username, duplicate email, null required fields
- `SELECT` by ID – `ROW_MAPPER` correctly maps all columns
- `SELECT` by username – lookup and not-found cases
- `SELECT` all – multi-row result mapping
- `UPDATE` – modifies correct columns, leaves others unchanged
- `UPDATE` – non-existent ID is a silent no-op (0 rows affected, no exception)
- `DELETE` – user is removed from the database
- `DELETE` – non-existent ID is a silent no-op (no exception)
- Flyway verification – `users` table exists after migration

**Test classes:**
- `src/test/java/com/zhaw/backend/model/dao/UserDaoIntegrationTest.java`
- `src/test/java/com/zhaw/backend/config/PersistenceConfigTest.java`

---

## 3. Test Infrastructure

### Shared Configuration

| File | Purpose |
|------|---------|
| `TestDatabaseConfig.java` | Spring `@Configuration` that starts a Testcontainers PostgreSQL container and provides all persistence beans |
| `DockerAvailableCondition.java` | JUnit 5 `ExecutionCondition` that skips integration tests when Docker is unavailable |

### Prerequisites

- **Java 21** and **Maven** for all tests
- **Docker Desktop** (running) for Tier 2 integration tests only

---

## 4. How to Run the Tests

### Run All Tests

```bash
# From the project root
make test

# Or directly from the backend directory
cd backend && mvn clean test
```

### Expected Output

**With Docker running** (all 30 tests execute):
```
Tests run: 30, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

**Without Docker** (integration tests are skipped):
```
Tests run: 30, Failures: 0, Errors: 0, Skipped: 21
BUILD SUCCESS
```

In both cases the build succeeds. The 21 skipped tests are the integration
tests that require Docker — they will run when Docker Desktop is started.

---

## 5. Adding Tests for New Code

When adding new functionality, follow this pattern:

1. **New DAO?** → Add a `*IntegrationTest.java` in `dao/` that extends the
   same Testcontainers pattern: `@ExtendWith(DockerAvailableCondition.class)`,
   `@SpringJUnitConfig(TestDatabaseConfig.class)`, `@Transactional` (Tier 2).
   Include tests for constraint violations and edge-case behaviors (non-existent IDs, etc.).
2. **New service?** → Add a `*Test.java` in `service/` with `@ExtendWith(MockitoExtension.class)` and mock the DAO (Tier 1).
3. **New Flyway migration?** → The existing integration tests will automatically
   pick it up, since `TestDatabaseConfig` runs all migrations from
   `classpath:db/migration`.
4. **New entity?** → Do **not** write unit tests for Lombok-generated accessors
   or JPA lifecycle hooks (`@PrePersist`). Cover entity behavior through
   integration tests in the DAO tier instead.

---

## 6. Test File Overview

```
src/test/java/com/zhaw/backend/
├── config/
│   ├── DockerAvailableCondition.java         ← JUnit 5 condition (skip if no Docker)
│   ├── PersistenceConfigTest.java            ← Context smoke test
│   └── TestDatabaseConfig.java               ← Testcontainers Spring config
├── controller/
│   ├── ActionControllerTest.java
│   ├── LoginControllerTest.java
│   ├── SettingsControllerTest.java
│   ├── SubTaskControllerTest.java
│   ├── UserActionHistoryControllerTest.java
│   ├── UserControllerTest.java
│   └── VoucherControllerTest.java
├── mappers/
│   ├── ActionFilterMapperTest.java
│   ├── ActionMapperTest.java
│   ├── CompanyMapperTest.java
│   ├── SubTaskMapperTest.java
│   ├── UserActionHistoryMapperTest.java
│   ├── UserMapperTest.java
│   └── VoucherMapperTest.java
├── model/dao/
│   └── UserDaoIntegrationTest.java           ← SQL + constraint integration tests
├── security/
│   ├── AuthCookieFilterTest.java
│   ├── AuthServiceTest.java
│   ├── SecurityConfigTest.java
│   └── SessionServiceTest.java
├── service/
│   ├── ActionServiceImplTest.java
│   ├── SubTaskServiceImplTest.java
│   ├── UserActionHistoryServiceImplTest.java
│   ├── UserServiceImplTest.java              ← Service unit tests (Mockito)
│   └── VoucherServiceImplTest.java
└── validator/
    ├── ActionValidatorTest.java
    └── SubTaskValidatorTest.java
```
