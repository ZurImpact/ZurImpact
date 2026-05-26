package com.zhaw.backend.service.auth;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.EmailChangeToken;
import com.zhaw.backend.model.entities.EmailVerificationToken;
import com.zhaw.backend.model.entities.PasswordResetToken;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.mail.MailService;
import com.zhaw.backend.service.session.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private UserDao userDao;
    private SessionService sessionService;
    private EmailVerificationTokenService verificationTokenService;
    private PasswordResetTokenService resetTokenService;
    private MailService mailService;
    private AuthService authService;
    private EmailChangeTokenService emailChangeTokenService;

    @BeforeEach
    void setUp() {
        userDao = mock(UserDao.class);
        sessionService = mock(SessionService.class);
        verificationTokenService = mock(EmailVerificationTokenService.class);
        resetTokenService = mock(PasswordResetTokenService.class);
        mailService = mock(MailService.class);
        emailChangeTokenService = mock(EmailChangeTokenService.class);
        authService = new AuthServiceImpl(encoder, userDao, sessionService,
                verificationTokenService, resetTokenService, mailService, emailChangeTokenService);
    }

    private User user(String username, String rawPassword, Role role, boolean verified) {
        return User.builder()
                .id(11L)
                .username(username)
                .email(username + "@example.com")
                .passwordHash(encoder.encode(rawPassword))
                .role(role.name())
                .emailVerified(verified)
                .build();
    }

    @Test
    @DisplayName("authenticate returns AuthResult on valid credentials")
    void authenticateSuccess() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findByUsername("alice")).thenReturn(Optional.of(u));

        AuthService.AuthResult result = authService.authenticate("alice", "secret");

        assertEquals(11L, result.userId());
        assertEquals(Role.ROLE_USER, result.role());
    }

    @Test
    @DisplayName("authenticate throws BadCredentials on unknown username")
    void authenticateUnknownUserThrows() {
        when(userDao.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.authenticate("ghost", "x"));
    }

    @Test
    @DisplayName("authenticate throws BadCredentials on wrong password")
    void authenticateWrongPasswordThrows() {
        User u = user("carol", "secret", Role.ROLE_USER, true);
        when(userDao.findByUsername("carol")).thenReturn(Optional.of(u));

        assertThrows(BadCredentialsException.class, () -> authService.authenticate("carol", "wrong"));
    }

    @Test
    @DisplayName("authenticate throws DisabledException when account email is unverified")
    void authenticateUnverifiedThrows() {
        User u = user("eve", "secret", Role.ROLE_USER, false);
        when(userDao.findByUsername("eve")).thenReturn(Optional.of(u));

        assertThrows(DisabledException.class, () -> authService.authenticate("eve", "secret"));
    }

    @Test
    @DisplayName("register creates user, issues verify token and dispatches mail when free")
    void registerCreatesNewUser() {
        when(userDao.findByUsername("frank")).thenReturn(Optional.empty());
        when(userDao.findByEmail("frank@example.com")).thenReturn(Optional.empty());
        when(userDao.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(11L);
            return u;
        });
        when(verificationTokenService.issue(11L)).thenReturn("raw-verify-token");

        authService.register("frank", "frank@example.com", "secret123");

        verify(verificationTokenService).issue(11L);
        verify(mailService).sendVerificationEmail("frank@example.com", "frank", "raw-verify-token");
    }

    @Test
    @DisplayName("register throws when username already exists")
    void registerDuplicateUsernameThrows() {
        User existing = user("grace", "old", Role.ROLE_USER, false);
        when(userDao.findByUsername("grace")).thenReturn(Optional.of(existing));
        when(userDao.findByEmail("grace@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register("grace", "grace@example.com", "secret123"));

        assertEquals("username_taken", ex.getMessage());
        verify(userDao, never()).save(any());
    }

    @Test
    @DisplayName("register throws when email already exists")
    void registerDuplicateEmailThrows() {
        User existing = user("heidi", "old", Role.ROLE_USER, true);
        when(userDao.findByUsername("newuser")).thenReturn(Optional.empty());
        when(userDao.findByEmail("heidi@example.com")).thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register("newuser", "heidi@example.com", "secret123"));

        assertEquals("email_taken", ex.getMessage());
        verify(userDao, never()).save(any());
    }

    @Test
    @DisplayName("verifyEmail marks user verified and consumes token")
    void verifyEmailSuccess() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        when(verificationTokenService.lookupValid("raw")).thenReturn(Optional.of(token));

        boolean ok = authService.verifyEmail("raw");

        assertTrue(ok);
        verify(userDao).markEmailVerified(11L);
        verify(verificationTokenService).markConsumed("raw");
    }

    @Test
    @DisplayName("verifyEmail returns false for invalid token")
    void verifyEmailInvalidReturnsFalse() {
        when(verificationTokenService.lookupValid("bad")).thenReturn(Optional.empty());

        boolean ok = authService.verifyEmail("bad");

        assertFalse(ok);
        verify(userDao, never()).markEmailVerified(anyLong());
    }

    @Test
    @DisplayName("requestPasswordReset issues token and sends mail for verified user")
    void requestPasswordResetVerified() {
        User u = user("ivan", "secret", Role.ROLE_USER, true);
        when(userDao.findByEmail("ivan@example.com")).thenReturn(Optional.of(u));
        when(resetTokenService.issue(11L)).thenReturn("reset-raw");

        authService.requestPasswordReset("ivan@example.com");

        verify(resetTokenService).invalidateAllForUser(11L);
        verify(resetTokenService).issue(11L);
        verify(mailService).sendPasswordResetEmail("ivan@example.com", "ivan", "reset-raw");
    }

    @Test
    @DisplayName("requestPasswordReset stays silent for unknown email")
    void requestPasswordResetUnknownSilent() {
        when(userDao.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        authService.requestPasswordReset("ghost@example.com");

        verify(resetTokenService, never()).issue(anyLong());
        verify(mailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("confirmPasswordReset rotates hash and revokes all sessions")
    void confirmPasswordResetSuccess() {
        PasswordResetToken token = PasswordResetToken.builder()
                .userId(11L)
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        when(resetTokenService.lookupValid("reset-raw")).thenReturn(Optional.of(token));

        boolean ok = authService.confirmPasswordReset("reset-raw", "newPassword123");

        assertTrue(ok);
        verify(userDao).setPasswordHash(eq(11L), anyString());
        verify(resetTokenService).markConsumed("reset-raw");
        verify(sessionService).invalidateAllForUser(11L);
    }

    @Test
    @DisplayName("changePassword fails on wrong current password")
    void changePasswordWrongCurrent() {
        User u = user("jill", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));

        AuthService.ChangePasswordResult result = authService.changePassword(
                11L, "wrong", "newPassword123");

        assertEquals(AuthService.ChangePasswordResult.WRONG_CURRENT, result);
        verify(userDao, never()).setPasswordHash(anyLong(), anyString());
    }

    @Test
    @DisplayName("changePassword updates hash and revokes all sessions on success")
    void changePasswordSuccess() {
        User u = user("kate", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));

        AuthService.ChangePasswordResult result = authService.changePassword(
                11L, "secret", "newPassword123");

        assertEquals(AuthService.ChangePasswordResult.SUCCESS, result);
        verify(userDao).setPasswordHash(eq(11L), anyString());
        verify(sessionService).invalidateAllForUser(11L);
    }

    @Test
    @DisplayName("requestEmailChange issues token and sends email")
    void requestEmailChangeSuccess() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByEmail("newemail@example.com")).thenReturn(Optional.empty());
        when(emailChangeTokenService.issue(11L, "newemail@example.com")).thenReturn("change-token");

        authService.requestEmailChange(11L, "newemail@example.com");

        verify(emailChangeTokenService).invalidateAllForUser(11L);
        verify(emailChangeTokenService).issue(11L, "newemail@example.com");
        verify(mailService).sendEmailChangeVerificationEmail("newemail@example.com", "alice", "change-token");
    }

    @Test
    @DisplayName("requestEmailChange throws when user not found")
    void requestEmailChangeUserNotFound() {
        when(userDao.findById(11L)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class,
            () -> authService.requestEmailChange(11L, "newemail@example.com"));
    }

    @Test
    @DisplayName("requestEmailChange throws when email already in use")
    void requestEmailChangeEmailInUse() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        User other = user("bob", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByEmail("existing@example.com")).thenReturn(Optional.of(other));

        assertThrows(IllegalArgumentException.class,
            () -> authService.requestEmailChange(11L, "existing@example.com"));
    }

    @Test
    @DisplayName("confirmEmailChange updates email and marks verified")
    void confirmEmailChangeSuccess() {
        EmailChangeToken token = EmailChangeToken.builder()
                .userId(11L)
                .newEmail("updated@example.com")
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        when(emailChangeTokenService.lookupValid("change-token")).thenReturn(Optional.of(token));

        boolean ok = authService.confirmEmailChange("change-token");

        assertTrue(ok);
        verify(userDao).updateEmail(11L, "updated@example.com");
        verify(userDao).markEmailVerified(11L);
        verify(emailChangeTokenService).markConsumed("change-token");
    }

    @Test
    @DisplayName("confirmEmailChange returns false for invalid token")
    void confirmEmailChangeInvalidReturnsFalse() {
        when(emailChangeTokenService.lookupValid("bad")).thenReturn(Optional.empty());

        boolean ok = authService.confirmEmailChange("bad");

        assertFalse(ok);
        verify(userDao, never()).updateEmail(anyLong(), anyString());
    }

    @Test
    @DisplayName("authenticate throws DisabledException when user has no role assigned")
    void authenticateNoRoleThrows() {
        User u = User.builder()
                .id(11L)
                .username("norole")
                .email("norole@example.com")
                .passwordHash(encoder.encode("secret"))
                .role(null)  // No role assigned
                .emailVerified(true)
                .build();
        when(userDao.findByUsername("norole")).thenReturn(Optional.of(u));

        assertThrows(DisabledException.class, () -> authService.authenticate("norole", "secret"));
    }


}
