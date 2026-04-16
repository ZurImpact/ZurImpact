package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {

    private final AuthService authService = new AuthService(new BCryptPasswordEncoder());

    @Test
    @DisplayName("authenticate returns admin user with expected roles")
    void authenticateAdminSuccess() {
        AuthService.AuthResult result = authService.authenticate("admin", "secret");

        assertEquals("admin", result.username());
        assertEquals(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER), result.roles());
        assertNotNull(result.sessionToken());
        assertFalse(result.sessionToken().isBlank());
    }

    @Test
    @DisplayName("authenticate returns user role for user account")
    void authenticateUserSuccess() {
        AuthService.AuthResult result = authService.authenticate("user", "secret");

        assertEquals("user", result.username());
        assertEquals(Set.of(Role.ROLE_USER), result.roles());
    }

    @Test
    @DisplayName("authenticate returns partner role for partner account")
    void authenticatePartnerSuccess() {
        AuthService.AuthResult result = authService.authenticate("partner", "secret");

        assertEquals("partner", result.username());
        assertEquals(Set.of(Role.ROLE_PARTNER), result.roles());
    }

    @Test
    @DisplayName("authenticate throws for wrong password")
    void authenticateWrongPasswordThrows() {
        assertThrows(BadCredentialsException.class, () -> authService.authenticate("admin", "wrong"));
    }

    @Test
    @DisplayName("authenticate throws for unknown username")
    void authenticateUnknownUserThrows() {
        assertThrows(BadCredentialsException.class, () -> authService.authenticate("ghost", "secret"));
    }

    @Test
    @DisplayName("authenticate generates a new token per successful call")
    void authenticateGeneratesNewTokenEachTime() {
        AuthService.AuthResult first = authService.authenticate("admin", "secret");
        AuthService.AuthResult second = authService.authenticate("admin", "secret");

        assertNotEquals(first.sessionToken(), second.sessionToken());
    }
}

