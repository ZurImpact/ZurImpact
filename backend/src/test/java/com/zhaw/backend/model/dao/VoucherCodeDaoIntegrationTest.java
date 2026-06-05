package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.model.entities.VoucherCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("VoucherCodeDao – Integration Tests (Testcontainers PostgreSQL)")
class VoucherCodeDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private VoucherCodeDao dao;
    private Long voucherId;
    private Long userId;

    @BeforeEach
    void setUp() {
        dao = new VoucherCodeDao(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        Long companyId = TestDataHelper.insertCompany(jdbcTemplate, addressId);
        voucherId = insertVoucher(companyId);
        userId = TestDataHelper.insertUser(jdbcTemplate, addressId);
    }

    private Long insertVoucher(Long companyId) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO voucher (description, display_name, points, company_id, valid_until, created_on) VALUES (?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, "Test voucher");
            ps.setString(2, "Voucher-" + UUID.randomUUID().toString().substring(0, 6));
            ps.setInt(3, 100);
            ps.setLong(4, companyId);
            ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now().plusDays(30)));
            ps.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, kh);
        Map<String, Object> keys = kh.getKeys();
        return keys != null && keys.containsKey("id")
                ? ((Number) keys.get("id")).longValue()
                : kh.getKey().longValue();
    }

    private void insertCode(Long forVoucherId, Long assignedUserId) {
        KeyHolder kh = new GeneratedKeyHolder();
        String code = "CODE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO voucher_code (voucher_id, code, user_id, assigned_at) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, forVoucherId);
            ps.setString(2, code);
            if (assignedUserId != null) {
                ps.setLong(3, assignedUserId);
                ps.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            } else {
                ps.setNull(3, java.sql.Types.BIGINT);
                ps.setNull(4, java.sql.Types.TIMESTAMP);
            }
            return ps;
        }, kh);
        Map<String, Object> keys = kh.getKeys();
        if (keys != null && keys.containsKey("id")) {
            ((Number) keys.get("id")).longValue();
        } else {
            kh.getKey().longValue();
        }
    }

    // ── countAvailableGrouped ────────────────────────────────────────────

    @Nested
    @DisplayName("countAvailableGrouped")
    class CountAvailableGrouped {

        @Test
        @DisplayName("returns empty map when no codes exist")
        void emptyMapWhenNoCodes() {
            Map<Long, Integer> counts = dao.countAvailableGrouped();

            assertTrue(counts.isEmpty());
        }

        @Test
        @DisplayName("counts only unassigned codes per voucher")
        void countsOnlyUnassigned() {
            insertCode(voucherId, null);
            insertCode(voucherId, null);
            insertCode(voucherId, userId);

            Map<Long, Integer> counts = dao.countAvailableGrouped();

            assertEquals(2, counts.get(voucherId));
        }

        @Test
        @DisplayName("groups counts by voucher_id")
        void groupsByVoucherId() {
            Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
            Long companyId2 = TestDataHelper.insertCompany(jdbcTemplate, addressId);
            Long voucherId2 = insertVoucher(companyId2);

            insertCode(voucherId, null);
            insertCode(voucherId2, null);
            insertCode(voucherId2, null);

            Map<Long, Integer> counts = dao.countAvailableGrouped();

            assertEquals(1, counts.get(voucherId));
            assertEquals(2, counts.get(voucherId2));
        }

        @Test
        @DisplayName("omits voucher from map when all codes are assigned")
        void omitsVoucherWhenAllAssigned() {
            insertCode(voucherId, userId);

            Map<Long, Integer> counts = dao.countAvailableGrouped();

            assertFalse(counts.containsKey(voucherId));
        }
    }

    // ── findAndAssign ────────────────────────────────────────────────────

    @Nested
    @DisplayName("findAndAssign")
    class FindAndAssign {

        @Test
        @DisplayName("returns empty Optional when no codes available")
        void returnsEmptyWhenNoneAvailable() {
            Optional<VoucherCode> result = dao.findAndAssign(voucherId, userId, LocalDateTime.now());

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("returns empty Optional when all codes are already assigned")
        void returnsEmptyWhenAllAssigned() {
            insertCode(voucherId, userId);

            Optional<VoucherCode> result = dao.findAndAssign(voucherId, userId, LocalDateTime.now());

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("assigns code and returns it with correct fields")
        void assignsCodeAndReturnsIt() {
            insertCode(voucherId, null);
            LocalDateTime assignedAt = LocalDateTime.now().withNano(0);

            Optional<VoucherCode> result = dao.findAndAssign(voucherId, userId, assignedAt);

            assertTrue(result.isPresent());
            VoucherCode vc = result.get();
            assertEquals(voucherId, vc.getVoucherId());
            assertEquals(userId, vc.getUserId());
            assertEquals(assignedAt, vc.getAssignedAt());
            assertNotNull(vc.getCode());
        }

        @Test
        @DisplayName("assigned code is no longer available in countAvailableGrouped")
        void assignedCodeReducesAvailableCount() {
            insertCode(voucherId, null);
            insertCode(voucherId, null);

            dao.findAndAssign(voucherId, userId, LocalDateTime.now());

            Map<Long, Integer> counts = dao.countAvailableGrouped();
            assertEquals(1, counts.get(voucherId));
        }

        @Test
        @DisplayName("second call with one code left assigns nothing more when already assigned")
        void twoCallsExhaustSingleCode() {
            insertCode(voucherId, null);

            Long addressId2 = TestDataHelper.insertAddress(jdbcTemplate);
            Long userId2 = TestDataHelper.insertUser(jdbcTemplate, addressId2);

            dao.findAndAssign(voucherId, userId, LocalDateTime.now());
            Optional<VoucherCode> second = dao.findAndAssign(voucherId, userId2, LocalDateTime.now());

            assertTrue(second.isEmpty());
        }
    }
}
