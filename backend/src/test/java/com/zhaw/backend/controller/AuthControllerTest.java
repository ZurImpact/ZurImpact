package com.zhaw.backend.controller;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.exception.BadRequestException;
import com.zhaw.backend.exception.ConflictException;
import com.zhaw.backend.exception.ForbiddenException;
import com.zhaw.backend.exception.UnauthorizedException;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.dto.auth.*;
import com.zhaw.backend.security.AuthenticatedUser;
import com.zhaw.backend.service.UserService;
import com.zhaw.backend.service.auth.AuthService;
import com.zhaw.backend.service.session.SessionService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController - Unit Tests")
class AuthControllerTest {

    @Mock
    private AuthService authService;
    @Mock
    private SessionService sessionService;
    @Mock
    private UserService userService;
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuthController controller;

    @BeforeEach
    void requestStubs() {
        lenient().when(request.isSecure()).thenReturn(true);
    }

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("returns 201 with username/email body and delegates to AuthService")
        void registerOk() {
            ResponseEntity<?> response = controller.register(
                    new RegisterRequest("frank", "frank@example.com", "secret123"));

            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            UserResponseDto body = (UserResponseDto) response.getBody();
            assertNotNull(body);
            assertEquals("frank", body.getUsername());
            assertEquals("frank@example.com", body.getEmail());
            assertNull(body.getId(), "register response must not leak internal id");
            verify(authService).register("frank", "frank@example.com", "secret123");
        }

        @Test
        @DisplayName("throws ConflictException when username or email is taken")
        void registerConflict() {
            doThrow(new IllegalArgumentException("username_taken"))
                    .when(authService).register("frank", "frank@example.com", "secret123");

            ConflictException ex = assertThrows(ConflictException.class, () -> controller.register(
                    new RegisterRequest("frank", "frank@example.com", "secret123")));
            assertEquals("username_taken", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("verifyEmail")
    class VerifyEmail {

        @Test
        @DisplayName("returns 204 on success")
        void verifyOk() {
            when(authService.verifyEmail("tok")).thenReturn(true);

            ResponseEntity<?> response = controller.verifyEmail(new VerifyEmailRequest("tok"));

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("throws BadRequestException on bad token")
        void verifyBad() {
            when(authService.verifyEmail("bad")).thenReturn(false);

            assertThrows(BadRequestException.class, () -> controller.verifyEmail(new VerifyEmailRequest("bad")));
        }
    }

    @Nested
    @DisplayName("resendVerification")
    class Resend {

        @Test
        @DisplayName("returns 204 even if the address does not exist")
        void resendNoEnumeration() {
            ResponseEntity<?> response = controller.resendVerification(new EmailRequest("ghost@example.com"));

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(authService).resendVerification("ghost@example.com");
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("returns 200 + cookie for valid credentials")
        void loginOk() {
            AuthService.AuthResult result = new AuthService.AuthResult(11L, "alice", Role.ROLE_USER);
            when(authService.authenticate("alice", "secret")).thenReturn(result);
            when(sessionService.createSession(11L)).thenReturn("session-token");

            ResponseEntity<?> response = controller.login(new LoginRequest("alice", "secret"), request);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
            assertNotNull(cookie);
            assertTrue(cookie.contains("AUTH_SESSION=session-token"));
            assertTrue(cookie.contains("HttpOnly"));
            assertTrue(cookie.contains("SameSite=Lax"));
        }

        @Test
        @DisplayName("throws UnauthorizedException for bad credentials")
        void loginBad() {
            when(authService.authenticate("alice", "wrong")).thenThrow(new BadCredentialsException("bad"));

            assertThrows(UnauthorizedException.class,
                    () -> controller.login(new LoginRequest("alice", "wrong"), request));
        }

        @Test
        @DisplayName("throws ForbiddenException email_not_verified when account is unverified")
        void loginUnverified() {
            when(authService.authenticate("alice", "secret")).thenThrow(new DisabledException("nv"));

            ForbiddenException ex = assertThrows(ForbiddenException.class,
                    () -> controller.login(new LoginRequest("alice", "secret"), request));
            assertEquals("email_not_verified", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("invalidates session and clears cookie")
        void logoutOk() {
            when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("AUTH_SESSION", "raw-token")});

            ResponseEntity<?> response = controller.logout(request);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(sessionService).invalidate("raw-token");
            String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
            assertNotNull(cookie);
            assertTrue(cookie.contains("AUTH_SESSION="));
            assertTrue(cookie.contains("Max-Age=0"));
        }
    }

    @Nested
    @DisplayName("whoami")
    class WhoAmI {

        @Test
        @DisplayName("throws UnauthorizedException when unauthenticated")
        void whoamiUnauthenticated() {
            assertThrows(UnauthorizedException.class, () -> controller.whoami(null));
        }

        @Test
        @DisplayName("returns user payload including emailVerified")
        void whoamiOk() {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    new AuthenticatedUser(11L, "alice"),
                    null,
                    java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")));
            when(userService.findUserByUsername("alice")).thenReturn(
                    UserDto.builder().id(11L).username("alice").emailVerified(true).build());

            ResponseEntity<?> response = controller.whoami(auth);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            assertEquals(11L, body.get("id"));
            assertEquals("alice", body.get("username"));
            assertEquals(Boolean.TRUE, body.get("emailVerified"));
        }
    }

    @Nested
    @DisplayName("verifyEmailChange")
    class VerifyEmailChange {

        @Test
        @DisplayName("returns 204 on success")
        void ok() {
            when(authService.confirmEmailChange("tok")).thenReturn(true);

            ResponseEntity<?> response = controller.verifyEmailChange(new VerifyEmailRequest("tok"));

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("throws BadRequestException on bad token")
        void bad() {
            when(authService.confirmEmailChange("bad")).thenReturn(false);

            assertThrows(BadRequestException.class, () -> controller.verifyEmailChange(new VerifyEmailRequest("bad")));
        }
    }

    @Nested
    @DisplayName("password reset endpoints")
    class PasswordReset {

        @Test
        @DisplayName("request returns 204 even on unknown email")
        void requestSilent() {
            ResponseEntity<?> response = controller.requestPasswordReset(
                    new EmailRequest("ghost@example.com"));

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(authService).requestPasswordReset("ghost@example.com");
        }

        @Test
        @DisplayName("confirm returns 204 on success")
        void confirmOk() {
            when(authService.confirmPasswordReset(eq("tok"), eq("newPassword123"))).thenReturn(true);

            ResponseEntity<?> response = controller.confirmPasswordReset(
                    new PasswordResetConfirmRequest("tok", "newPassword123"));

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("confirm throws BadRequestException on bad token")
        void confirmBad() {
            when(authService.confirmPasswordReset(eq("bad"), anyString())).thenReturn(false);

            assertThrows(BadRequestException.class, () -> controller.confirmPasswordReset(
                    new PasswordResetConfirmRequest("bad", "newPassword123")));
        }
    }
}
