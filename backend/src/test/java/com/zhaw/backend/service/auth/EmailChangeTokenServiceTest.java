package com.zhaw.backend.service.auth;

import com.zhaw.backend.model.dao.EmailChangeTokenDao;
import com.zhaw.backend.model.entities.EmailChangeToken;
import com.zhaw.backend.security.TokenHashing;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailChangeTokenService - Unit Tests")
class EmailChangeTokenServiceTest {

    @Mock
    private EmailChangeTokenDao dao;

    @InjectMocks
    private EmailChangeTokenService emailChangeTokenService;
    private MockedStatic<TokenHashing> mockedTokenHashing;

    @BeforeEach
    void setUp() {
        mockedTokenHashing = mockStatic(TokenHashing.class);
    }

    @AfterEach
    void tearDown() {
        mockedTokenHashing.close();
    }

    @Nested
    @DisplayName("issue")
    class IssueToken {
        @Test
        @DisplayName("should issue a new token successfully")
        void issue_success() {
            Long userId = 1L;
            String newEmail = "new@example.com";
            String rawToken = "raw-token";
            String hashedToken = "hashed-token";

            mockedTokenHashing.when(TokenHashing::randomHexToken).thenReturn(rawToken);
            mockedTokenHashing.when(() -> TokenHashing.sha256Hex(rawToken)).thenReturn(hashedToken);

            ArgumentCaptor<EmailChangeToken> tokenCaptor = ArgumentCaptor.forClass(EmailChangeToken.class);

            String result = emailChangeTokenService.issue(userId, newEmail);

            assertEquals(rawToken, result);
            verify(dao).insert(tokenCaptor.capture());
            EmailChangeToken capturedToken = tokenCaptor.getValue();

            assertEquals(hashedToken, capturedToken.getTokenHash());
            assertEquals(userId, capturedToken.getUserId());
            assertEquals(newEmail, capturedToken.getNewEmail());
            assertNotNull(capturedToken.getCreatedAt());
            assertNotNull(capturedToken.getExpiresAt());
            assertTrue(capturedToken.getExpiresAt().isAfter(capturedToken.getCreatedAt()));
        }
    }

    @Nested
    @DisplayName("lookupValid")
    class LookupValid {

        private final String rawToken = "raw-token";
        private final String hashedToken = "hashed-token";

        @BeforeEach
        void setup() {
            mockedTokenHashing.when(() -> TokenHashing.sha256Hex(rawToken)).thenReturn(hashedToken);
        }

        @Test
        @DisplayName("should return empty for null token")
        void lookup_nullToken_returnsEmpty() {
            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid(null);

            assertTrue(result.isEmpty());
            verify(dao, never()).findByTokenHash(anyString());
        }

        @Test
        @DisplayName("should return empty for blank token")
        void lookup_blankToken_returnsEmpty() {
            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid("  ");

            assertTrue(result.isEmpty());
            verify(dao, never()).findByTokenHash(anyString());
        }

        @Test
        @DisplayName("should return empty if token not found")
        void lookup_notFound_returnsEmpty() {
            when(dao.findByTokenHash(hashedToken)).thenReturn(Optional.empty());

            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid(rawToken);

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("should return empty if token is consumed")
        void lookup_consumedToken_returnsEmpty() {
            EmailChangeToken token = EmailChangeToken.builder()
                    .consumedAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build();
            when(dao.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));

            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid(rawToken);

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("should return empty if token is expired")
        void lookup_expiredToken_returnsEmpty() {
            EmailChangeToken token = EmailChangeToken.builder()
                    .consumedAt(null)
                    .expiresAt(LocalDateTime.now().minusSeconds(1))
                    .build();
            when(dao.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));

            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid(rawToken);

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("should return token if it is valid")
        void lookup_validToken_returnsToken() {
            EmailChangeToken token = EmailChangeToken.builder()
                    .consumedAt(null)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build();
            when(dao.findByTokenHash(hashedToken)).thenReturn(Optional.of(token));

            Optional<EmailChangeToken> result = emailChangeTokenService.lookupValid(rawToken);

            assertTrue(result.isPresent());
            assertEquals(token, result.get());
        }
    }

    @Nested
    @DisplayName("markConsumed")
    class MarkConsumed {

        @Test
        @DisplayName("should do nothing for null token")
        void markConsumed_nullToken_doesNothing() {
            emailChangeTokenService.markConsumed(null);

            verify(dao, never()).markConsumed(anyString(), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("should do nothing for blank token")
        void markConsumed_blankToken_doesNothing() {
            emailChangeTokenService.markConsumed("  ");

            verify(dao, never()).markConsumed(anyString(), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("should call dao to mark token as consumed")
        void markConsumed_validToken_callsDao() {
            String rawToken = "raw-token";
            String hashedToken = "hashed-token";
            mockedTokenHashing.when(() -> TokenHashing.sha256Hex(rawToken)).thenReturn(hashedToken);

            emailChangeTokenService.markConsumed(rawToken);

            verify(dao).markConsumed(eq(hashedToken), any(LocalDateTime.class));
        }
    }

    @Nested
    @DisplayName("invalidateAllForUser")
    class InvalidateAllForUser {

        @Test
        @DisplayName("should call dao to delete tokens for user")
        void invalidateAll_callsDao() {

            Long userId = 1L;

            emailChangeTokenService.invalidateAllForUser(userId);

            verify(dao).deleteByUserId(userId);
        }
    }

    @Nested
    @DisplayName("hasPendingEmailToken")
    class HasPendingEmailToken {

        @Test
        @DisplayName("should return true when dao returns true")
        void hasPending_true() {

            Long userId = 1L;
            when(dao.hasValidPendingToken(userId)).thenReturn(true);

            boolean result = emailChangeTokenService.hasPendingEmailToken(userId);

            assertTrue(result);
        }

        @Test
        @DisplayName("should return false when dao returns false")
        void hasPending_false() {
            Long userId = 1L;
            when(dao.hasValidPendingToken(userId)).thenReturn(false);

            boolean result = emailChangeTokenService.hasPendingEmailToken(userId);

            assertFalse(result);
        }
    }
}
