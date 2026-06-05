package com.zhaw.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@DisplayName("CurrentUserResolver - Unit Tests")
class CurrentUserResolverTest {

    private final CurrentUserResolver resolver = new CurrentUserResolver();

    @Test
    @DisplayName("returns null when authentication is null")
    void nullAuthReturnsNull() {
        assertNull(resolver.userIdOf(null));
    }

    @Test
    @DisplayName("returns userId when principal is AuthenticatedUser")
    void authenticatedUserPrincipalReturnsId() {
        AuthenticatedUser principal = new AuthenticatedUser(42L, "alice");
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, Set.of());

        assertEquals(42L, resolver.userIdOf(auth));
    }

    @Test
    @DisplayName("returns null when principal is not AuthenticatedUser")
    void nonAuthenticatedUserPrincipalReturnsNull() {
        Authentication auth = new UsernamePasswordAuthenticationToken("plain-string", null, Set.of());

        assertNull(resolver.userIdOf(auth));
    }
}
