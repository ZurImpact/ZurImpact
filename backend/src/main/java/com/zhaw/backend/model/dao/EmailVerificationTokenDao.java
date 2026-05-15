package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.EmailVerificationToken;
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
public class EmailVerificationTokenDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<EmailVerificationToken> ROW_MAPPER = (rs, rowNum) -> {
        Timestamp consumedAt = rs.getTimestamp("consumed_at");
        return EmailVerificationToken.builder()
                .tokenHash(rs.getString("token_hash"))
                .userId(rs.getLong("user_id"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .expiresAt(rs.getTimestamp("expires_at").toLocalDateTime())
                .consumedAt(consumedAt == null ? null : consumedAt.toLocalDateTime())
                .build();
    };

    public EmailVerificationToken insert(EmailVerificationToken token) {
        jdbc.update(
                "INSERT INTO email_verification_token (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
                token.getTokenHash(),
                token.getUserId(),
                Timestamp.valueOf(token.getCreatedAt()),
                Timestamp.valueOf(token.getExpiresAt()));
        return token;
    }

    public Optional<EmailVerificationToken> findByTokenHash(String tokenHash) {
        List<EmailVerificationToken> rows = jdbc.query(
                "SELECT * FROM email_verification_token WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        return rows.stream().findFirst();
    }

    public void markConsumed(String tokenHash, LocalDateTime when) {
        jdbc.update(
                "UPDATE email_verification_token SET consumed_at = ? WHERE token_hash = ?",
                Timestamp.valueOf(when), tokenHash);
    }

    public int deleteByUserId(Long userId) {
        return jdbc.update("DELETE FROM email_verification_token WHERE user_id = ?", userId);
    }
}
