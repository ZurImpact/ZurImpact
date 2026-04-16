package com.zhaw.backend.controller;

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

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
}

