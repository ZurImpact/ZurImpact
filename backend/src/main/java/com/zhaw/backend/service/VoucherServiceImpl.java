package com.zhaw.backend.service;

import com.zhaw.backend.mappers.VoucherMapper;
import com.zhaw.backend.model.dao.UserVoucherDao;
import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.dto.UserVoucherDto;
import com.zhaw.backend.model.entities.UserVoucher;
import com.zhaw.backend.model.entities.Voucher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherDao voucherDao;
    private final UserVoucherDao userVoucherDao;
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
        Optional<Voucher> voucherOpt = voucherDao.findById(voucherId);
        if (voucherOpt.isEmpty()) {
            throw new Exception("Voucher not found");
        }

        Voucher voucher = voucherOpt.get();

        if (!voucher.getValidUntil().isAfter(LocalDateTime.now())) {
            throw new Exception("Voucher has expired");
        }

        boolean deducted = userService.deductPointsFromUser(userId, voucher.getPoints());
        if (!deducted) {
            throw new Exception("Insufficient points");
        }

        String redemptionCode = UUID.randomUUID().toString();
        LocalDateTime redeemedAt = LocalDateTime.now();

        UserVoucher userVoucher = UserVoucher.builder()
                .userId(userId)
                .voucherId(voucherId)
                .redemptionCode(redemptionCode)
                .redeemedAt(redeemedAt)
                .build();
        userVoucherDao.save(userVoucher);

        return UserVoucherDto.builder()
                .redemptionCode(redemptionCode)
                .voucherId(voucherId)
                .displayName(voucher.getDisplayName())
                .pointsDeducted(voucher.getPoints())
                .redeemedAt(redeemedAt)
                .build();
    }
}