package com.zhaw.backend.service;

import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoucherServiceImpl - Unit Tests")
class VoucherServiceImplTest {

    @Mock
    private VoucherDao voucherDao;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    @Nested
    @DisplayName("getAllVouchers")
    class GetAllVouchers {

        @Test
        @DisplayName("maps DAO entities to DTO list")
        void mapsDaoEntitiesToDtoList() {
            Voucher voucher = Voucher.builder()
                    .id(10L)
                    .description("Free coffee")
                    .displayName("Coffee Voucher")
                    .points(15)
                    .companyId(3L)
                    .validUntil(LocalDateTime.of(2026, 12, 1, 0, 0))
                    .createdOn(LocalDateTime.of(2026, 1, 1, 8, 0))
                    .build();
            when(voucherDao.getAll()).thenReturn(List.of(voucher));

            List<VoucherDto> result = voucherService.getAllVouchers();

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(10L, result.getFirst().getId());
            assertEquals("Coffee Voucher", result.getFirst().getDisplayName());
            assertEquals(15, result.getFirst().getPoints());
            verify(voucherDao).getAll();
        }

        @Test
        @DisplayName("returns empty list when DAO has no vouchers")
        void returnsEmptyListWhenDaoHasNoVouchers() {
            when(voucherDao.getAll()).thenReturn(Collections.emptyList());

            List<VoucherDto> result = voucherService.getAllVouchers();

            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(voucherDao).getAll();
        }
    }

    @Nested
    @DisplayName("stub methods")
    class StubMethods {

        @Test
        @DisplayName("createVoucher returns false (stub)")
        void createVoucherReturnsFalse() {
            VoucherDto dto = new VoucherDto();
            assertFalse(voucherService.createVoucher(dto));
        }

        @Test
        @DisplayName("getVoucherById returns null (stub)")
        void getVoucherByIdReturnsNull() {
            assertNull(voucherService.getVoucherById(1L));
        }
    }
}

