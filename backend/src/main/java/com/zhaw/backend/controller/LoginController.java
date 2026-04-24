package com.zhaw.backend.controller;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.security.AuthService;
import com.zhaw.backend.security.SessionService;
import com.zhaw.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private static final String AUTH_COOKIE_NAME = "AUTH_SESSION";

    private final AuthService authService;
    private final SessionService sessionService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthService.AuthResult result = authService.authenticate(request.username(), request.password());
            String sessionToken = sessionService.createSession(result.username(), result.role());

            ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, sessionToken)
                    .httpOnly(true)
                    .secure(true) // local might be false, in prod true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofHours(8))
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new LoginResponse(result.username(), result.role().name()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = readAuthCookie(request);
        sessionService.invalidate(token);

        ResponseCookie deleteCookie = ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(Map.of("message", "Logged out"));
    }

    @PostMapping("/dev-login")
    public ResponseEntity<?> devLogin(HttpServletRequest httpRequest, @Valid @RequestBody DevLoginRequest request) throws Exception {
        if (userService.findUserByUsername(request.username()) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        String sessionToken = sessionService.createSession(request.username(), Role.ROLE_USER);

        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE_NAME, sessionToken)
                .httpOnly(true)
                //.secure(true)
                .secure(httpRequest.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofHours(8))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponse(request.username(), Role.ROLE_USER.name()));
    }

    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(Map.of(
                "username", authentication.getName(),
                "roles", roles
        ));
    }

    private String readAuthCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String username,
            String role
    ) {}

    public record DevLoginRequest(
            @NotBlank String username
    ) {}
}
