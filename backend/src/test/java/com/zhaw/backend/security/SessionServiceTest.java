package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dao.AuthSessionDao;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.AuthSession;
import com.zhaw.backend.model.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DisplayName("DbSessionService - Unit Tests")
class SessionServiceTest {

    private AuthSessionDao authSessionDao;
    private UserDao userDao;
    private DbSessionService service;

    @BeforeEach
    void setUp() {
        authSessionDao = mock(AuthSessionDao.class);
        userDao = mock(UserDao.class);
        service = new DbSessionService(authSessionDao, userDao);
    }

    @Test
    @DisplayName("createSession returns raw token and persists its sha256 hash")
    void createSessionStoresHashedToken() {
        String raw = service.createSession(11L);

        assertNotNull(raw);
        assertEquals(64, raw.length(), "raw token must be 32-byte hex");

        ArgumentCaptor<AuthSession> captor = ArgumentCaptor.forClass(AuthSession.class);
        verify(authSessionDao).insert(captor.capture());
        AuthSession stored = captor.getValue();
        assertEquals(TokenHashing.sha256Hex(raw), stored.getTokenHash());
        assertEquals(11L, stored.getUserId());
        assertNotEquals(raw, stored.getTokenHash(), "DB row must store the hash, not the raw token");
    }

    @Test
    @DisplayName("validate returns SessionRecord with current user role for live sessions")
    void validateReturnsRecord() {
        String raw = "deadbeef".repeat(8);
        String hash = TokenHashing.sha256Hex(raw);
        AuthSession session = AuthSession.builder()
                .tokenHash(hash)
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        when(authSessionDao.findByTokenHash(hash)).thenReturn(Optional.of(session));
        User user = User.builder().id(11L).username("alice").role("ROLE_USER").build();
        when(userDao.findById(11L)).thenReturn(Optional.of(user));

        Optional<SessionService.SessionRecord> record = service.validate(raw);

        assertTrue(record.isPresent());
        assertEquals(11L, record.get().userId());
        assertEquals("alice", record.get().username());
        assertEquals(Role.ROLE_USER, record.get().role());
    }

    @Test
    @DisplayName("validate returns empty and deletes the row for expired sessions")
    void validateExpiredDeletes() {
        String raw = "cafebabe".repeat(8);
        String hash = TokenHashing.sha256Hex(raw);
        AuthSession session = AuthSession.builder()
                .tokenHash(hash)
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build();
        when(authSessionDao.findByTokenHash(hash)).thenReturn(Optional.of(session));

        Optional<SessionService.SessionRecord> record = service.validate(raw);

        assertTrue(record.isEmpty());
        verify(authSessionDao).deleteByTokenHash(hash);
    }

    @Test
    @DisplayName("validate returns empty for null/blank/unknown raw token")
    void validateInvalidInputs() {
        assertTrue(service.validate(null).isEmpty());
        assertTrue(service.validate(" ").isEmpty());
        when(authSessionDao.findByTokenHash(anyString())).thenReturn(Optional.empty());
        assertTrue(service.validate("nope").isEmpty());
    }

    @Test
    @DisplayName("invalidate deletes the row matching the hashed cookie token")
    void invalidateDeletes() {
        String raw = "feedface".repeat(8);

        service.invalidate(raw);

        verify(authSessionDao).deleteByTokenHash(TokenHashing.sha256Hex(raw));
    }

    @Test
    @DisplayName("invalidateAllForUser delegates to DAO")
    void invalidateAllForUser() {
        when(authSessionDao.deleteByUserId(11L)).thenReturn(3);

        int removed = service.invalidateAllForUser(11L);

        assertEquals(3, removed);
    }
}
