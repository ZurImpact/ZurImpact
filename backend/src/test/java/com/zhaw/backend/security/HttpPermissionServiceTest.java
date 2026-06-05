package com.zhaw.backend.security;

import com.zhaw.backend.model.dao.HttpPermissionDao;
import com.zhaw.backend.model.entities.HttpPermission;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("HttpPermissionService – Unit Tests")
class HttpPermissionServiceTest {

    @Mock
    private HttpPermissionDao httpPermissionDao;

    @InjectMocks
    private HttpPermissionService service;

    private static HttpPermission perm(String path, String method, String roles) {
        return HttpPermission.builder()
                .id(1L)
                .pathPattern(path)
                .httpMethod(method)
                .roles(roles)
                .build();
    }

    private static Authentication authenticated(String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .toList();
        return UsernamePasswordAuthenticationToken.authenticated("user", null, authorities);
    }

    private static Authentication anonymous() {
        return new AnonymousAuthenticationToken("key", "anon",
                List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
    }

    private static MockHttpServletRequest req(String method, String path) {
        MockHttpServletRequest r = new MockHttpServletRequest(method, path);
        r.setServletPath(path);
        return r;
    }

    // ── authorize – default deny ─────────────────────────────────────────

    @Nested
    @DisplayName("authorize – default deny")
    class DefaultDeny {

        @Test
        @DisplayName("denies when no rules match")
        void deniesWhenNoRulesMatch() {
            when(httpPermissionDao.findAll()).thenReturn(List.of());

            AuthorizationDecision decision = service.authorize(authenticated("ROLE_USER"), req("GET", "/api/unknown"));

            assertFalse(decision.isGranted());
        }
    }

    // ── authorize – open endpoints ───────────────────────────────────────

    @Nested
    @DisplayName("authorize – open endpoints (no roles required)")
    class OpenEndpoints {

        @Test
        @DisplayName("grants anonymous access when roles is empty")
        void grantsAnonymousWhenRolesEmpty() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/public/**", "GET", "")));

            assertTrue(service.authorize(null, req("GET", "/api/public/hello")).isGranted());
        }

        @Test
        @DisplayName("grants access when roles is null")
        void grantsWhenRolesNull() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/open", "*", null)));

            assertTrue(service.authorize(null, req("GET", "/api/open")).isGranted());
        }
    }

    // ── authorize – role matching ────────────────────────────────────────

    @Nested
    @DisplayName("authorize – role matching")
    class RoleMatching {

        @Test
        @DisplayName("grants when authenticated user has required role")
        void grantsWhenRoleMatches() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/admin/**", "*", "ADMIN")));

            assertTrue(service.authorize(authenticated("ROLE_ADMIN"), req("GET", "/api/admin/users")).isGranted());
        }

        @Test
        @DisplayName("denies when authenticated user lacks required role")
        void deniesWhenRoleMissing() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/admin/**", "*", "ADMIN")));

            assertFalse(service.authorize(authenticated("ROLE_USER"), req("GET", "/api/admin/users")).isGranted());
        }

        @Test
        @DisplayName("denies anonymous when role is required")
        void deniesAnonymousWhenRoleRequired() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/secure", "*", "USER")));

            assertFalse(service.authorize(anonymous(), req("GET", "/api/secure")).isGranted());
        }

        @Test
        @DisplayName("denies null authentication when role is required")
        void deniesNullAuthWhenRoleRequired() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/secure", "*", "USER")));

            assertFalse(service.authorize(null, req("GET", "/api/secure")).isGranted());
        }

        @Test
        @DisplayName("grants when user has any one of multiple required roles")
        void grantsWhenUserHasOneOfMultipleRoles() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/mixed", "*", "ADMIN, COMPANY")));

            assertTrue(service.authorize(authenticated("ROLE_COMPANY"), req("GET", "/api/mixed")).isGranted());
        }
    }

    // ── authorize – method matching ──────────────────────────────────────

    @Nested
    @DisplayName("authorize – HTTP method matching")
    class MethodMatching {

        @Test
        @DisplayName("matches specific HTTP method")
        void matchesSpecificMethod() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/resource", "POST", "USER")));

            assertTrue(service.authorize(authenticated("ROLE_USER"), req("POST", "/api/resource")).isGranted());
            assertFalse(service.authorize(authenticated("ROLE_USER"), req("GET", "/api/resource")).isGranted());
        }

        @Test
        @DisplayName("wildcard method '*' matches any HTTP method")
        void wildcardMethodMatchesAny() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/any", "*", "")));

            assertTrue(service.authorize(null, req("GET", "/api/any")).isGranted());
            assertTrue(service.authorize(null, req("DELETE", "/api/any")).isGranted());
        }

        @Test
        @DisplayName("blank method matches any HTTP method")
        void blankMethodMatchesAny() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/blank", "  ", "")));

            assertTrue(service.authorize(null, req("PUT", "/api/blank")).isGranted());
        }
    }

    // ── authorize – rule ordering ────────────────────────────────────────

    @Nested
    @DisplayName("authorize – rule ordering (first match wins)")
    class RuleOrdering {

        @Test
        @DisplayName("longer path takes priority over shorter wildcard")
        void longerPathWins() {
            HttpPermission open = perm("/api/public/health", "GET", "");
            HttpPermission restricted = perm("/api/**", "*", "ADMIN");
            when(httpPermissionDao.findAll()).thenReturn(List.of(restricted, open));

            assertTrue(service.authorize(null, req("GET", "/api/public/health")).isGranted());
        }

        @Test
        @DisplayName("method-specific rule takes priority over method-wildcard for same path length")
        void methodSpecificBeforeWildcard() {
            HttpPermission getOpen = perm("/api/items", "GET", "");
            HttpPermission allAdmin = perm("/api/items", "*", "ADMIN");
            when(httpPermissionDao.findAll()).thenReturn(List.of(allAdmin, getOpen));

            assertTrue(service.authorize(null, req("GET", "/api/items")).isGranted());
        }
    }

    // ── role normalization ───────────────────────────────────────────────

    @Nested
    @DisplayName("role normalization")
    class RoleNormalization {

        @Test
        @DisplayName("role without ROLE_ prefix gets prefixed")
        void prefixAddedWhenMissing() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/x", "*", "USER")));

            assertTrue(service.authorize(authenticated("ROLE_USER"), req("GET", "/api/x")).isGranted());
        }

        @Test
        @DisplayName("role already prefixed with ROLE_ is not double-prefixed")
        void noDoublePrefixWhenAlreadyPresent() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/y", "*", "ROLE_USER")));

            assertTrue(service.authorize(authenticated("ROLE_USER"), req("GET", "/api/y")).isGranted());
            assertFalse(service.authorize(authenticated("ROLE_ROLE_USER"), req("GET", "/api/y")).isGranted());
        }

        @Test
        @DisplayName("semicolon-separated roles parsed correctly")
        void semicolonSeparatedRoles() {
            when(httpPermissionDao.findAll()).thenReturn(List.of(perm("/api/z", "*", "ADMIN;USER")));

            assertTrue(service.authorize(authenticated("ROLE_USER"), req("GET", "/api/z")).isGranted());
        }
    }
}
