package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.EmailChangeToken;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EmailChangeTokenDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<EmailChangeToken> ROW_MAPPER = (rs, rowNum) -> {
        Timestamp consumedAt = rs.getTimestamp("consumed_at");
        return EmailChangeToken.builder()
                .tokenHash(rs.getString("token_hash"))
                .userId(rs.getLong("user_id"))
                .newEmail(rs.getString("new_email"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .expiresAt(rs.getTimestamp("expires_at").toLocalDateTime())
                .consumedAt(consumedAt == null ? null : consumedAt.toLocalDateTime())
                .build();
    };

    public EmailChangeToken insert(EmailChangeToken token) {
        jdbc.update(
                "INSERT INTO email_change_token (token_hash, user_id, new_email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
                token.getTokenHash(),
                token.getUserId(),
                token.getNewEmail(),
                Timestamp.valueOf(token.getCreatedAt()),
                Timestamp.valueOf(token.getExpiresAt()));
        return token;
    }

    public Optional<EmailChangeToken> findByTokenHash(String tokenHash) {
        List<EmailChangeToken> rows = jdbc.query(
                "SELECT * FROM email_change_token WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        return rows.stream().findFirst();
    }

    public void markConsumed(String tokenHash, LocalDateTime when) {
        jdbc.update(
                "UPDATE email_change_token SET consumed_at = ? WHERE token_hash = ?",
                Timestamp.valueOf(when), tokenHash);
    }

    public int deleteByUserId(Long userId) {
        return jdbc.update("DELETE FROM email_change_token WHERE user_id = ?", userId);
    }

    public boolean hasValidPendingToken(Long userId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM email_change_token WHERE user_id = ? AND consumed_at IS NULL AND expires_at > CURRENT_TIMESTAMP",
                Integer.class, userId
        );
        return count != null && count > 0;
    }
}
