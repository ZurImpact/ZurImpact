package com.zhaw.backend.security;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.User;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserDao userDao;

    public AuthService(PasswordEncoder passwordEncoder, UserDao userDao) {
        this.passwordEncoder = passwordEncoder;
        this.userDao = userDao;
    }

    public AuthResult authenticate(String username, String rawPassword) {
        User user = userDao.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // In echt: session id / signed token erzeugen und persistieren/verifizieren
        String sessionToken = UUID.randomUUID().toString();

        return new AuthResult(user, sessionToken);
    }

    public record AuthResult(User user, String sessionToken) {}
}
