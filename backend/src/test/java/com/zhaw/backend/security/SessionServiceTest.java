package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class SessionServiceTest {

    @Test
    @DisplayName("createSession + validate returns session record")
    void createSessionAndValidateReturnsRecord() {
        SessionService sessionService = new SessionService();

        String token = sessionService.createSession("alice", Set.of(Role.ROLE_USER));
        Optional<SessionService.SessionRecord> result = sessionService.validate(token);

        assertTrue(result.isPresent());
        assertEquals("alice", result.get().username());
        assertTrue(result.get().roles().contains(Role.ROLE_USER));
    }

    @Test
    @DisplayName("validate returns empty for null blank and unknown token")
    void validateReturnsEmptyForInvalidTokenInputs() {
        SessionService sessionService = new SessionService();

        assertTrue(sessionService.validate(null).isEmpty());
        assertTrue(sessionService.validate(" ").isEmpty());
        assertTrue(sessionService.validate("unknown-token").isEmpty());
    }

    @Test
    @DisplayName("invalidate removes active session")
    void invalidateRemovesSession() {
        SessionService sessionService = new SessionService();
        String token = sessionService.createSession("bob", Set.of(Role.ROLE_ADMIN));

        sessionService.invalidate(token);

        assertTrue(sessionService.validate(token).isEmpty());
    }

    @Test
    @DisplayName("validate removes expired session")
    @SuppressWarnings("unchecked")
    void validateRemovesExpiredSession() throws Exception {
        SessionService sessionService = new SessionService();

        Field sessionsField = SessionService.class.getDeclaredField("sessions");
        sessionsField.setAccessible(true);
        Map<String, SessionService.SessionRecord> sessions =
                (Map<String, SessionService.SessionRecord>) sessionsField.get(sessionService);

        String expiredToken = "expired-token";
        sessions.put(expiredToken, new SessionService.SessionRecord(
                "carol",
                Set.of(Role.ROLE_USER),
                Instant.now().minusSeconds(60)));

        Optional<SessionService.SessionRecord> result = sessionService.validate(expiredToken);

        assertTrue(result.isEmpty());
        assertFalse(sessions.containsKey(expiredToken));
    }
}

