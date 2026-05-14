package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.entities.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenService {
    String issue(Long userId);

    Optional<PasswordResetToken> lookupValid(String rawToken);

    void markConsumed(String rawToken);

    void invalidateAllForUser(Long userId);
}
