package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UserService userService = mock(UserService.class);

    private AuthService authService = new AuthService(passwordEncoder, userService);

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        authService = new AuthService(passwordEncoder, userService);
    }

    private UserDto user(String username, String rawPassword, Role role) {
        return UserDto.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
    }

    @Test
    @DisplayName("authenticate returns admin user with expected roles")
    void authenticateAdminSuccess() {
        when(userService.findUserByUsername("admin")).thenReturn(user("admin", "secret", Role.ROLE_ADMIN));

        AuthService.AuthResult result = authService.authenticate("admin", "secret");

        assertEquals("admin", result.username());
        assertEquals(Role.ROLE_ADMIN, result.role());
        assertNotNull(result.sessionToken());
        assertFalse(result.sessionToken().isBlank());
    }

    @Test
    @DisplayName("authenticate returns user role for user account")
    void authenticateUserSuccess() {
        when(userService.findUserByUsername("user")).thenReturn(user("user", "secret", Role.ROLE_USER));

        AuthService.AuthResult result = authService.authenticate("user", "secret");

        assertEquals("user", result.username());
        assertEquals(Role.ROLE_USER, result.role());
    }

    @Test
    @DisplayName("authenticate returns partner role for partner account")
    void authenticatePartnerSuccess() {
        when(userService.findUserByUsername("partner")).thenReturn(user("partner", "secret", Role.ROLE_PARTNER));

        AuthService.AuthResult result = authService.authenticate("partner", "secret");

        assertEquals("partner", result.username());
        assertEquals(Role.ROLE_PARTNER, result.role());
    }

    @Test
    @DisplayName("authenticate throws for wrong password")
    void authenticateWrongPasswordThrows() {
        when(userService.findUserByUsername("admin")).thenReturn(user("admin", "secret", Role.ROLE_ADMIN));

        assertThrows(BadCredentialsException.class, () -> authService.authenticate("admin", "wrong"));
    }

    @Test
    @DisplayName("authenticate throws for unknown username")
    void authenticateUnknownUserThrows() {
        when(userService.findUserByUsername("ghost")).thenReturn(null);

        assertThrows(BadCredentialsException.class, () -> authService.authenticate("ghost", "secret"));
    }

    @Test
    @DisplayName("authenticate generates a new token per successful call")
    void authenticateGeneratesNewTokenEachTime() {
        when(userService.findUserByUsername("admin")).thenReturn(user("admin", "secret", Role.ROLE_ADMIN));

        AuthService.AuthResult first = authService.authenticate("admin", "secret");
        AuthService.AuthResult second = authService.authenticate("admin", "secret");

        assertNotEquals(first.sessionToken(), second.sessionToken());
    }
}

