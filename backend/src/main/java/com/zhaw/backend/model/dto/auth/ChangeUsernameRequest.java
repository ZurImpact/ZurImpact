package com.zhaw.backend.model.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeUsernameRequest(
        @NotBlank @Size(min = 3, max = 50) String newUsername
) {
}