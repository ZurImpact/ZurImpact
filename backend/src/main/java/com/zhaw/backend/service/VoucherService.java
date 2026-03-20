package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.VoucherDto;

import java.util.List;

public interface VoucherService {

    public boolean createVoucher(VoucherDto voucherDto);
    public VoucherDto getVoucherById(Long id);
    public List<VoucherDto> getAllVouchers();

}
