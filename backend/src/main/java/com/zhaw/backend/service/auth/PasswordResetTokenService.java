package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.entities.PasswordResetToken;
import jakarta.transaction.Transactional;

import java.util.Optional;

public interface PasswordResetTokenService {
    public String issue(Long userId);

    public Optional<PasswordResetToken> lookupValid(String rawToken);

    public void markConsumed(String rawToken);

    public void invalidateAllForUser(Long userId);
}
