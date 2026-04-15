package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.dto.UserVoucherDto;

import java.util.List;

public interface VoucherService {

    boolean createVoucher(VoucherDto voucherDto);
    VoucherDto getVoucherById(Long id);
    List<VoucherDto> getAllVouchers();
    UserVoucherDto redeemVoucher(Long userId, Long voucherId) throws Exception;
}
