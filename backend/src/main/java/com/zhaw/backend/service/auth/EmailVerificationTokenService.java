package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.dao.EmailVerificationTokenDao;
import com.zhaw.backend.model.entities.EmailVerificationToken;
import com.zhaw.backend.security.TokenHashing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Creates and consumes single-use email-verification tokens.
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationTokenService {

    private static final long TTL_SECONDS = 24 * 3600L;

    private final EmailVerificationTokenDao dao;

    /**
     * Creates a token for the user and returns the raw token (to embed in the email).
     */
    @Transactional
    public String issue(Long userId) {
        String raw = TokenHashing.randomHexToken();
        LocalDateTime now = LocalDateTime.now();
        EmailVerificationToken row = EmailVerificationToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(userId)
                .createdAt(now)
                .expiresAt(now.plusSeconds(TTL_SECONDS))
                .build();
        dao.insert(row);
        return raw;
    }

    /**
     * Looks up a raw token; returns the token row if it is unconsumed and unexpired.
     * Caller is responsible for marking it consumed via {@link #markConsumed(String)}.
     */
    public Optional<EmailVerificationToken> lookupValid(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        Optional<EmailVerificationToken> opt = dao.findByTokenHash(TokenHashing.sha256Hex(rawToken));
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        EmailVerificationToken token = opt.get();
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
