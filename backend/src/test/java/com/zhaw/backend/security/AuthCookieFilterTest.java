package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.service.session.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthCookieFilter - Unit Tests")
class AuthCookieFilterTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("doFilterInternal")
    class DoFilterInternal {

        @Test
        @DisplayName("populates AuthenticatedUser principal from a valid session")
        void setsAuthenticationWhenCookieValid() throws Exception {
            AuthCookieFilter filter = new AuthCookieFilter(sessionService);
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("AUTH_SESSION", "token-1")});
            SessionService.SessionRecord sessionRecord = new SessionService.SessionRecord(
                    7L,
                    "alice",
                    Role.ROLE_USER,
                    java.time.Instant.now().plusSeconds(60));
            when(sessionService.validate("token-1")).thenReturn(Optional.of(sessionRecord));

            filter.doFilterInternal(request, response, filterChain);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(authentication);
            assertEquals("alice", authentication.getName());
            assertEquals(1, authentication.getAuthorities().size());
            Object principal = authentication.getPrincipal();
            assertSame(AuthenticatedUser.class, principal.getClass());
            assertEquals(7L, ((AuthenticatedUser) principal).userId());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("does not set authentication when cookie is missing")
        void doesNotSetAuthenticationWhenCookieMissing() throws Exception {
            AuthCookieFilter filter = new AuthCookieFilter(sessionService);
            when(request.getCookies()).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(sessionService, never()).validate("token-1");
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("does not set authentication when session is invalid")
        void doesNotSetAuthenticationWhenSessionInvalid() throws Exception {
            AuthCookieFilter filter = new AuthCookieFilter(sessionService);
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("AUTH_SESSION", "token-2")});
            when(sessionService.validate("token-2")).thenReturn(Optional.empty());

            filter.doFilterInternal(request, response, filterChain);

            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(sessionService).validate("token-2");
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("does not revalidate token when authentication already exists")
        void doesNotRevalidateWhenAlreadyAuthenticated() throws Exception {
            AuthCookieFilter filter = new AuthCookieFilter(sessionService);
            SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                    "existing",
                    null,
                    Set.of()));
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("AUTH_SESSION", "token-3")});

            filter.doFilterInternal(request, response, filterChain);

            verify(sessionService, never()).validate("token-3");
            verify(filterChain).doFilter(request, response);
        }
    }
}
