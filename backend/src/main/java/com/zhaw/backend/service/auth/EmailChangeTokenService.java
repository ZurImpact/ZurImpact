package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.dao.EmailChangeTokenDao;
import com.zhaw.backend.model.entities.EmailChangeToken;
import com.zhaw.backend.security.TokenHashing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailChangeTokenService {

    private static final long TTL_SECONDS = 24 * 3600L;

    private final EmailChangeTokenDao dao;

    @Transactional
    public String issue(Long userId, String newEmail) {
        String raw = TokenHashing.randomHexToken();
        LocalDateTime now = LocalDateTime.now();
        EmailChangeToken row = EmailChangeToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(userId)
                .newEmail(newEmail)
                .createdAt(now)
                .expiresAt(now.plusSeconds(TTL_SECONDS))
                .build();
        dao.insert(row);
        return raw;
    }

    public Optional<EmailChangeToken> lookupValid(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        Optional<EmailChangeToken> opt = dao.findByTokenHash(TokenHashing.sha256Hex(rawToken));
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        EmailChangeToken token = opt.get();
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
