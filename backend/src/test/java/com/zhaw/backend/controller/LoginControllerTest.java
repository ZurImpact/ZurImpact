package com.zhaw.backend.controller;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.security.AuthService;
import com.zhaw.backend.security.SessionService;
import com.zhaw.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoginController - Unit Tests")
class LoginControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private SessionService sessionService;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private LoginController loginController;

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("returns 200 and sets auth cookie for valid credentials")
        void returns200AndSetsCookieWhenCredentialsValid() {
            LoginController.LoginRequest loginRequest = new LoginController.LoginRequest("admin", "secret");
            AuthService.AuthResult authResult = new AuthService.AuthResult(
                    "admin",
                    Role.ROLE_ADMIN,
                    "ignored-service-token");

            when(authService.authenticate("admin", "secret")).thenReturn(authResult);
            when(sessionService.createSession("admin", authResult.role())).thenReturn("session-123");

            ResponseEntity<?> response = loginController.login(loginRequest);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
            assertNotNull(setCookie);
            assertTrue(setCookie.contains("AUTH_SESSION=session-123"));
            assertTrue(setCookie.contains("HttpOnly"));
            assertTrue(setCookie.contains("Secure"));
        }

        @Test
        @DisplayName("returns 401 for invalid credentials")
        void returns401ForInvalidCredentials() {
            LoginController.LoginRequest loginRequest = new LoginController.LoginRequest("admin", "wrong");
            when(authService.authenticate("admin", "wrong")).thenThrow(new BadCredentialsException("bad"));

            ResponseEntity<?> response = loginController.login(loginRequest);

            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
            @SuppressWarnings("unchecked")
            Map<String, String> body = (Map<String, String>) response.getBody();
            assertNotNull(body);
            assertEquals("Invalid username or password", body.get("message"));
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("invalidates session and returns delete cookie")
        void invalidatesSessionAndReturnsDeleteCookie() {
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("AUTH_SESSION", "session-123")});

            ResponseEntity<?> response = loginController.logout(request);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(sessionService).invalidate("session-123");
            String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
            assertNotNull(setCookie);
            assertTrue(setCookie.contains("AUTH_SESSION="));
            assertTrue(setCookie.contains("Max-Age=0"));
        }

        @Test
        @DisplayName("invalidates null token when auth cookie is missing")
        void invalidatesNullTokenWhenCookieMissing() {
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("OTHER", "value")});

            ResponseEntity<?> response = loginController.logout(request);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(sessionService).invalidate(null);
        }
    }

    @Nested
    @DisplayName("devLogin")
    class DevLogin {

        @Test
        @DisplayName("returns 200 and cookie for existing user")
        void returns200ForExistingUser() throws Exception {
            UserDto user = new UserDto();
            user.setId(1L);
            user.setUsername("alice");
            LoginController.DevLoginRequest devLoginRequest = new LoginController.DevLoginRequest("alice");

            when(userService.findUserByUsername("alice")).thenReturn((user));
            when(sessionService.createSession("alice", Role.ROLE_USER)).thenReturn("dev-session");
            when(request.isSecure()).thenReturn(true);

            ResponseEntity<?> response = loginController.devLogin(request, devLoginRequest);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
            assertNotNull(setCookie);
            assertTrue(setCookie.contains("AUTH_SESSION=dev-session"));
        }

        @Test
        @DisplayName("returns 404 for unknown user")
        void returns404ForUnknownUser() throws Exception {
            LoginController.DevLoginRequest devLoginRequest = new LoginController.DevLoginRequest("ghost");
            when(userService.findUserByUsername("ghost")).thenReturn(null);

            ResponseEntity<?> response = loginController.devLogin(request, devLoginRequest);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            @SuppressWarnings("unchecked")
            Map<String, String> body = (Map<String, String>) response.getBody();
            assertNotNull(body);
            assertEquals("User not found", body.get("message"));
        }
    }

    @Nested
    @DisplayName("whoami")
    class WhoAmI {

        @Test
        @DisplayName("returns 401 when unauthenticated")
        void returns401WhenUnauthenticated() {
            ResponseEntity<?> response = loginController.whoami(null);

            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        }

        @Test
        @DisplayName("returns username and roles when authenticated")
        void returnsUsernameAndRolesWhenAuthenticated() {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    "alice",
                    null,
                    java.util.List.of(
                            new SimpleGrantedAuthority("ROLE_USER"),
                            new SimpleGrantedAuthority("ROLE_ADMIN")));

            when(userService.findUserByUsername("alice"))
                    .thenReturn(UserDto.builder().id(1L).username("alice").build());

            ResponseEntity<?> response = loginController.whoami(auth);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertNotNull(body);
            assertEquals("alice", body.get("username"));
            @SuppressWarnings("unchecked")
            Set<String> roles = (Set<String>) body.get("roles");
            assertTrue(roles.contains("ROLE_USER"));
            assertTrue(roles.contains("ROLE_ADMIN"));
        }
    }
}
