package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Data-access object for {@link User} entities.
 * Uses native SQL via JdbcTemplate — no EntityManager / Hibernate magic.
 */
@Repository
@RequiredArgsConstructor
public class UserDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<User> ROW_MAPPER = (rs, rowNum) -> {
        Long addressId = rs.getObject("address_id", Long.class);
        return User.builder()
                .id(rs.getLong("id"))
                .username(rs.getString("username"))
                .passwordHash(rs.getString("password_hash"))
                .role(rs.getString("role"))
                .address(addressId)
                .email(rs.getString("email"))
                .points(rs.getInt("points"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .emailVerified(rs.getBoolean("email_verified"))
                .build();
    };

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

    public Optional<User> findByEmail(String email) {
        List<User> results = jdbc.query(
                "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
                ROW_MAPPER, email);
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

    public void markEmailVerified(Long userId) {
        jdbc.update("UPDATE users SET email_verified = TRUE WHERE id = ?", userId);
    }

    public void setPasswordHash(Long userId, String newHash) {
        jdbc.update(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                newHash, userId);
    }

    private User insert(User user) {
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        if (user.getPoints() == null) {
            user.setPoints(0);
        }
        if (user.getEmailVerified() == null) {
            user.setEmailVerified(Boolean.FALSE);
        }
        if (user.getRole() == null) {
            user.setRole("ROLE_USER");
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO users (username, email, address_id, password_hash, created_at, points, "
                            + "role, email_verified) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            if (user.getAddress() == null) {
                ps.setNull(3, java.sql.Types.BIGINT);
            } else {
                ps.setLong(3, user.getAddress());
            }
            ps.setString(4, user.getPasswordHash());
            ps.setTimestamp(5, Timestamp.valueOf(user.getCreatedAt()));
            ps.setInt(6, user.getPoints() != null ? user.getPoints() : 0);
            ps.setString(7, user.getRole());
            ps.setBoolean(8, user.getEmailVerified());
            return ps;
        }, keyHolder);

        java.util.Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null && keys.containsKey("id")) {
            user.setId(((Number) keys.get("id")).longValue());
        } else if (keyHolder.getKey() != null) {
            user.setId(keyHolder.getKey().longValue());
        }
        return user;
    }

    private User update(User user) {
        jdbc.update(
                "UPDATE users SET username = ?, email = ?, password_hash = ?, address_id = ?, "
                        + "points = ?, role = ?, email_verified = ? WHERE id = ?",
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getAddress(),
                user.getPoints() != null ? user.getPoints() : 0,
                user.getRole() != null ? user.getRole() : "ROLE_USER",
                user.getEmailVerified() != null ? user.getEmailVerified() : Boolean.FALSE,
                user.getId());
        return user;
    }
}
