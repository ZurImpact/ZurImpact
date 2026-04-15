package com.zhaw.backend.service;

import com.zhaw.backend.mappers.VoucherMapper;
import com.zhaw.backend.model.dao.VoucherCodeDao;
import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;
import com.zhaw.backend.model.entities.VoucherCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherDao voucherDao;
    private final VoucherCodeDao voucherCodeDao;
    private final UserService userService;

    @Override
    public boolean createVoucher(VoucherDto voucherDto) {
        return false;
    }

    @Override
    public VoucherDto getVoucherById(Long id) {
        return voucherDao.findById(id)
                .map(VoucherMapper::toDto)
                .orElse(null);
    }

    @Override
    public List<VoucherDto> getAllVouchers() {
        List<Voucher> voucherList = voucherDao.getAll();
        return VoucherMapper.toDtoList(voucherList);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVoucherDto redeemVoucher(Long userId, Long voucherId) throws Exception {
        Voucher voucher = voucherDao.findById(voucherId)
                .orElseThrow(() -> new Exception("Voucher not found"));

        if (!voucher.getValidUntil().isAfter(LocalDateTime.now())) {
            throw new Exception("Voucher has expired");
        }

        VoucherCode voucherCode = voucherCodeDao.findAvailableByVoucherId(voucherId)
                .orElseThrow(() -> new Exception("No codes available"));

        boolean deducted = userService.deductPointsFromUser(userId, voucher.getPoints());
        if (!deducted) {
            throw new Exception("Insufficient points");
        }

        LocalDateTime assignedAt = LocalDateTime.now();
        voucherCodeDao.assignToUser(voucherCode.getId(), userId, assignedAt);

        return UserVoucherDto.builder()
                .code(voucherCode.getCode())
                .voucherId(voucherId)
                .displayName(voucher.getDisplayName())
                .pointsDeducted(voucher.getPoints())
                .assignedAt(assignedAt)
                .build();
    }
}