package com.zhaw.backend.controller;

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
        @DisplayName("returns 500 when service throws exception")
        void returns500WhenServiceThrowsException() {
            when(voucherService.getAllVouchers()).thenThrow(new RuntimeException("db error"));

            ResponseEntity<List<VoucherDto>> response = voucherController.getAllVouchers();

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
            verify(voucherService).getAllVouchers();
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

            ResponseEntity<?> response = voucherController.redeemVoucher(1L, auth());

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            verify(voucherService).redeemVoucher("alice", 1L);
        }

        @Test
        @DisplayName("returns 404 when voucher not found")
        void returns404WhenVoucherNotFound() throws Exception {
            when(voucherService.redeemVoucher("alice", 99L))
                    .thenThrow(new Exception("Voucher not found"));

            ResponseEntity<?> response = voucherController.redeemVoucher(99L, auth());

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 400 for other failures (expired, no codes, insufficient points)")
        void returns400ForOtherFailures() throws Exception {
            when(voucherService.redeemVoucher("alice", 1L))
                    .thenThrow(new Exception("Insufficient points"));

            ResponseEntity<?> response = voucherController.redeemVoucher(1L, auth());

            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertEquals("Insufficient points", response.getBody());
        }
    }
}

