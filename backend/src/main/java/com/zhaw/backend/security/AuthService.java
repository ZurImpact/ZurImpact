package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;

    // MVP: In-Memory User. change to db.
    private final Map<String, UserRecord> users = new HashMap<>();

    public AuthService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;

        users.put("admin", new UserRecord(
                "admin",
                passwordEncoder.encode("secret"),
                Set.of(Role.ROLE_ADMIN, Role.ROLE_USER)
        ));
        users.put("user", new UserRecord(
                "user",
                passwordEncoder.encode("secret"),
                Set.of(Role.ROLE_USER)
        ));
    }

    public AuthResult authenticate(String username, String rawPassword) {
        UserRecord record = users.get(username);
        if (record == null || !passwordEncoder.matches(rawPassword, record.passwordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // In echt: session id / signed token erzeugen und persistieren/verifizieren
        String sessionToken = UUID.randomUUID().toString();

        return new AuthResult(record.username(), record.roles(), sessionToken);
    }

    public record AuthResult(String username, Set<Role> roles, String sessionToken) {}
    private record UserRecord(String username, String passwordHash, Set<Role> roles) {}
}
