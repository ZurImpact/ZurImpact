package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;

import java.time.Instant;
import java.util.Optional;

/**
 * Session management contract. Implementations persist sessions in a backing
 * store, generate opaque tokens on createSession, and validate raw tokens
 * by comparing their hash against the store.
 */
public interface SessionService {

    /**
     * Creates a session for the given user and returns the raw opaque token
     * that should be set as the AUTH_SESSION cookie value.
     */
    String createSession(Long userId, Role role);

    /**
     * Validates a raw cookie token. Returns the session record on hit,
     * or empty on miss / expired / invalid input.
     */
    Optional<SessionRecord> validate(String rawToken);

    /**
     * Invalidates a single session identified by its raw cookie token.
     */
    void invalidate(String rawToken);

    /**
     * Removes every session for the given user. Used on password reset
     * confirmation and password change.
     *
     * @return number of sessions removed
     */
    int invalidateAllForUser(Long userId);

    record SessionRecord(Long userId, String username, Role role, Instant expiresAt) {}
}
