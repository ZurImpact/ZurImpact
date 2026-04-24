package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public AuthResult authenticate(String username, String rawPassword) {
            UserDto user = userService.findUserByUsername(username);
            if (user == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                throw new BadCredentialsException("Invalid username or password");
            }
            // In echt: session id / signed token erzeugen und persistieren/verifizieren
            String sessionToken = UUID.randomUUID().toString();
            return new AuthResult(user.getUsername(), user.getRole(), sessionToken);

    }

    public record AuthResult(String username, Role role, String sessionToken) {}
}
