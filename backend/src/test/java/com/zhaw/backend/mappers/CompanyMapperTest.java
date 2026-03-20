package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.CompanyDto;
import com.zhaw.backend.model.entities.Company;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CompanyMapperTest {

    @Test
    void toDto_null_returnsNull() {
        assertNull(CompanyMapper.toDto(null));
    }

    @Test
    void toEntity_null_returnsNull() {
        assertNull(CompanyMapper.toEntity(null));
    }

    @Test
    void toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.of(2026, 3, 11, 10, 0);
        Company entity = Company.builder()
                .id(1L)
                .name("ACME")
                .email("info@acme.test")
                .phoneNumber("+41 79 000 00 00")
                .description("desc")
                .address(99L)
                .createdOn(now)
                .build();

        CompanyDto dto = CompanyMapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getName(), dto.getName());
        assertEquals(entity.getEmail(), dto.getEmail());
        assertEquals(entity.getPhoneNumber(), dto.getPhoneNumber());
        assertEquals(entity.getDescription(), dto.getDescription());
        assertEquals(entity.getAddress(), dto.getAddress());
        assertEquals(entity.getCreatedOn(), dto.getCreatedOn());
    }

    @Test
    void toEntity_mapsAllFields() {
        LocalDateTime now = LocalDateTime.of(2026, 3, 11, 10, 0);
        CompanyDto dto = CompanyDto.builder()
                .id(2L)
                .name("Foo")
                .email("foo@test")
                .phoneNumber("123")
                .description("bar")
                .address(5L)
                .createdOn(now)
                .build();

        Company entity = CompanyMapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getName(), entity.getName());
        assertEquals(dto.getEmail(), entity.getEmail());
        assertEquals(dto.getPhoneNumber(), entity.getPhoneNumber());
        assertEquals(dto.getDescription(), entity.getDescription());
        assertEquals(dto.getAddress(), entity.getAddress());
        assertEquals(dto.getCreatedOn(), entity.getCreatedOn());
    }

    @Test
    void toDtoList_filtersNulls_andMaps() {
        Company a = Company.builder().id(1L).name("A").email("a").phoneNumber("1").description("d").address(1L).build();
        List<CompanyDto> dtos = CompanyMapper.toDtoList(Arrays.asList(a, null));

        assertEquals(1, dtos.size());
        assertEquals(1L, dtos.get(0).getId());
    }

    @Test
    void toEntityList_filtersNulls_andMaps() {
        CompanyDto a = CompanyDto.builder().id(1L).name("A").email("a").phoneNumber("1").description("d").address(1L).build();
        List<Company> entities = CompanyMapper.toEntityList(Arrays.asList(a, null));

        assertEquals(1, entities.size());
        assertEquals(1L, entities.get(0).getId());
    }
}

