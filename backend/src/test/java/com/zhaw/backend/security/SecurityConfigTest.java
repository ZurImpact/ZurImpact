package com.zhaw.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    @DisplayName("corsConfigurationSource exposes expected defaults")
    void corsConfigurationSourceHasExpectedDefaults() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/settings");
        request.setRequestURI("/api/settings");

        CorsConfiguration config = source.getCorsConfiguration(request);

        assertNotNull(config);
        assertEquals(java.util.List.of("*"), config.getAllowedOriginPatterns());
        assertNotNull(config.getAllowedMethods());
        assertTrue(config.getAllowedMethods().contains("GET"));
        assertTrue(config.getAllowedMethods().contains("PATCH"));
        assertEquals(java.util.List.of("*"), config.getAllowedHeaders());
        assertEquals(Boolean.TRUE, config.getAllowCredentials());
    }

    @Test
    @DisplayName("passwordEncoder hashes and matches passwords")
    void passwordEncoderHashesAndMatches() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String hash = encoder.encode("secret");

        assertNotNull(hash);
        assertNotEquals("secret", hash);
        assertTrue(encoder.matches("secret", hash));
        assertFalse(encoder.matches("wrong", hash));
    }

    @Test
    @DisplayName("authCookieFilter bean can be created")
    void authCookieFilterBeanCanBeCreated() {
        SessionService sessionService = new SessionService();

        AuthCookieFilter filter = securityConfig.authCookieFilter(sessionService);

        assertNotNull(filter);
    }
}
