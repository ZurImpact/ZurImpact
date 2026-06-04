package com.zhaw.backend.service;

import com.zhaw.backend.exception.BusinessRuleException;
import com.zhaw.backend.exception.NotFoundException;
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
import java.util.Map;
import java.util.stream.Collectors;

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
        Map<Long, Integer> availableCounts = voucherCodeDao.countAvailableGrouped();
        return voucherList.stream()
                .map(v -> {
                    VoucherDto dto = VoucherMapper.toDto(v);
                    dto.setAvailableCount(availableCounts.getOrDefault(v.getId(), 0));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVoucherDto redeemVoucher(String username, Long voucherId) {
        Voucher voucher = voucherDao.findById(voucherId)
                .orElseThrow(() -> new NotFoundException("Voucher not found"));

        if (!voucher.getValidUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Voucher has expired");
        }

        Long userId = userService.findUserByUsername(username).getId();

        LocalDateTime assignedAt = LocalDateTime.now();
        VoucherCode voucherCode = voucherCodeDao.findAndAssign(voucherId, userId, assignedAt)
                .orElseThrow(() -> new BusinessRuleException("No codes available"));

        boolean deducted = userService.deductPointsFromUser(userId, voucher.getPoints());
        if (!deducted) {
            throw new BusinessRuleException("Insufficient points");
        }

        return UserVoucherDto.builder()
                .code(voucherCode.getCode())
                .voucherId(voucherId)
                .displayName(voucher.getDisplayName())
                .pointsDeducted(voucher.getPoints())
                .assignedAt(assignedAt)
                .build();
    }
}