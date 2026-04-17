package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.VoucherDto;
import com.zhaw.backend.model.entities.Voucher;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VoucherMapperTest {

    @Test
    void toDto_null_returnsNull() {
        assertNull(VoucherMapper.toDto(null));
    }

    @Test
    void toEntity_null_returnsNull() {
        assertNull(VoucherMapper.toEntity(null));
    }

    @Test
    void toDto_mapsAllFields() {
        LocalDateTime created = LocalDateTime.of(2026, 3, 11, 10, 0);
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 23, 59);

        Voucher entity = Voucher.builder()
                .id(10L)
                .description("desc")
                .displayName("display")
                .points(123)
                .companyId(7L)
                .validUntil(validUntil)
                .createdOn(created)
                .build();

        VoucherDto dto = VoucherMapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getDescription(), dto.getDescription());
        assertEquals(entity.getDisplayName(), dto.getDisplayName());
        assertEquals(entity.getPoints(), dto.getPoints());
        assertEquals(entity.getCompanyId(), dto.getCompanyId());
        assertEquals(entity.getValidUntil(), dto.getValidUntil());
        assertEquals(entity.getCreatedOn(), dto.getCreatedOn());
    }

    @Test
    void toEntity_mapsAllFields() {
        LocalDateTime created = LocalDateTime.of(2026, 3, 11, 10, 0);
        LocalDateTime validUntil = LocalDateTime.of(2026, 12, 31, 23, 59);

        VoucherDto dto = VoucherDto.builder()
                .id(11L)
                .description("desc")
                .displayName("display")
                .points(10)
                .companyId(1L)
                .validUntil(validUntil)
                .createdOn(created)
                .build();

        Voucher entity = VoucherMapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getDescription(), entity.getDescription());
        assertEquals(dto.getDisplayName(), entity.getDisplayName());
        assertEquals(dto.getPoints(), entity.getPoints());
        assertEquals(dto.getCompanyId(), entity.getCompanyId());
        assertEquals(dto.getValidUntil(), entity.getValidUntil());
        assertEquals(dto.getCreatedOn(), entity.getCreatedOn());
    }

    @Test
    void toDtoList_filtersNulls_andMaps() {
        Voucher a = Voucher.builder().id(1L).description("d").displayName("n").points(1).companyId(1L).validUntil(LocalDateTime.now()).build();
        List<VoucherDto> dtos = VoucherMapper.toDtoList(Arrays.asList(a, null));

        assertEquals(1, dtos.size());
        assertEquals(1L, dtos.get(0).getId());
    }

    @Test
    void toEntityList_filtersNulls_andMaps() {
        VoucherDto a = VoucherDto.builder().id(1L).description("d").displayName("n").points(1).companyId(1L).validUntil(LocalDateTime.now()).build();
        List<Voucher> entities = VoucherMapper.toEntityList(Arrays.asList(a, null));

        assertEquals(1, entities.size());
        assertEquals(1L, entities.get(0).getId());
    }

    @Test
    void toDtoList_nullOrEmpty_returnsEmptyList() {
        assertTrue(VoucherMapper.toDtoList(null).isEmpty());
        assertTrue(VoucherMapper.toDtoList(List.of()).isEmpty());
    }

    @Test
    void toEntityList_nullOrEmpty_returnsEmptyList() {
        assertTrue(VoucherMapper.toEntityList(null).isEmpty());
        assertTrue(VoucherMapper.toEntityList(List.of()).isEmpty());
    }
}
