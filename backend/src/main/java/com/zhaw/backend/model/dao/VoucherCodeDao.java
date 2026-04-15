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

    public Optional<VoucherCode> findAvailableByVoucherId(Long voucherId) {
        List<VoucherCode> results = jdbc.query(
                "SELECT * FROM voucher_code WHERE voucher_id = ? AND user_id IS NULL LIMIT 1",
                ROW_MAPPER, voucherId);
        return results.stream().findFirst();
    }

    public void assignToUser(Long codeId, Long userId, LocalDateTime assignedAt) {
        jdbc.update(
                "UPDATE voucher_code SET user_id = ?, assigned_at = ? WHERE id = ?",
                userId, Timestamp.valueOf(assignedAt), codeId);
    }
}