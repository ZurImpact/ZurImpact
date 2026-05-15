package com.zhaw.backend.security;

import com.zhaw.backend.service.session.SessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    private SecurityConfig newConfig(String origins) {
        SecurityConfig cfg = new SecurityConfig();
        ReflectionTestUtils.setField(cfg, "allowedOriginsCsv", origins);
        return cfg;
    }

    @Test
    @DisplayName("CORS exposes the configured allowed origins, not a wildcard")
    void corsConfigurationSourceUsesConfiguredOrigins() {
        CorsConfigurationSource source = newConfig("https://app.example.com,https://admin.example.com")
                .corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/whoami");
        request.setRequestURI("/api/auth/whoami");

        CorsConfiguration config = source.getCorsConfiguration(request);

        assertNotNull(config);
        assertNull(config.getAllowedOriginPatterns(), "should not use wildcard origin patterns");
        assertEquals(java.util.List.of("https://app.example.com", "https://admin.example.com"),
                config.getAllowedOrigins());
        assertNotNull(config.getAllowedMethods());
        assertTrue(config.getAllowedMethods().contains("GET"));
        assertTrue(config.getAllowedMethods().contains("PATCH"));
        assertTrue(config.getAllowedHeaders().contains("Content-Type"));
        assertEquals(Boolean.TRUE, config.getAllowCredentials());
    }

    @Test
    @DisplayName("passwordEncoder hashes and matches passwords with strength 12")
    void passwordEncoderHashesAndMatches() {
        PasswordEncoder encoder = newConfig("http://localhost:5173").passwordEncoder();

        String hash = encoder.encode("secret");

        assertNotNull(hash);
        assertNotEquals("secret", hash);
        assertTrue(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$") || hash.startsWith("$2y$12$"),
                "expected BCrypt cost 12");
        assertTrue(encoder.matches("secret", hash));
        assertFalse(encoder.matches("wrong", hash));
    }

    @Test
    @DisplayName("authCookieFilter bean wraps an injected SessionService")
    void authCookieFilterBeanCanBeCreated() {
        SessionService sessionService = mock(SessionService.class);

        AuthCookieFilter filter = newConfig("http://localhost:5173").authCookieFilter(sessionService);

        assertNotNull(filter);
    }
}
