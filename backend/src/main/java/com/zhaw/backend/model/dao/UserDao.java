package com.zhaw.backend.model.dao;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.model.entities.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Data-access object for {@link User} entities.
 * Uses native SQL via JdbcTemplate — no EntityManager / Hibernate magic.
 */
@Repository
public class UserDao {

    private final JdbcTemplate jdbc;

    public UserDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ── Row mapper ──────────────────────────────────────────────────────

    private static final RowMapper<User> ROW_MAPPER = (rs, rowNum) -> {
        User u = new User();
        u.setId(rs.getLong("id"));
        u.setUsername(rs.getString("username"));
        u.setEmail(rs.getString("email"));
        u.setAddress(rs.getLong("address_id"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        String rolesStr = rs.getString("roles");
        if (rolesStr != null && !rolesStr.isBlank()) {
            Set<Role> roles = Arrays.stream(rolesStr.split(","))
                    .map(Role::valueOf)
                    .collect(Collectors.toSet());
            u.setRoles(roles);
        }
        return u;
    };

    // ── Queries ─────────────────────────────────────────────────────────

    public Optional<User> findById(Long id) {
        List<User> results = jdbc.query(
                "SELECT * FROM users WHERE id = ?",
                ROW_MAPPER, id);
        return results.stream().findFirst();
    }

    public Optional<User> findByUsername(String username) {
        List<User> results = jdbc.query(
                "SELECT * FROM users WHERE username = ?",
                ROW_MAPPER, username);
        return results.stream().findFirst();
    }

    public List<User> findAll() {
        return jdbc.query("SELECT * FROM users", ROW_MAPPER);
    }

    public User save(User user) {
        if (user.getId() == null) {
            return insert(user);
        }
        return update(user);
    }

    public void deleteById(Long id) {
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    // ── Private helpers ─────────────────────────────────────────────────

    private User insert(User user) {
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }

        String rolesStr = user.getRoles() == null ? null :
                user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO users (username, email, address_id, password_hash, roles, created_at) "
                            + "VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            if (user.getAddress() != null) {
                ps.setLong(3, user.getAddress());
            } else {
                ps.setNull(3, java.sql.Types.BIGINT);
            }
            ps.setString(4, user.getPasswordHash());
            ps.setString(5, rolesStr);
            ps.setTimestamp(6, Timestamp.valueOf(user.getCreatedAt()));
            return ps;
        }, keyHolder);

        // Postgres returns all columns in RETURN_GENERATED_KEYS, so getKey() fails.
        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null && keys.containsKey("id")) {
            user.setId(((Number) keys.get("id")).longValue());
        } else if (keyHolder.getKey() != null) {
            user.setId(keyHolder.getKey().longValue());
        }
        return user;
    }

    private User update(User user) {
        String rolesStr = user.getRoles() == null ? null :
                user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));

        jdbc.update(
                "UPDATE users SET username = ?, email = ?, address_id = ?, password_hash = ?, roles = ? WHERE id = ?",
                user.getUsername(), user.getEmail(), user.getAddress(), user.getPasswordHash(), rolesStr, user.getId());
        return user;
    }
}
