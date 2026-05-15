package com.zhaw.backend.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Single-field request body used by /resend-verification and
 * /password-reset/request — both accept only an email.
 */
public record EmailRequest(
        @NotBlank @Email String email
) {}
