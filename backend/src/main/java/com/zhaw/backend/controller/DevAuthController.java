package com.zhaw.backend.controller;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.dto.auth.DevLoginRequest;
import com.zhaw.backend.security.AuthCookieFilter;
import com.zhaw.backend.service.UserService;
import com.zhaw.backend.service.session.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

/**
 * Password-less login for local development. Only registered when the
 * "dev" Spring profile is active so it never reaches production.
 */
@RestController
@RequestMapping("/api/auth")
@Profile("dev")
@RequiredArgsConstructor
public class DevAuthController {

    private final UserService userService;
    private final SessionService sessionService;

    @PostMapping("/dev-login")
    public ResponseEntity<?> devLogin(@Valid @RequestBody DevLoginRequest request, HttpServletRequest httpRequest) {
        UserDto user = userService.findUserByUsername(request.username());
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        Role role = user.getRole() == null ? Role.ROLE_USER : user.getRole();
        String token = sessionService.createSession(user.getId());
        ResponseCookie cookie = ResponseCookie.from(AuthCookieFilter.AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(httpRequest.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofHours(8))
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("username", user.getUsername(), "role", role.name()));
    }
}
