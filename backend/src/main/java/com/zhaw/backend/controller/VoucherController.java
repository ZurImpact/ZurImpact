package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Voucher catalogue and redemption. The service throws typed exceptions
 * ({@code NotFoundException}, {@code BusinessRuleException}) that the
 * {@code GlobalExceptionHandler} renders as RFC 9457 problems.
 */
@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping("/{voucherId}/redeem")
    public ResponseEntity<UserVoucherDto> redeemVoucher(@PathVariable Long voucherId, Authentication authentication) throws Exception {
        return ResponseEntity.ok(voucherService.redeemVoucher(authentication.getName(), voucherId));
    }
}