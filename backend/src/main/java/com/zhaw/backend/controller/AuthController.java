package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.dto.auth.EmailRequest;
import com.zhaw.backend.model.dto.auth.LoginRequest;
import com.zhaw.backend.model.dto.auth.PasswordResetConfirmRequest;
import com.zhaw.backend.model.dto.auth.RegisterRequest;
import com.zhaw.backend.model.dto.auth.VerifyEmailRequest;
import com.zhaw.backend.security.AuthCookieFilter;
import com.zhaw.backend.service.auth.AuthService;
import com.zhaw.backend.service.session.SessionService;
import com.zhaw.backend.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authentication lifecycle endpoints. Kept separate from {@code /api/users}
 * because these are public, must avoid user-enumeration responses, and have
 * a different threat model than user-resource CRUD.
 *
 * <p>CSRF is disabled at the chain level — the API is JSON-only with a
 * SameSite=Lax cookie and no cross-site forms; see {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register, verify, login, logout, password reset")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request.username(), request.email(), request.password());
        UserResponseDto body = UserResponseDto.builder()
                .username(request.username())
                .email(request.email())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        if (!authService.verifyEmail(request.token())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            AuthService.AuthResult result = authService.authenticate(request.username(), request.password());
            String token = sessionService.createSession(result.userId());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, sessionCookie(token, httpRequest, Duration.ofHours(8)).toString())
                    .body(new LoginResponse(result.username(), result.role().name()));
        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "email_not_verified"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        sessionService.invalidate(readAuthCookie(httpRequest));
        ResponseCookie deleteCookie = sessionCookie("", httpRequest, Duration.ZERO);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        var user = userService.findUserByUsername(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "roles", roles,
                "emailVerified", user.getEmailVerified() != null && user.getEmailVerified()
        ));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody EmailRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        if (!authService.confirmPasswordReset(request.token(), request.newPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
        return ResponseEntity.noContent().build();
    }

    private static ResponseCookie sessionCookie(String value, HttpServletRequest request, Duration maxAge) {
        return ResponseCookie.from(AuthCookieFilter.AUTH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    private static String readAuthCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AuthCookieFilter.AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public record LoginResponse(String username, String role) {}

    @PostMapping("/verify-email-change")
    public ResponseEntity<?> verifyEmailChange(@Valid @RequestBody VerifyEmailRequest request) {
        if (!authService.confirmEmailChange(request.token())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
        return ResponseEntity.noContent().build();
    }
}
