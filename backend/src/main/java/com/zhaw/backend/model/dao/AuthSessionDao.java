package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.AuthSession;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AuthSessionDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<AuthSession> ROW_MAPPER = (rs, rowNum) -> AuthSession.builder()
            .tokenHash(rs.getString("token_hash"))
            .userId(rs.getLong("user_id"))
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .expiresAt(rs.getTimestamp("expires_at").toLocalDateTime())
            .build();

    public AuthSession insert(AuthSession session) {
        jdbc.update(
                "INSERT INTO auth_session (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
                session.getTokenHash(),
                session.getUserId(),
                Timestamp.valueOf(session.getCreatedAt()),
                Timestamp.valueOf(session.getExpiresAt()));
        return session;
    }

    public Optional<AuthSession> findByTokenHash(String tokenHash) {
        List<AuthSession> rows = jdbc.query(
                "SELECT * FROM auth_session WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        return rows.stream().findFirst();
    }

    public int deleteByTokenHash(String tokenHash) {
        return jdbc.update("DELETE FROM auth_session WHERE token_hash = ?", tokenHash);
    }

    public int deleteByUserId(Long userId) {
        return jdbc.update("DELETE FROM auth_session WHERE user_id = ?", userId);
    }
}
