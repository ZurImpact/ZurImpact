package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private static final long SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h

    private final Map<String, SessionRecord> sessions = new ConcurrentHashMap<>();

    public String createSession(String username, Set<Role> roles) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(SESSION_TTL_SECONDS);
        sessions.put(token, new SessionRecord(username, roles, expiresAt));
        return token;
    }

    public Optional<SessionRecord> validate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        SessionRecord record = sessions.get(token);
        if (record == null) {
            return Optional.empty();
        }
        if (record.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(record);
    }

    public void invalidate(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }

    public record SessionRecord(String username, Set<Role> roles, Instant expiresAt) {}
}
