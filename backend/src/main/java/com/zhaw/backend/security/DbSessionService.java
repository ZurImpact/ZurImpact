package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dao.AuthSessionDao;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.AuthSession;
import com.zhaw.backend.model.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

/**
 * Postgres-backed session service. The cookie carries the raw 32-byte hex
 * token; the DB stores its SHA-256 (also hex-encoded) as the primary key, so
 * a DB read leak alone does not grant valid sessions.
 */
@Service
@RequiredArgsConstructor
public class DbSessionService implements SessionService {

    private static final long SESSION_TTL_SECONDS = 8 * 3600L;

    private final AuthSessionDao authSessionDao;
    private final UserDao userDao;

    @Override
    @Transactional
    public String createSession(Long userId, Role role) {
        String rawToken = TokenHashing.randomHexToken();
        String tokenHash = TokenHashing.sha256Hex(rawToken);
        LocalDateTime now = LocalDateTime.now();
        AuthSession session = AuthSession.builder()
                .tokenHash(tokenHash)
                .userId(userId)
                .createdAt(now)
                .expiresAt(now.plusSeconds(SESSION_TTL_SECONDS))
                .build();
        authSessionDao.insert(session);
        return rawToken;
    }

    @Override
    @Transactional
    public Optional<SessionRecord> validate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        String tokenHash = TokenHashing.sha256Hex(rawToken);

        Optional<AuthSession> sessionOpt = authSessionDao.findByTokenHash(tokenHash);
        if (sessionOpt.isEmpty()) {
            return Optional.empty();
        }
        AuthSession session = sessionOpt.get();

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            authSessionDao.deleteByTokenHash(tokenHash);
            return Optional.empty();
        }

        Optional<User> userOpt = userDao.findById(session.getUserId());
        if (userOpt.isEmpty()) {
            authSessionDao.deleteByTokenHash(tokenHash);
            return Optional.empty();
        }
        User user = userOpt.get();

        Role role = user.getRole() == null ? null : Role.valueOf(user.getRole());
        return Optional.of(new SessionRecord(
                user.getId(),
                user.getUsername(),
                role,
                session.getExpiresAt().atZone(ZoneId.systemDefault()).toInstant()));
    }

    @Override
    @Transactional
    public void invalidate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        authSessionDao.deleteByTokenHash(TokenHashing.sha256Hex(rawToken));
    }

    @Override
    @Transactional
    public int invalidateAllForUser(Long userId) {
        if (userId == null) {
            return 0;
        }
        return authSessionDao.deleteByUserId(userId);
    }
}
