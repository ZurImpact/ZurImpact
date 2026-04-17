package com.zhaw.backend.model.dao;

import com.zhaw.backend.config.DockerAvailableCondition;
import com.zhaw.backend.config.TestDatabaseConfig;
import com.zhaw.backend.config.TestDataHelper;
import com.zhaw.backend.model.entities.Voucher;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(DockerAvailableCondition.class)
@SpringJUnitConfig(TestDatabaseConfig.class)
@Transactional
@DisplayName("VoucherDao – Integration Tests (Testcontainers PostgreSQL)")
class VoucherDaoIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private VoucherDao voucherDao;
    private Long companyId;

    @BeforeEach
    void setUp() {
        voucherDao = new VoucherDao(jdbcTemplate);
        Long addressId = TestDataHelper.insertAddress(jdbcTemplate);
        companyId = TestDataHelper.insertCompany(jdbcTemplate, addressId);
    }

    // ── Helper ──────────────────────────────────────────────────────────

    private Voucher buildVoucher(String displayName, int points) {
        Voucher v = new Voucher();
        v.setDescription("Description for " + displayName);
        v.setDisplayName(displayName);
        v.setPoints(points);
        v.setCompanyId(companyId);
        v.setValidUntil(LocalDateTime.now().plusDays(30));
        return v;
    }

    // ── findById ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("returns voucher when it exists")
        void returnsVoucherWhenExists() {
            Voucher saved = voucherDao.save(buildVoucher("Test Voucher", 50));

            Optional<Voucher> found = voucherDao.findById(saved.getId());

            assertTrue(found.isPresent());
            assertEquals("Test Voucher", found.get().getDisplayName());
            assertEquals(50, found.get().getPoints());
            assertEquals(companyId, found.get().getCompanyId());
        }

        @Test
        @DisplayName("returns empty Optional for non-existent ID")
        void returnsEmptyForNonExistent() {
            Optional<Voucher> found = voucherDao.findById(999999L);

            assertTrue(found.isEmpty());
        }
    }

    // ── getAll ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAll")
    class GetAll {

        @Test
        @DisplayName("returns all inserted vouchers")
        void returnsAllVouchers() {
            voucherDao.save(buildVoucher("Voucher A", 10));
            voucherDao.save(buildVoucher("Voucher B", 20));

            List<Voucher> all = voucherDao.getAll();

            assertTrue(all.size() >= 2);
        }

        @Test
        @DisplayName("returns empty list when no vouchers exist")
        void returnsEmptyListWhenNone() {
            List<Voucher> all = voucherDao.getAll();

            assertTrue(all.isEmpty());
        }
    }

    // ── save (insert) ────────────────────────────────────────────────────

    @Nested
    @DisplayName("save – insert")
    class SaveInsert {

        @Test
        @DisplayName("assigns generated ID after insert")
        void assignsGeneratedId() {
            Voucher v = buildVoucher("New Voucher", 25);

            Voucher saved = voucherDao.save(v);

            assertNotNull(saved.getId());
            assertTrue(saved.getId() > 0);
        }

        @Test
        @DisplayName("sets createdOn automatically when null")
        void setsCreatedOnWhenNull() {
            Voucher v = buildVoucher("AutoDate Voucher", 10);
            v.setCreatedOn(null);

            Voucher saved = voucherDao.save(v);

            assertNotNull(saved.getCreatedOn());
        }

        @Test
        @DisplayName("preserves explicit createdOn")
        void preservesExplicitCreatedOn() {
            LocalDateTime fixed = LocalDateTime.of(2025, 1, 15, 10, 0);
            Voucher v = buildVoucher("Fixed Date", 5);
            v.setCreatedOn(fixed);

            Voucher saved = voucherDao.save(v);

            assertEquals(fixed, saved.getCreatedOn());
        }

        @Test
        @DisplayName("throws IllegalArgumentException when companyId is null")
        void throwsWhenCompanyIdNull() {
            Voucher v = buildVoucher("No Company", 10);
            v.setCompanyId(null);

            assertThrows(IllegalArgumentException.class, () -> voucherDao.save(v));
        }
    }

    // ── save (update) ────────────────────────────────────────────────────

    @Nested
    @DisplayName("save – update")
    class SaveUpdate {

        @Test
        @DisplayName("persists changes when updating existing voucher")
        void persistsChangesOnUpdate() {
            Voucher saved = voucherDao.save(buildVoucher("Original", 10));
            saved.setDisplayName("Updated");
            saved.setPoints(99);

            Voucher updated = voucherDao.save(saved);

            Optional<Voucher> found = voucherDao.findById(updated.getId());
            assertTrue(found.isPresent());
            assertEquals("Updated", found.get().getDisplayName());
            assertEquals(99, found.get().getPoints());
        }

        @Test
        @DisplayName("throws IllegalArgumentException when companyId is null on update")
        void throwsWhenCompanyIdNullOnUpdate() {
            Voucher saved = voucherDao.save(buildVoucher("ValidFirst", 10));
            saved.setCompanyId(null);

            assertThrows(IllegalArgumentException.class, () -> voucherDao.save(saved));
        }
    }

    // ── deleteById ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteById")
    class DeleteById {

        @Test
        @DisplayName("removes the voucher")
        void removesVoucher() {
            Voucher saved = voucherDao.save(buildVoucher("ToDelete", 5));

            voucherDao.deleteById(saved.getId());

            assertTrue(voucherDao.findById(saved.getId()).isEmpty());
        }

        @Test
        @DisplayName("does not throw for non-existent ID")
        void doesNotThrowForNonExistent() {
            assertDoesNotThrow(() -> voucherDao.deleteById(999999L));
        }
    }
}
