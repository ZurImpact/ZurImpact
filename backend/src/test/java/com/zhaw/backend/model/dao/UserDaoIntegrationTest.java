package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.config.TestDataHelper;

import com.zhaw.backend.model.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration tests for {@link UserDao}.
 * <p>
 * These tests run against a real PostgreSQL database started by Testcontainers.
 * Flyway migrations are applied automatically by {@link TestDatabaseConfig}.
 * Each test method is wrapped in a transaction that is rolled back after the
 * test to keep the database clean.
 * <p>
 * If Docker is not available, the entire test class is skipped.
 */
@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("UserDao – Integration Tests (Testcontainers PostgreSQL)")
class UserDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UserDao userDao;
    private Long sharedAddressId;

    @BeforeEach
    void setUp() {
        userDao = new UserDao(jdbcTemplate);
        sharedAddressId = TestDataHelper.insertAddress(jdbcTemplate);
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private User createSampleUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash("hashed_pw");
        user.setAddress(TestDataHelper.insertAddress(jdbcTemplate));
        return user;
    }

    // ── INSERT ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("insert assigns a generated ID")
    void insert_assignsGeneratedId() {
        User user = createSampleUser("alice", "alice@example.com");

        User saved = userDao.save(user);

        assertNotNull(saved.getId(), "ID must be set after insert");
        assertTrue(saved.getId() > 0);
    }

    @Test
    @DisplayName("insert sets createdAt if null")
    void insert_setsCreatedAt_whenNull() {
        User user = createSampleUser("bob", "bob@example.com");

        User saved = userDao.save(user);

        assertNotNull(saved.getCreatedAt(), "createdAt must be set by the DAO");
    }

    @Test
    @DisplayName("insert preserves explicit createdAt")
    void insert_preservesCreatedAt_whenSet() {
        User user = createSampleUser("carol", "carol@example.com");
        LocalDateTime fixed = LocalDateTime.of(2024, 6, 15, 10, 30);
        user.setCreatedAt(fixed);

        User saved = userDao.save(user);

        assertEquals(fixed, saved.getCreatedAt());
    }

    // ── INSERT – constraint violations ──────────────────────────────────

    @Test
    @DisplayName("insert with duplicate username throws DataIntegrityViolationException")
    void insert_duplicateUsername_throwsException() {
        userDao.save(createSampleUser("duplicate_user", "first@example.com"));

        User second = createSampleUser("duplicate_user", "second@example.com");

        assertThrows(DataIntegrityViolationException.class, () -> userDao.save(second),
                "Duplicate username must violate the UNIQUE constraint");
    }

    @Test
    @DisplayName("insert with duplicate email throws DataIntegrityViolationException")
    void insert_duplicateEmail_throwsException() {
        userDao.save(createSampleUser("user_one", "same@example.com"));

        User second = createSampleUser("user_two", "same@example.com");

        assertThrows(DataIntegrityViolationException.class, () -> userDao.save(second),
                "Duplicate email must violate the UNIQUE constraint");
    }

    @Test
    @DisplayName("insert with null required fields throws DataIntegrityViolationException")
    void insert_nullRequiredFields_throwsException() {
        User user = new User();
        // username, email, passwordHash are all null

        assertThrows(DataIntegrityViolationException.class, () -> userDao.save(user),
                "Null NOT-NULL columns must violate the constraint");
    }

    // ── SELECT by ID ────────────────────────────────────────────────────

    @Test
    @DisplayName("findById returns the inserted user")
    void findById_returnsInsertedUser() {
        User saved = userDao.save(createSampleUser("dave", "dave@example.com"));

        Optional<User> found = userDao.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("dave", found.get().getUsername());
        assertEquals("dave@example.com", found.get().getEmail());
        assertEquals("hashed_pw", found.get().getPasswordHash());
        assertNotNull(found.get().getCreatedAt());
        assertFalse(found.get().getEmailVerified(), "emailVerified should default to false on insert");
        assertFalse(found.get().getHasPendingEmailChange(), "hasPendingEmailChange should default to false on insert");
    }

    @Test
    @DisplayName("findById returns empty for non-existent ID")
    void findById_returnsEmpty_forUnknownId() {
        Optional<User> found = userDao.findById(999999L);

        assertTrue(found.isEmpty());
    }

    // ── SELECT by username ──────────────────────────────────────────────

    @Test
    @DisplayName("findByUsername returns the correct user")
    void findByUsername_returnsCorrectUser() {
        userDao.save(createSampleUser("eve", "eve@example.com"));

        Optional<User> found = userDao.findByUsername("eve");

        assertTrue(found.isPresent());
        assertEquals("eve@example.com", found.get().getEmail());
    }

    @Test
    @DisplayName("findByUsername returns empty for unknown username")
    void findByUsername_returnsEmpty_forUnknown() {
        Optional<User> found = userDao.findByUsername("no_such_user");

        assertTrue(found.isEmpty());
    }

    // ── SELECT all ──────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll returns all inserted users")
    void findAll_returnsAllUsers() {
        userDao.save(createSampleUser("frank", "frank@example.com"));
        userDao.save(createSampleUser("grace", "grace@example.com"));

        List<User> all = userDao.findAll();

        assertTrue(all.size() >= 2, "Should contain at least the two inserted users");
    }

    // ── UPDATE ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("update changes fields correctly")
    void update_changesFields() {
        User saved = userDao.save(createSampleUser("heidi", "heidi@example.com"));

        saved.setEmail("heidi_new@example.com");
        saved.setPasswordHash("new_hash");
        saved.setEmailVerified(true);
        saved.setHasPendingEmailChange(true);
        userDao.save(saved);

        Optional<User> updated = userDao.findById(saved.getId());
        assertTrue(updated.isPresent());
        assertEquals("heidi_new@example.com", updated.get().getEmail());
        assertEquals("new_hash", updated.get().getPasswordHash());
        assertTrue(updated.get().getEmailVerified(), "emailVerified should be updated");
        assertTrue(updated.get().getHasPendingEmailChange(), "hasPendingEmailChange should be updated");
        assertEquals("heidi", updated.get().getUsername(), "Username should not change");
    }

    @Test
    @DisplayName("update with non-existent ID silently returns the user (0 rows affected)")
    void update_nonExistentId_silentlyReturnsUser() {
        User phantom = createSampleUser("phantom", "phantom@example.com");
        phantom.setId(99999L);
        phantom.setCreatedAt(LocalDateTime.now());
        phantom.setAddress(sharedAddressId);

        // jdbc.update() returns 0, but the DAO still returns the user object.
        User returned = userDao.save(phantom);

        assertEquals(99999L, returned.getId(),
                "DAO should return the same user object even though no row was updated");
        assertTrue(userDao.findById(99999L).isEmpty(),
                "No row should actually exist in the database");
    }

    // ── DELETE ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteById removes the user")
    void deleteById_removesUser() {
        User saved = userDao.save(createSampleUser("ivan", "ivan@example.com"));

        userDao.deleteById(saved.getId());

        Optional<User> found = userDao.findById(saved.getId());
        assertTrue(found.isEmpty(), "User should be gone after delete");
    }

    @Test
    @DisplayName("deleteById with non-existent ID does not throw")
    void deleteById_nonExistentId_doesNotThrow() {
        assertDoesNotThrow(() -> userDao.deleteById(99999L),
                "Deleting a non-existent ID should be a silent no-op");
    }

    // ── Flyway migration verification ───────────────────────────────────

    @Test
    @DisplayName("Flyway V1 migration created the users table")
    void flywayMigration_createsUsersTable() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users'",
                Integer.class);
        assertNotNull(count);
        assertEquals(1, count, "The 'users' table must exist after Flyway migration");
    }

    // ── POINTS ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("insert sets default points to 0")
    void insert_setsDefaultPoints() {
        User user = createSampleUser("points_user", "points_user@example.com");

        User saved = userDao.save(user);

        assertEquals(0, saved.getPoints(), "Points should default to 0 on insert");
    }

    @Test
    @DisplayName("insert preserves explicit points")
    void insert_preservesExplicitPoints() {
        User user = createSampleUser("points_custom", "points_custom@example.com");
        user.setPoints(42);

        User saved = userDao.save(user);

        assertEquals(42, saved.getPoints(), "Points should be preserved when explicitly set");
    }

    @Test
    @DisplayName("update persists points changes")
    void update_persistsPointsChanges() {
        User saved = userDao.save(createSampleUser("points_update", "points_update@example.com"));

        saved.setPoints(7);
        userDao.save(saved);

        Optional<User> updated = userDao.findById(saved.getId());
        assertTrue(updated.isPresent());
        assertEquals(7, updated.get().getPoints(), "Points should update on save");
    }

    // ── EMAIL VERIFICATION & PENDING CHANGE ───────────────────────────────

    @Test
    @DisplayName("insert sets default emailVerified and hasPendingEmailChange to false")
    void insert_setsDefaultBooleans() {
        User user = createSampleUser("bool_user", "bool_user@example.com");

        User saved = userDao.save(user);

        assertFalse(saved.getEmailVerified(), "emailVerified should default to false");
        assertFalse(saved.getHasPendingEmailChange(), "hasPendingEmailChange should default to false");
    }

    @Test
    @DisplayName("insert preserves explicit emailVerified and hasPendingEmailChange")
    void insert_preservesExplicitBooleans() {
        User user = createSampleUser("bool_explicit", "bool_explicit@example.com");
        user.setEmailVerified(true);
        user.setHasPendingEmailChange(true);

        User saved = userDao.save(user);

        assertTrue(saved.getEmailVerified());
        assertTrue(saved.getHasPendingEmailChange());
    }
}
