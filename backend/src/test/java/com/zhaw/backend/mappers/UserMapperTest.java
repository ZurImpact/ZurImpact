package com.zhaw.backend.mappers;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.entities.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    @Test
    void toDto_null_returnsNull() {
        assertNull(UserMapper.toDto(null));
    }

    @Test
    void toDto_mapsAllFields() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 4, 22, 14, 30);

        User entity = new User();
        entity.setId(1L);
        entity.setUsername("alice");
        entity.setEmail("alice@example.com");
        entity.setPasswordHash("hash");
        entity.setAddress(11L);
        entity.setCreatedAt(createdAt);
        entity.setPoints(99);
        entity.setRole("ROLE_ADMIN");

        UserDto dto = UserMapper.toDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getUsername(), dto.getUsername());
        assertEquals(entity.getEmail(), dto.getEmail());
        assertEquals(entity.getPasswordHash(), dto.getPasswordHash());
        assertEquals(entity.getAddress(), dto.getAddress());
        assertEquals(createdAt.toString(), dto.getCreatedAt());
        assertEquals(entity.getPoints(), dto.getPoints());
        assertEquals(Role.ROLE_ADMIN, dto.getRole());
    }

    @Test
    void toDto_withNullCreatedAtAndRole_mapsNulls() {
        User entity = new User();
        entity.setId(2L);
        entity.setUsername("bob");
        entity.setEmail("bob@example.com");
        entity.setPasswordHash("hash2");
        entity.setAddress(22L);
        entity.setPoints(10);

        UserDto dto = UserMapper.toDto(entity);

        assertNotNull(dto);
        assertNull(dto.getCreatedAt());
        assertNull(dto.getRole());
    }

    @Test
    void toResponseDto_null_returnsNull() {
        assertNull(UserMapper.toResponseDto(null));
    }

    @Test
    void toResponseDto_mapsFieldsExcludingPassword() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 4, 22, 14, 30);

        User entity = new User();
        entity.setId(1L);
        entity.setUsername("alice");
        entity.setEmail("alice@example.com");
        entity.setPasswordHash("secret");
        entity.setAddress(11L);
        entity.setCreatedAt(createdAt);
        entity.setPoints(99);
        entity.setRole("ROLE_ADMIN");

        UserResponseDto dto = UserMapper.toResponseDto(entity);

        assertNotNull(dto);
        assertEquals(entity.getId(), dto.getId());
        assertEquals(entity.getUsername(), dto.getUsername());
        assertEquals(entity.getEmail(), dto.getEmail());
        assertEquals(entity.getAddress(), dto.getAddress());
        assertEquals(createdAt.toString(), dto.getCreatedAt());
        assertEquals(entity.getPoints(), dto.getPoints());
        assertEquals(Role.ROLE_ADMIN, dto.getRole());
    }
}

