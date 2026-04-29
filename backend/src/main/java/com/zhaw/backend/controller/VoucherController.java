package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        try {
            List<VoucherDto> vouchers = voucherService.getAllVouchers();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{voucherId}/redeem")
    public ResponseEntity<?> redeemVoucher(@PathVariable Long voucherId, Authentication authentication) {
        try {
            UserVoucherDto result = voucherService.redeemVoucher(authentication.getName(), voucherId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            String message = e.getMessage();
            if ("Voucher not found".equals(message)) {
                return ResponseEntity.status(404).body(message);
            }
            return ResponseEntity.badRequest().body(message);
        }
    }
}