package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class VoucherMapper {

    private VoucherMapper() {
        // utility class
    }

    public static VoucherDto toDto(Voucher entity) {
        if (entity == null) {
            return null;
        }

        return VoucherDto.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .displayName(entity.getDisplayName())
                .points(entity.getPoints())
                .validUntil(entity.getValidUntil())
                .createdOn(entity.getCreatedOn())
                .companyId(entity.getCompanyId())
                .build();
    }

    /**
     * Creates a Voucher entity from a DTO.
     * Erwartung: dto.companyDto.id ist gesetzt (company_id ist NOT NULL).
     */
    public static Voucher toEntity(VoucherDto dto) {
        if (dto == null) {
            return null;
        }

        return Voucher.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .displayName(dto.getDisplayName())
                .points(dto.getPoints())
                .validUntil(dto.getValidUntil())
                .createdOn(dto.getCreatedOn())
                .companyId(dto.getCompanyId())
                .build();
    }

    public static List<VoucherDto> toDtoList(List<Voucher> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(VoucherMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Voucher> toEntityList(List<VoucherDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(VoucherMapper::toEntity)
                .collect(Collectors.toList());
    }
}
