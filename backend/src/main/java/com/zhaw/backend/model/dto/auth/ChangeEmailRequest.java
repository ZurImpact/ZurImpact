package com.zhaw.backend.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(@NotBlank @Email String newEmail) {
}
