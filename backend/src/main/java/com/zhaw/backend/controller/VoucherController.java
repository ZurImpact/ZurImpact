package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        try {
            List<VoucherDto> vouchers = voucherService.getAllVouchers();
            return ResponseEntity.ok(vouchers);
        }
        catch (Exception e)
        {
            return ResponseEntity.status(500).build();
        }
    }

}
