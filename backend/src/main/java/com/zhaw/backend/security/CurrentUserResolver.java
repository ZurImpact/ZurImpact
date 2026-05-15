package com.zhaw.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Convenience helpers for reading the authenticated principal out of the
 * security context.
 */
@Component
public class CurrentUserResolver {

    public Long userIdOf(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser au) {
            return au.userId();
        }
        return null;
    }
}
