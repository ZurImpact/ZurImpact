package com.zhaw.backend.service;

import com.zhaw.backend.mappers.VoucherMapper;
import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    VoucherDao voucherDao;

    @Override
    public boolean createVoucher(VoucherDto voucherDto) {
        return false;
    }

    @Override
    public VoucherDto getVoucherById(Long id) {
        return null;
    }

    @Override
    public List<VoucherDto> getAllVouchers() {
        List<Voucher> voucherList = voucherDao.getAll();
        return VoucherMapper.toDtoList(voucherList);
    }
}
