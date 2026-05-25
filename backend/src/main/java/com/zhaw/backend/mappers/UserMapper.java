package com.zhaw.backend.mappers;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.entities.User;

public final class UserMapper {

	private UserMapper() {
		// utility class
	}

	public static UserDto toDto(User entity) {
		if (entity == null) {
			return null;
		}

		return UserDto.builder()
				.id(entity.getId())
				.username(entity.getUsername())
				.email(entity.getEmail())
				.passwordHash(entity.getPasswordHash())
				.address(entity.getAddress())
				.createdAt(entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString())
				.points(entity.getPoints())
				.role(entity.getRole() == null ? null : Role.valueOf(entity.getRole()))
				.emailVerified(entity.getEmailVerified())
				.hasPendingEmailChange(entity.getHasPendingEmailChange())
				.build();
	}

	public static UserResponseDto toResponseDto(User entity) {
		if (entity == null) {
			return null;
		}

		return UserResponseDto.builder()
				.id(entity.getId())
				.username(entity.getUsername())
				.email(entity.getEmail())
				.address(entity.getAddress())
				.createdAt(entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString())
				.points(entity.getPoints())
				.role(entity.getRole() == null ? null : Role.valueOf(entity.getRole()))
				.emailVerified(entity.getEmailVerified())
				.hasPendingEmailChange(entity.getHasPendingEmailChange())
				.build();
	}
}
