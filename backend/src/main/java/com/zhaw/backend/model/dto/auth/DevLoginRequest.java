package com.zhaw.backend.model.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record DevLoginRequest(
        @NotBlank String username
) {
}
