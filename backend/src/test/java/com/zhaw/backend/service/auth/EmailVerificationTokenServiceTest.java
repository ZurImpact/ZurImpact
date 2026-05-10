package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.dao.EmailVerificationTokenDao;
import com.zhaw.backend.model.entities.EmailVerificationToken;
import com.zhaw.backend.security.TokenHashing;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailVerificationTokenServiceTest {

    private final EmailVerificationTokenDao dao = mock(EmailVerificationTokenDao.class);
    private final EmailVerificationTokenService service = new EmailVerificationTokenService(dao);

    @Test
    @DisplayName("issue stores hashed token and returns the raw value")
    void issueStoresHash() {
        String raw = service.issue(11L);

        assertNotNull(raw);
        assertEquals(64, raw.length());
        verify(dao).insert(argThat(t -> t.getTokenHash().equals(TokenHashing.sha256Hex(raw))
                && t.getUserId().equals(11L)));
    }

    @Test
    @DisplayName("lookupValid returns the row when token is unconsumed and unexpired")
    void lookupValidOk() {
        String raw = "deadbeef".repeat(8);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        when(dao.findByTokenHash(TokenHashing.sha256Hex(raw))).thenReturn(Optional.of(token));

        assertTrue(service.lookupValid(raw).isPresent());
    }

    @Test
    @DisplayName("lookupValid returns empty for consumed token")
    void lookupValidConsumed() {
        String raw = "deadbeef".repeat(8);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .consumedAt(LocalDateTime.now().minusMinutes(1))
                .build();
        when(dao.findByTokenHash(TokenHashing.sha256Hex(raw))).thenReturn(Optional.of(token));

        assertTrue(service.lookupValid(raw).isEmpty());
    }

    @Test
    @DisplayName("lookupValid returns empty for expired token")
    void lookupValidExpired() {
        String raw = "deadbeef".repeat(8);
        EmailVerificationToken token = EmailVerificationToken.builder()
                .tokenHash(TokenHashing.sha256Hex(raw))
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(60))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build();
        when(dao.findByTokenHash(TokenHashing.sha256Hex(raw))).thenReturn(Optional.of(token));

        assertTrue(service.lookupValid(raw).isEmpty());
    }

    @Test
    @DisplayName("lookupValid returns empty for null token")
    void lookupValidNullReturnsEmpty() {
        assertTrue(service.lookupValid(null).isEmpty());
        verifyNoInteractions(dao);
    }

    @Test
    @DisplayName("lookupValid returns empty for blank token")
    void lookupValidBlankReturnsEmpty() {
        assertTrue(service.lookupValid("  ").isEmpty());
        verifyNoInteractions(dao);
    }

    @Test
    @DisplayName("markConsumed delegates to DAO with hashed token")
    void markConsumedDelegates() {
        String raw = "feedface".repeat(8);

        service.markConsumed(raw);

        verify(dao).markConsumed(eq(TokenHashing.sha256Hex(raw)), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("invalidateAllForUser delegates to DAO")
    void invalidateAllForUserDelegates() {
        service.invalidateAllForUser(11L);

        verify(dao).deleteByUserId(11L);
    }
}
