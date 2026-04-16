package com.zhaw.backend.model.dao;

import com.zhaw.backend.model.entities.VoucherCode;
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
public class VoucherCodeDao {

    private final JdbcTemplate jdbc;

    private static final RowMapper<VoucherCode> ROW_MAPPER = (rs, rowNum) -> {
        VoucherCode vc = new VoucherCode();
        vc.setId(rs.getLong("id"));
        vc.setVoucherId(rs.getLong("voucher_id"));
        vc.setCode(rs.getString("code"));
        vc.setUserId(rs.getObject("user_id", Long.class));
        Timestamp assignedAt = rs.getTimestamp("assigned_at");
        vc.setAssignedAt(assignedAt != null ? assignedAt.toLocalDateTime() : null);
        return vc;
    };

    public Optional<VoucherCode> findAndAssign(Long voucherId, Long userId, LocalDateTime assignedAt) {
        List<VoucherCode> results = jdbc.query(
                "UPDATE voucher_code SET user_id = ?, assigned_at = ? " +
                "WHERE id = (SELECT id FROM voucher_code WHERE voucher_id = ? AND user_id IS NULL LIMIT 1 FOR UPDATE SKIP LOCKED) " +
                "RETURNING id, voucher_id, code, user_id, assigned_at",
                ROW_MAPPER,
                userId, Timestamp.valueOf(assignedAt), voucherId);
        return results.stream().findFirst();
    }
}