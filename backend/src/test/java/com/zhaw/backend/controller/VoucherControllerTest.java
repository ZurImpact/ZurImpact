package com.zhaw.backend.controller;

import com.zhaw.backend.exception.BusinessRuleException;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.service.VoucherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VoucherController - Unit Tests")
class VoucherControllerTest {

    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private VoucherController voucherController;

    @Nested
    @DisplayName("getAllVouchers")
    class GetAllVouchers {

        @Test
        @DisplayName("returns 200 with vouchers when service succeeds")
        void returns200WithVouchersWhenServiceSucceeds() {
            VoucherDto voucher = VoucherDto.builder()
                    .id(1L)
                    .displayName("Coffee")
                    .points(20)
                    .build();
            when(voucherService.getAllVouchers()).thenReturn(List.of(voucher));

            ResponseEntity<List<VoucherDto>> response = voucherController.getAllVouchers();

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
            assertEquals("Coffee", response.getBody().getFirst().getDisplayName());
            verify(voucherService).getAllVouchers();
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenServiceThrows() {
            when(voucherService.getAllVouchers()).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> voucherController.getAllVouchers());
        }
    }

    @Nested
    @DisplayName("redeemVoucher")
    class RedeemVoucher {

        private Authentication auth() {
            Authentication a = mock(Authentication.class);
            when(a.getName()).thenReturn("alice");
            return a;
        }

        @Test
        @DisplayName("returns 200 with DTO on success")
        void returns200OnSuccess() throws Exception {
            UserVoucherDto dto = UserVoucherDto.builder()
                    .voucherId(1L)
                    .code("GREENRIDE-ABC1")
                    .displayName("Green Ride")
                    .pointsDeducted(100)
                    .assignedAt(LocalDateTime.now())
                    .build();
            when(voucherService.redeemVoucher("alice", 1L)).thenReturn(dto);

            ResponseEntity<UserVoucherDto> response = voucherController.redeemVoucher(1L, auth());

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(voucherService).redeemVoucher("alice", 1L);
        }

        @Test
        @DisplayName("propagates NotFoundException when voucher not found")
        void propagatesNotFoundWhenVoucherNotFound() throws Exception {
            when(voucherService.redeemVoucher("alice", 99L))
                    .thenThrow(new NotFoundException("Voucher not found"));

            Authentication auth = auth();
            assertThrows(NotFoundException.class, () -> voucherController.redeemVoucher(99L, auth));
        }

        @Test
        @DisplayName("propagates BusinessRuleException for business-rule failures (expired, no codes, insufficient points)")
        void propagatesBusinessRuleForOtherFailures() throws Exception {
            when(voucherService.redeemVoucher("alice", 1L))
                    .thenThrow(new BusinessRuleException("Insufficient points"));

            Authentication auth = auth();
            assertThrows(BusinessRuleException.class, () -> voucherController.redeemVoucher(1L, auth));
        }
    }
}
