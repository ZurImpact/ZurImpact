package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.CompanyDto;
import com.zhaw.backend.model.entities.Company;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class CompanyMapper {

    private CompanyMapper() {
        // utility class
    }

    public static CompanyDto toDto(Company entity) {
        if (entity == null) {
            return null;
        }

        return CompanyDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .createdOn(entity.getCreatedOn())
                .build();
    }

    /**
     * Mapping DTO -> Entity.
     * Hinweis: Company.address ist aktuell nur eine Long FK (keine Relation).
     */
    public static Company toEntity(CompanyDto dto) {
        if (dto == null) {
            return null;
        }

        return Company.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .description(dto.getDescription())
                .address(dto.getAddress())
                .createdOn(dto.getCreatedOn())
                .build();
    }

    public static List<CompanyDto> toDtoList(List<Company> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(CompanyMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<Company> toEntityList(List<CompanyDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(CompanyMapper::toEntity)
                .collect(Collectors.toList());
    }
}
