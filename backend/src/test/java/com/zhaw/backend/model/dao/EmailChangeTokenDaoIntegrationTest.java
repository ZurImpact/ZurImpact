package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.model.entities.EmailChangeToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("EmailChangeTokenDao – Integration Tests (Testcontainers PostgreSQL)")
class EmailChangeTokenDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private EmailChangeTokenDao dao;
    private Long userId;

    @BeforeEach
    void setUp() {
        dao = new EmailChangeTokenDao(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        userId = TestDataHelper.insertUser(jdbcTemplate, addressId);
    }

    private EmailChangeToken buildToken(Long forUserId) {
        return EmailChangeToken.builder()
                .tokenHash(UUID.randomUUID().toString())
                .userId(forUserId)
                .newEmail(UUID.randomUUID().toString().substring(0, 8) + "@new.com")
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
    }

    // ── insert ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("insert")
    class Insert {

        @Test
        @DisplayName("returns the inserted token")
        void returnsToken() {
            EmailChangeToken token = buildToken(userId);

            EmailChangeToken result = dao.insert(token);

            assertEquals(token.getTokenHash(), result.getTokenHash());
            assertEquals(token.getNewEmail(), result.getNewEmail());
        }

        @Test
        @DisplayName("inserted token is findable by hash")
        void insertedTokenFindableByHash() {
            EmailChangeToken token = buildToken(userId);
            dao.insert(token);

            Optional<EmailChangeToken> found = dao.findByTokenHash(token.getTokenHash());

            assertTrue(found.isPresent());
            assertEquals(token.getNewEmail(), found.get().getNewEmail());
            assertEquals(userId, found.get().getUserId());
        }
    }

    // ── findByTokenHash ──────────────────────────────────────────────────

    @Nested
    @DisplayName("findByTokenHash")
    class FindByTokenHash {

        @Test
        @DisplayName("returns empty Optional for unknown hash")
        void returnsEmptyForUnknownHash() {
            Optional<EmailChangeToken> found = dao.findByTokenHash("no-such-hash");

            assertTrue(found.isEmpty());
        }

        @Test
        @DisplayName("maps all fields correctly")
        void mapsAllFields() {
            LocalDateTime created = LocalDateTime.now().withNano(0);
            LocalDateTime expires = created.plusHours(2);
            EmailChangeToken token = EmailChangeToken.builder()
                    .tokenHash(UUID.randomUUID().toString())
                    .userId(userId)
                    .newEmail("mapped@test.com")
                    .createdAt(created)
                    .expiresAt(expires)
                    .build();
            dao.insert(token);

            EmailChangeToken found = dao.findByTokenHash(token.getTokenHash()).orElseThrow();

            assertEquals(created, found.getCreatedAt());
            assertEquals(expires, found.getExpiresAt());
            assertNull(found.getConsumedAt());
        }
    }

    // ── markConsumed ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("markConsumed")
    class MarkConsumed {

        @Test
        @DisplayName("sets consumed_at on the token")
        void setsConsumedAt() {
            EmailChangeToken token = buildToken(userId);
            dao.insert(token);
            LocalDateTime consumedAt = LocalDateTime.now().withNano(0);

            dao.markConsumed(token.getTokenHash(), consumedAt);

            EmailChangeToken found = dao.findByTokenHash(token.getTokenHash()).orElseThrow();
            assertEquals(consumedAt, found.getConsumedAt());
        }

        @Test
        @DisplayName("no-op for unknown hash")
        void noOpForUnknownHash() {
            assertDoesNotThrow(() -> dao.markConsumed("ghost-hash", LocalDateTime.now()));
        }
    }

    // ── deleteByUserId ───────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteByUserId")
    class DeleteByUserId {

        @Test
        @DisplayName("deletes all tokens for user and returns count")
        void deletesAllTokensForUser() {
            dao.insert(buildToken(userId));
            dao.insert(buildToken(userId));

            int deleted = dao.deleteByUserId(userId);

            assertEquals(2, deleted);
        }

        @Test
        @DisplayName("returns 0 when user has no tokens")
        void returnsZeroWhenNone() {
            assertEquals(0, dao.deleteByUserId(userId));
        }

        @Test
        @DisplayName("does not delete tokens belonging to other users")
        void doesNotDeleteOtherUsersTokens() {
            Long otherAddressId = TestDataHelper.insertAddress(jdbcTemplate);
            Long otherUserId = TestDataHelper.insertUser(jdbcTemplate, otherAddressId);
            dao.insert(buildToken(otherUserId));

            dao.deleteByUserId(userId);

            assertTrue(dao.findByTokenHash(buildToken(otherUserId).getTokenHash()).isEmpty());
            // verify the other user's token still exists via count
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM email_change_token WHERE user_id = ?", Integer.class, otherUserId);
            assertEquals(1, count);
        }
    }

    // ── hasValidPendingToken ─────────────────────────────────────────────

    @Nested
    @DisplayName("hasValidPendingToken")
    class HasValidPendingToken {

        @Test
        @DisplayName("returns true for unconsumed non-expired token")
        void trueForActiveToken() {
            dao.insert(buildToken(userId));

            assertTrue(dao.hasValidPendingToken(userId));
        }

        @Test
        @DisplayName("returns false when no tokens exist")
        void falseWhenNoTokens() {
            assertFalse(dao.hasValidPendingToken(userId));
        }

        @Test
        @DisplayName("returns false when token is consumed")
        void falseWhenConsumed() {
            EmailChangeToken token = buildToken(userId);
            dao.insert(token);
            dao.markConsumed(token.getTokenHash(), LocalDateTime.now());

            assertFalse(dao.hasValidPendingToken(userId));
        }

        @Test
        @DisplayName("returns false when token is expired")
        void falseWhenExpired() {
            EmailChangeToken expired = EmailChangeToken.builder()
                    .tokenHash(UUID.randomUUID().toString())
                    .userId(userId)
                    .newEmail("expired@test.com")
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .expiresAt(LocalDateTime.now().minusMinutes(1))
                    .build();
            dao.insert(expired);

            assertFalse(dao.hasValidPendingToken(userId));
        }
    }
}
