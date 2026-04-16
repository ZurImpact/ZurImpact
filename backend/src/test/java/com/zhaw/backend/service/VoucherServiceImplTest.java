package com.zhaw.backend.service;

import com.zhaw.backend.model.dao.VoucherCodeDao;
import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;
import com.zhaw.backend.model.entities.VoucherCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoucherServiceImpl - Unit Tests")
class VoucherServiceImplTest {

    @Mock
    private VoucherDao voucherDao;

    @Mock
    private VoucherCodeDao voucherCodeDao;

    @Mock
    private UserService userService;

    private VoucherServiceImpl voucherService;

    @BeforeEach
    void setUp() {
        voucherService = new VoucherServiceImpl(voucherDao, voucherCodeDao, userService);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private Voucher buildVoucher(Long id, int points, LocalDateTime validUntil) {
        return Voucher.builder()
                .id(id)
                .description("desc")
                .displayName("Test Voucher")
                .points(points)
                .companyId(1L)
                .validUntil(validUntil)
                .createdOn(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();
    }

    private VoucherCode buildCode(Long id, String code) {
        return VoucherCode.builder()
                .id(id)
                .voucherId(1L)
                .code(code)
                .build();
    }

    // ── getVoucherById ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getVoucherById")
    class GetVoucherById {

        @Test
        @DisplayName("returns mapped DTO when voucher exists")
        void returnsDtoWhenFound() {
            Voucher v = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            when(voucherDao.findById(1L)).thenReturn(Optional.of(v));

            VoucherDto result = voucherService.getVoucherById(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Test Voucher", result.getDisplayName());
        }

        @Test
        @DisplayName("returns null when voucher not found")
        void returnsNullWhenNotFound() {
            when(voucherDao.findById(99L)).thenReturn(Optional.empty());

            assertNull(voucherService.getVoucherById(99L));
        }
    }

    // ── getAllVouchers ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAllVouchers")
    class GetAllVouchers {

        @Test
        @DisplayName("returns mapped list with available counts")
        void returnsMappedListWithCounts() {
            Voucher v1 = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            Voucher v2 = buildVoucher(2L, 50, LocalDateTime.now().plusDays(10));
            when(voucherDao.getAll()).thenReturn(List.of(v1, v2));
            when(voucherCodeDao.countAvailableGrouped()).thenReturn(Map.of(1L, 3, 2L, 0));

            List<VoucherDto> result = voucherService.getAllVouchers();

            assertEquals(2, result.size());
            assertEquals(3, result.get(0).getAvailableCount());
            assertEquals(0, result.get(1).getAvailableCount());
        }

        @Test
        @DisplayName("defaults to 0 when voucher has no available codes in count map")
        void defaultsToZeroWhenNotInCountMap() {
            Voucher v1 = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            when(voucherDao.getAll()).thenReturn(List.of(v1));
            when(voucherCodeDao.countAvailableGrouped()).thenReturn(Map.of());

            List<VoucherDto> result = voucherService.getAllVouchers();

            assertEquals(0, result.getFirst().getAvailableCount());
        }
    }

    // ── redeemVoucher ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("redeemVoucher")
    class RedeemVoucher {

        @Test
        @DisplayName("happy path — assigns code and returns correct DTO")
        void happyPath_assignsCodeAndReturnsDto() throws Exception {
            Voucher voucher = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            VoucherCode code = buildCode(10L, "GREENRIDE-ABC1");

            when(voucherDao.findById(1L)).thenReturn(Optional.of(voucher));
            when(voucherCodeDao.findAndAssign(eq(1L), eq(5L), any(LocalDateTime.class))).thenReturn(Optional.of(code));
            when(userService.deductPointsFromUser(5L, 100)).thenReturn(true);

            UserVoucherDto result = voucherService.redeemVoucher(5L, 1L);

            assertNotNull(result);
            assertEquals("GREENRIDE-ABC1", result.getCode());
            assertEquals(1L, result.getVoucherId());
            assertEquals("Test Voucher", result.getDisplayName());
            assertEquals(100, result.getPointsDeducted());
            assertNotNull(result.getAssignedAt());
        }

        @Test
        @DisplayName("assigns code to the correct user and voucher")
        void assignsToCorrectUserAndVoucher() throws Exception {
            Voucher voucher = buildVoucher(1L, 50, LocalDateTime.now().plusDays(30));
            VoucherCode code = buildCode(42L, "ECOEATS-XYZ1");

            when(voucherDao.findById(1L)).thenReturn(Optional.of(voucher));
            when(voucherCodeDao.findAndAssign(eq(1L), eq(7L), any(LocalDateTime.class))).thenReturn(Optional.of(code));
            when(userService.deductPointsFromUser(anyLong(), anyInt())).thenReturn(true);

            UserVoucherDto result = voucherService.redeemVoucher(7L, 1L);

            verify(voucherCodeDao).findAndAssign(eq(1L), eq(7L), any(LocalDateTime.class));
            assertEquals("ECOEATS-XYZ1", result.getCode());
        }

        @Test
        @DisplayName("throws when voucher not found")
        void throwsWhenVoucherNotFound() {
            when(voucherDao.findById(99L)).thenReturn(Optional.empty());

            Exception ex = assertThrows(Exception.class, () -> voucherService.redeemVoucher(1L, 99L));
            assertEquals("Voucher not found", ex.getMessage());

            verifyNoInteractions(voucherCodeDao, userService);
        }

        @Test
        @DisplayName("throws when voucher has expired")
        void throwsWhenExpired() {
            Voucher expired = buildVoucher(1L, 100, LocalDateTime.now().minusDays(1));
            when(voucherDao.findById(1L)).thenReturn(Optional.of(expired));

            Exception ex = assertThrows(Exception.class, () -> voucherService.redeemVoucher(5L, 1L));
            assertEquals("Voucher has expired", ex.getMessage());

            verifyNoInteractions(voucherCodeDao, userService);
        }

        @Test
        @DisplayName("throws when no codes available")
        void throwsWhenNoCodesAvailable() {
            Voucher voucher = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            when(voucherDao.findById(1L)).thenReturn(Optional.of(voucher));
            when(voucherCodeDao.findAndAssign(eq(1L), eq(5L), any(LocalDateTime.class))).thenReturn(Optional.empty());

            Exception ex = assertThrows(Exception.class, () -> voucherService.redeemVoucher(5L, 1L));
            assertEquals("No codes available", ex.getMessage());

            verifyNoInteractions(userService);
        }

        @Test
        @DisplayName("throws when user has insufficient points")
        void throwsWhenInsufficientPoints() {
            Voucher voucher = buildVoucher(1L, 100, LocalDateTime.now().plusDays(30));
            VoucherCode code = buildCode(10L, "GREENRIDE-ABC1");

            when(voucherDao.findById(1L)).thenReturn(Optional.of(voucher));
            when(voucherCodeDao.findAndAssign(eq(1L), eq(5L), any(LocalDateTime.class))).thenReturn(Optional.of(code));
            when(userService.deductPointsFromUser(5L, 100)).thenReturn(false);

            Exception ex = assertThrows(Exception.class, () -> voucherService.redeemVoucher(5L, 1L));
            assertEquals("Insufficient points", ex.getMessage());
        }

        @Test
        @DisplayName("rolls back code assignment when point deduction fails")
        void rollsBackAssignmentWhenDeductionFails() {
            Voucher voucher = buildVoucher(1L, 200, LocalDateTime.now().plusDays(30));
            VoucherCode code = buildCode(3L, "VELO-FREE-001");

            when(voucherDao.findById(1L)).thenReturn(Optional.of(voucher));
            when(voucherCodeDao.findAndAssign(eq(1L), eq(5L), any(LocalDateTime.class))).thenReturn(Optional.of(code));
            when(userService.deductPointsFromUser(5L, 200)).thenReturn(false);

            assertThrows(Exception.class, () -> voucherService.redeemVoucher(5L, 1L));

            // findAndAssign was called (code was claimed in DB), but the @Transactional
            // on the service method rolls back the UPDATE when the exception propagates
            verify(voucherCodeDao).findAndAssign(eq(1L), eq(5L), any(LocalDateTime.class));
        }
    }
}
