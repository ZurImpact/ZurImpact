package com.zhaw.backend.security;

import java.security.Principal;

/**
 * Authentication principal carrying the authenticated user's id alongside the
 * username, so controllers can authorize ownership without re-querying the
 * database on every request.
 */
public record AuthenticatedUser(Long userId, String username) implements Principal {

    @Override
    public String getName() {
        return username;
    }
}
