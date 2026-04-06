package com.zhaw.backend.mappers;

import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() {
        // Prevent instantiation
    }

    public static UserDto toDto(User entity) {
        if (entity == null) {
            return null;
        }

        return UserDto.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .addressId(entity.getAddress())
                .roles(entity.getRoles())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static User toEntity(UserDto dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setAddress(dto.getAddressId());
        user.setRoles(dto.getRoles());
        user.setCreatedAt(dto.getCreatedAt());
        return user;
    }

    public static List<UserDto> toDtoList(List<User> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(UserMapper::toDto)
                .collect(Collectors.toList());
    }

    public static List<User> toEntityList(List<UserDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(UserMapper::toEntity)
                .collect(Collectors.toList());
    }
}
