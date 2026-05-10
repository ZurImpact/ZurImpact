package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.dao.PasswordResetTokenDao;
import com.zhaw.backend.model.entities.PasswordResetToken;
import com.zhaw.backend.security.TokenHashing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Creates and consumes single-use, short-lived password-reset tokens.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetTokenService {

    private static final long TTL_SECONDS = 30 * 60L;

    private final PasswordResetTokenDao dao;

    @Transactional
    public String issue(Long userId) {
        String raw = TokenHashing.randomHexToken();
        LocalDateTime now = LocalDateTime.now();
        PasswordResetToken row = PasswordResetToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(userId)
                .createdAt(now)
                .expiresAt(now.plusSeconds(TTL_SECONDS))
                .build();
        dao.insert(row);
        return raw;
    }

    public Optional<PasswordResetToken> lookupValid(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        Optional<PasswordResetToken> opt = dao.findByTokenHash(TokenHashing.sha256Hex(rawToken));
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        PasswordResetToken token = opt.get();
        if (token.getConsumedAt() != null) {
            return Optional.empty();
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return Optional.empty();
        }
        return Optional.of(token);
    }

    @Transactional
    public void markConsumed(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        dao.markConsumed(TokenHashing.sha256Hex(rawToken), LocalDateTime.now());
    }

    @Transactional
    public void invalidateAllForUser(Long userId) {
        dao.deleteByUserId(userId);
    }
}
